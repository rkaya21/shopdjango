from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_order_confirmation_email(order_id):
    """Sipariş oluşturulduğunda onay e-postası gönderir."""
    from orders.models import Order
    try:
        order = Order.objects.select_related('user').get(id=order_id)
    except Order.DoesNotExist:
        return

    send_mail(
        subject=f'ShopDjango — Sipariş #{order.id} Onayı',
        message=(
            f'Merhaba {order.user.username},\n\n'
            f'Siparişiniz #{order.id} başarıyla oluşturuldu.\n'
            f'Toplam: {order.total_price} TL\n'
            f'Teslimat adresi: {order.shipping_address}\n\n'
            f'Siparişinizi profilinizden takip edebilirsiniz.\n\n'
            f'Teşekkürler,\nShopDjango Ekibi'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )


@shared_task
def send_order_status_update_email(order_id):
    """Sipariş durumu değiştiğinde bildirim e-postası gönderir."""
    from orders.models import Order
    try:
        order = Order.objects.select_related('user').get(id=order_id)
    except Order.DoesNotExist:
        return

    status_labels = {
        'pending': 'Beklemede',
        'confirmed': 'Onaylandı',
        'shipped': 'Kargoya Verildi',
        'delivered': 'Teslim Edildi',
        'cancelled': 'İptal Edildi',
    }

    send_mail(
        subject=f'ShopDjango — Sipariş #{order.id} Güncelleme',
        message=(
            f'Merhaba {order.user.username},\n\n'
            f'Sipariş #{order.id} durumu güncellendi:\n'
            f'Yeni durum: {status_labels.get(order.status, order.status)}\n\n'
            f'Teşekkürler,\nShopDjango Ekibi'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )


@shared_task
def send_welcome_email(user_id):
    """Kayıt sonrası hoş geldin e-postası gönderir."""
    from users.models import User
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    send_mail(
        subject='ShopDjango — Hoş Geldiniz!',
        message=(
            f'Merhaba {user.username},\n\n'
            f'ShopDjango ailesine hoş geldiniz! 🎉\n'
            f'Hesabınız başarıyla oluşturuldu.\n\n'
            f'Alışverişe başlamak için sitemizi ziyaret edin.\n\n'
            f'Teşekkürler,\nShopDjango Ekibi'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
