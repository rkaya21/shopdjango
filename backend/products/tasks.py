from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


def get_stock_alert_recipients():
    configured = getattr(settings, 'STOCK_ALERT_EMAILS', [])
    if configured:
        return configured
    return [email for _, email in getattr(settings, 'ADMINS', [])]


@shared_task
def send_low_stock_email(product_id, current_stock):
    from .models import Product

    recipients = get_stock_alert_recipients()
    if not recipients:
        return

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return

    send_mail(
        subject=f'ShopDjango — Düşük stok uyarısı: {product.name}',
        message=(
            f'"{product.name}" ürününün stoğu kritik seviyeye düştü.\n\n'
            f'Mevcut stok: {current_stock}\n'
            f'Ürün ID: {product.id}\n\n'
            f'Lütfen admin panelinden stok durumunu kontrol edin.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipients,
        fail_silently=True,
    )
