from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)

    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_type_display', 'discount_value', 'min_order_amount']


class CouponApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=30)
