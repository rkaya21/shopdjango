from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductDetailView,
    ReviewListView, ReviewCreateView,
    WishlistView, WishlistToggleView,
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # Favoriler
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),

    # Ürün detay + yorumlar (slug bazlı — en sonda olmalı)
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('<slug:slug>/reviews/', ReviewListView.as_view(), name='review-list'),
    path('<slug:slug>/reviews/create/', ReviewCreateView.as_view(), name='review-create'),
]