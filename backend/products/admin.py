from django.contrib import admin
from .models import Category, Product, Review, StockMovement, Wishlist
from .services import record_product_stock_set


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

    def save_model(self, request, obj, form, change):
        previous_stock = None
        if change:
            previous_stock = Product.objects.get(pk=obj.pk).stock

        super().save_model(request, obj, form, change)

        if previous_stock is None:
            record_product_stock_set(obj, 0, 'initial_stock')
        else:
            record_product_stock_set(obj, previous_stock, 'admin_adjustment')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['product', 'quantity_change', 'reason', 'created_at']
    list_filter = ['reason', 'created_at']
    search_fields = ['product__name']
    readonly_fields = ['product', 'quantity_change', 'reason', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved']
    search_fields = ['product__name', 'user__username', 'comment']
    list_editable = ['is_approved']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
