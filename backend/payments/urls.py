from django.urls import path
from .views import PaymentInitiateView, PaymentListView

urlpatterns = [
    path('initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('history/', PaymentListView.as_view(), name='payment-history'),
]
