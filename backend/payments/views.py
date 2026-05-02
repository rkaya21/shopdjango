import random
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F

from orders.models import Order
from products.models import Product
from .models import Payment
from .serializers import PaymentSerializer, PaymentInitiateSerializer


class PaymentInitiateView(APIView):
    """
    Ödeme başlatma — simülasyon bazlı.
    Gerçek payment gateway yerine %90 başarı oranıyla simüle eder.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Siparişi bul
        try:
            order = Order.objects.get(id=data['order_id'], user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Sipariş bulunamadı.'}, status=404)

        # Siparişte zaten ödeme var mı?
        if hasattr(order, 'payment') and order.payment.status == 'completed':
            return Response({'error': 'Bu sipariş için ödeme zaten tamamlanmış.'}, status=400)

        # Sipariş pending durumda mı?
        if order.status != 'pending':
            return Response({'error': 'Sadece beklemede olan siparişler için ödeme yapılabilir.'}, status=400)

        method = data['method']
        card_last_four = ''

        if method == 'credit_card':
            card_number = data['card_number'].replace(' ', '').replace('-', '')
            card_last_four = card_number[-4:]

        # ── Ödeme simülasyonu ──
        # Gerçek projede burada Stripe/Iyzico API çağrısı olur
        is_success = random.random() < 0.90  # %90 başarı oranı

        # Kapıda ödeme her zaman başarılı
        if method == 'cash_on_delivery':
            is_success = True

        with transaction.atomic():
            # Mevcut payment varsa güncelle, yoksa oluştur
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    'amount': order.total_price,
                    'method': method,
                    'card_last_four': card_last_four,
                }
            )

            if not created:
                payment.method = method
                payment.card_last_four = card_last_four

            if is_success:
                payment.status = 'completed'
                payment.provider_response = {
                    'simulation': True,
                    'message': 'Ödeme başarıyla tamamlandı.',
                    'method': method,
                }
                payment.save()

                # Siparişi onayla
                order.status = 'confirmed'
                order.save(update_fields=['status', 'updated_at'])

                return Response({
                    'success': True,
                    'message': 'Ödeme başarıyla tamamlandı.',
                    'payment': PaymentSerializer(payment).data,
                }, status=200)
            else:
                payment.status = 'failed'
                payment.provider_response = {
                    'simulation': True,
                    'message': 'Ödeme başarısız. Lütfen tekrar deneyin.',
                    'error_code': 'SIMULATED_FAILURE',
                }
                payment.save()

                return Response({
                    'success': False,
                    'message': 'Ödeme başarısız oldu. Lütfen tekrar deneyin.',
                    'payment': PaymentSerializer(payment).data,
                }, status=402)


class PaymentListView(generics.ListAPIView):
    """Kullanıcının ödeme geçmişi."""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)
