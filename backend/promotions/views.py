from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Cart
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, CouponApplySerializer


class CouponApplyView(APIView):
    """Kuponu sepete uygula."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].strip().upper()

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Geçersiz kupon kodu.'}, status=400)

        now = timezone.now()

        if not coupon.is_active:
            return Response({'error': 'Bu kupon aktif değil.'}, status=400)
        if now < coupon.valid_from:
            return Response({'error': 'Bu kupon henüz geçerli değil.'}, status=400)
        if now > coupon.valid_until:
            return Response({'error': 'Bu kuponun süresi dolmuş.'}, status=400)
        if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
            return Response({'error': 'Bu kuponun kullanım limiti dolmuş.'}, status=400)

        # Kullanıcı daha önce kullanmış mı?
        if CouponUsage.objects.filter(coupon=coupon, user=request.user).exists():
            return Response({'error': 'Bu kuponu daha önce kullandınız.'}, status=400)

        # Sepet kontrolü
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Sepetiniz boş.'}, status=400)

        cart_total = cart.total
        if cart_total < coupon.min_order_amount:
            return Response(
                {'error': f'Bu kupon için minimum sipariş tutarı: {coupon.min_order_amount} TL.'},
                status=400,
            )

        # İndirim hesapla
        if coupon.discount_type == 'percent':
            discount = cart_total * coupon.discount_value / 100
        else:
            discount = coupon.discount_value

        discount = min(discount, cart_total)  # İndirim sepet tutarını aşamaz

        return Response({
            'success': True,
            'coupon': CouponSerializer(coupon).data,
            'discount': float(round(discount, 2)),
            'new_total': float(round(cart_total - discount, 2)),
        })


class CouponRemoveView(APIView):
    """Kuponu sepetten kaldır."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'success': True, 'message': 'Kupon kaldırıldı.'})
