from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Cart
from .models import Coupon
from .serializers import CouponSerializer, CouponApplySerializer
from .services import apply_coupon_to_cart, clear_cart_coupon, validate_coupon_for_cart


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

        # Sepet kontrolü
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Sepetiniz boş.'}, status=400)

        error = validate_coupon_for_cart(coupon, request.user, cart)
        if error:
            return Response({'error': error}, status=400)

        apply_coupon_to_cart(cart, coupon)

        return Response({
            'success': True,
            'coupon': CouponSerializer(coupon).data,
            'discount': float(cart.discount_amount),
            'new_total': float(cart.total),
        })


class CouponRemoveView(APIView):
    """Kuponu sepetten kaldır."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'success': True, 'message': 'Kupon kaldırıldı.'})

        clear_cart_coupon(cart)
        return Response({'success': True, 'message': 'Kupon kaldırıldı.'})
