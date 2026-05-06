from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F
from .models import Order, OrderItem, Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from products.models import Product
from promotions.models import CouponUsage
from promotions.services import apply_coupon_to_cart, clear_cart_coupon, validate_coupon_for_cart


def refresh_cart_coupon(cart, user):
    if not cart.coupon:
        return cart

    error = validate_coupon_for_cart(cart.coupon, user, cart)
    if error:
        return clear_cart_coupon(cart)
    return apply_coupon_to_cart(cart, cart.coupon)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.select_related('coupon').get_or_create(user=request.user)
        refresh_cart_coupon(cart, request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response({'error': 'Miktar en az 1 olmalıdır.'}, status=400)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Ürün bulunamadı.'}, status=404)

        # Stok kontrolü
        if not product.in_stock:
            return Response({'error': 'Bu ürün stokta yok.'}, status=400)

        # Sepette zaten varsa mevcut adet + yeni adedi kontrol et
        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        total_requested = quantity + (existing_item.quantity if existing_item else 0)

        if total_requested > product.stock:
            return Response(
                {'error': f'Yetersiz stok. Mevcut stok: {product.stock}, sepetinizde: {existing_item.quantity if existing_item else 0}.'},
                status=400,
            )

        if existing_item:
            existing_item.quantity = total_requested
            existing_item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity)

        refresh_cart_coupon(cart, request.user)
        return Response(CartSerializer(cart).data)


class CartUpdateView(APIView):
    """Sepetteki bir ürünün miktarını günceller."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        quantity = int(request.data.get('quantity', 1))
        if quantity < 1:
            return Response({'error': 'Miktar en az 1 olmalıdır.'}, status=400)

        try:
            item = CartItem.objects.select_related('product', 'cart').get(
                id=item_id, cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response({'error': 'Ürün bulunamadı.'}, status=404)

        if quantity > item.product.stock:
            return Response(
                {'error': f'Yetersiz stok. Mevcut stok: {item.product.stock}.'},
                status=400,
            )

        item.quantity = quantity
        item.save()
        refresh_cart_coupon(item.cart, request.user)
        return Response(CartSerializer(item.cart).data)


class CartRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
            cart = item.cart
            item.delete()
            refresh_cart_coupon(cart, request.user)
            return Response({'message': 'Ürün sepetten kaldırıldı.'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Ürün bulunamadı.'}, status=404)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Sepetiniz boş.'}, status=400)

        cart_items = cart.cart_items.select_related('product').all()
        if not cart_items:
            return Response({'error': 'Sepetiniz boş.'}, status=400)

        shipping_address = request.data.get('shipping_address', '')
        if not shipping_address:
            return Response({'error': 'Teslimat adresi gerekli.'}, status=400)

        # Atomic transaction — stok düşürme ve sipariş oluşturma tek blokta
        with transaction.atomic():
            cart = Cart.objects.select_for_update().select_related('coupon').get(id=cart.id)

            # select_for_update ile race condition önleme
            product_ids = [item.product_id for item in cart_items]
            products = {
                p.id: p
                for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            # Tüm ürünlerin stok kontrolü
            for item in cart_items:
                product = products.get(item.product_id)
                if not product or not product.is_active:
                    return Response(
                        {'error': f'"{item.product.name}" artık mevcut değil.'},
                        status=400,
                    )
                if item.quantity > product.stock:
                    return Response(
                        {'error': f'"{product.name}" için yetersiz stok. Mevcut: {product.stock}, istenen: {item.quantity}.'},
                        status=400,
                    )

            if cart.coupon:
                error = validate_coupon_for_cart(cart.coupon, request.user, cart)
                if error:
                    clear_cart_coupon(cart)
                    return Response({'error': error}, status=400)
                apply_coupon_to_cart(cart, cart.coupon)

            # Sipariş oluştur
            order = Order.objects.create(
                user=request.user,
                shipping_address=shipping_address,
                total_price=cart.total,
            )

            # Sipariş kalemleri + stok düşürme
            for item in cart_items:
                product = products[item.product_id]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    price=product.price,
                )
                # Atomic stok düşürme — F() ile DB seviyesinde
                Product.objects.filter(id=product.id).update(
                    stock=F('stock') - item.quantity
                )

            if cart.coupon:
                CouponUsage.objects.create(coupon=cart.coupon, user=request.user, order=order)
                type(cart.coupon).objects.filter(id=cart.coupon_id).update(used_count=F('used_count') + 1)

            # Sepeti temizle
            cart_items.delete()
            clear_cart_coupon(cart)

        return Response(OrderSerializer(order).data, status=201)
