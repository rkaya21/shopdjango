from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.db.models import F
from .models import Order
from products.models import Product


@receiver(pre_save, sender=Order)
def handle_order_cancellation(sender, instance, **kwargs):
    """Sipariş iptal edildiğinde stokları geri yükle."""
    if not instance.pk:
        return

    try:
        old_order = Order.objects.get(pk=instance.pk)
    except Order.DoesNotExist:
        return

    if old_order.status != 'cancelled' and instance.status == 'cancelled':
        for item in instance.items.select_related('product').all():
            Product.objects.filter(id=item.product_id).update(
                stock=F('stock') + item.quantity
            )


@receiver(pre_save, sender=Order)
def handle_order_status_email(sender, instance, **kwargs):
    """Sipariş durumu değiştiğinde bildirim e-postası gönder."""
    if not instance.pk:
        return

    try:
        old_order = Order.objects.get(pk=instance.pk)
    except Order.DoesNotExist:
        return

    if old_order.status != instance.status:
        from .tasks import send_order_status_update_email
        # delay() ile asenkron — Celery çalışmazsa hata vermez
        try:
            send_order_status_update_email.delay(instance.pk)
        except Exception:
            pass


@receiver(post_save, sender=Order)
def handle_new_order_email(sender, instance, created, **kwargs):
    """Yeni sipariş oluşturulduğunda onay e-postası gönder."""
    if created:
        from .tasks import send_order_confirmation_email
        try:
            send_order_confirmation_email.delay(instance.pk)
        except Exception:
            pass
