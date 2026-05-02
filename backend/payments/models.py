import uuid
from django.db import models
from orders.models import Order


class Payment(models.Model):
    METHOD_CHOICES = [
        ('credit_card', 'Kredi Kartı'),
        ('bank_transfer', 'Havale/EFT'),
        ('cash_on_delivery', 'Kapıda Ödeme'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('completed', 'Tamamlandı'),
        ('failed', 'Başarısız'),
        ('refunded', 'İade Edildi'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card_last_four = models.CharField(max_length=4, blank=True, default='')
    provider_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Ödeme #{self.transaction_id} — {self.get_status_display()}'

    class Meta:
        ordering = ['-created_at']
