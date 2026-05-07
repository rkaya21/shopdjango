from django.conf import settings
from django.db.models import F

from .models import Product, StockMovement


LOW_STOCK_THRESHOLD = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)


def record_stock_movement(product, quantity_change, reason):
    return StockMovement.objects.create(
        product=product,
        quantity_change=quantity_change,
        reason=reason,
    )


def queue_low_stock_alert(product_id, current_stock, previous_stock=None):
    if current_stock >= LOW_STOCK_THRESHOLD:
        return
    if previous_stock is not None and previous_stock < LOW_STOCK_THRESHOLD:
        return

    from .tasks import send_low_stock_email

    try:
        send_low_stock_email.delay(product_id, current_stock)
    except Exception:
        pass


def adjust_product_stock(product, quantity_change, reason):
    previous_stock = product.stock
    Product.objects.filter(id=product.id).update(stock=F('stock') + quantity_change)
    record_stock_movement(product, quantity_change, reason)

    updated_product = Product.objects.only('id', 'stock').get(id=product.id)
    queue_low_stock_alert(updated_product.id, updated_product.stock, previous_stock)
    return updated_product.stock


def record_product_stock_set(product, previous_stock, reason):
    quantity_change = product.stock - previous_stock
    if quantity_change == 0:
        return

    record_stock_movement(product, quantity_change, reason)
    queue_low_stock_alert(product.id, product.stock, previous_stock)
