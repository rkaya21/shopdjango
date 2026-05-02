from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'method', 'method_display',
            'status', 'status_display', 'transaction_id',
            'card_last_four', 'created_at',
        ]
        read_only_fields = ['id', 'amount', 'status', 'transaction_id', 'created_at']


class PaymentInitiateSerializer(serializers.Serializer):
    """Ödeme başlatma isteği için input serializer."""
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES)
    # Kredi kartı alanları — sadece method=credit_card olduğunda zorunlu
    card_number = serializers.CharField(max_length=19, required=False)
    card_expiry = serializers.CharField(max_length=5, required=False)  # MM/YY
    card_cvv = serializers.CharField(max_length=4, required=False)
    card_holder = serializers.CharField(max_length=100, required=False)

    def validate(self, attrs):
        if attrs['method'] == 'credit_card':
            for field in ['card_number', 'card_expiry', 'card_cvv', 'card_holder']:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: 'Kredi kartı ödemesi için bu alan zorunludur.'})
            # Basit kart numarası validasyonu
            card = attrs['card_number'].replace(' ', '').replace('-', '')
            if not card.isdigit() or len(card) < 13 or len(card) > 19:
                raise serializers.ValidationError({'card_number': 'Geçersiz kart numarası.'})
        return attrs
