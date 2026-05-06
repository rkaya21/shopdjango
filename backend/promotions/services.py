from decimal import Decimal

from django.utils import timezone

from .models import CouponUsage


def calculate_discount(cart_total, coupon):
    if coupon.discount_type == 'percent':
        discount = cart_total * coupon.discount_value / Decimal('100')
    else:
        discount = coupon.discount_value
    return min(discount, cart_total).quantize(Decimal('0.01'))


def validate_coupon_for_cart(coupon, user, cart, exclude_used=False):
    now = timezone.now()

    if not coupon.is_active:
        return 'Bu kupon aktif değil.'
    if now < coupon.valid_from:
        return 'Bu kupon henüz geçerli değil.'
    if now > coupon.valid_until:
        return 'Bu kuponun süresi dolmuş.'
    if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
        return 'Bu kuponun kullanım limiti dolmuş.'
    if not exclude_used and CouponUsage.objects.filter(coupon=coupon, user=user).exists():
        return 'Bu kuponu daha önce kullandınız.'
    if cart.subtotal < coupon.min_order_amount:
        return f'Bu kupon için minimum sipariş tutarı: {coupon.min_order_amount} TL.'

    return None


def apply_coupon_to_cart(cart, coupon):
    cart.discount_amount = calculate_discount(cart.subtotal, coupon)
    cart.coupon = coupon
    cart.save(update_fields=['coupon', 'discount_amount'])
    return cart


def clear_cart_coupon(cart):
    cart.coupon = None
    cart.discount_amount = Decimal('0.00')
    cart.save(update_fields=['coupon', 'discount_amount'])
    return cart
