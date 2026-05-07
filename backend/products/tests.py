from unittest.mock import patch

from django.test import TestCase

from .models import Category, Product, StockMovement
from .services import adjust_product_stock, queue_low_stock_alert, record_product_stock_set


class StockManagementTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Elektronik', slug='elektronik')
        self.product = Product.objects.create(
            category=self.category,
            name='Kulaklık',
            slug='kulaklik',
            description='Kablosuz kulaklık',
            price='100.00',
            stock=6,
        )

    @patch('products.services.queue_low_stock_alert')
    def test_adjust_product_stock_records_movement_and_alerts_with_new_stock(self, alert_mock):
        new_stock = adjust_product_stock(self.product, -2, 'order_created')

        self.product.refresh_from_db()
        self.assertEqual(new_stock, 4)
        self.assertEqual(self.product.stock, 4)
        self.assertTrue(
            StockMovement.objects.filter(
                product=self.product,
                quantity_change=-2,
                reason='order_created',
            ).exists()
        )
        alert_mock.assert_called_once_with(self.product.id, 4, 6)

    @patch('products.services.queue_low_stock_alert')
    def test_record_product_stock_set_logs_admin_adjustment(self, alert_mock):
        self.product.stock = 9

        record_product_stock_set(self.product, previous_stock=6, reason='admin_adjustment')

        self.assertTrue(
            StockMovement.objects.filter(
                product=self.product,
                quantity_change=3,
                reason='admin_adjustment',
            ).exists()
        )
        alert_mock.assert_called_once_with(self.product.id, 9, 6)

    @patch('products.tasks.send_low_stock_email.delay')
    def test_low_stock_alert_only_queues_when_crossing_threshold(self, delay_mock):
        queue_low_stock_alert(self.product.id, current_stock=4, previous_stock=6)
        queue_low_stock_alert(self.product.id, current_stock=3, previous_stock=4)
        queue_low_stock_alert(self.product.id, current_stock=5, previous_stock=6)

        delay_mock.assert_called_once_with(self.product.id, 4)
