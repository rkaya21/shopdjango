from django.urls import path
from .views import CartView, CartAddView, CartUpdateView, CartRemoveView, OrderListView, OrderCreateView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', CartAddView.as_view(), name='cart-add'),
    path('cart/update/<int:item_id>/', CartUpdateView.as_view(), name='cart-update'),
    path('cart/remove/<int:item_id>/', CartRemoveView.as_view(), name='cart-remove'),
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
]