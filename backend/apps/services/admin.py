from django.contrib import admin
from .models import Service, ServiceCategory, ServiceFAQ, Testimonial


class ServiceFAQInline(admin.TabularInline):
    model = ServiceFAQ
    extra = 1


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'modality', 'is_published', 'is_featured', 'order']
    list_filter = ['category', 'modality', 'is_published', 'is_featured']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ServiceFAQInline]
    ordering = ['order', 'title']
    
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'category')}),
        ('Content', {'fields': ('short_description', 'description', 'symptoms', 'approach', 'what_to_expect')}),
        ('Media', {'fields': ('image', 'icon')}),
        ('Booking', {'fields': ('modality', 'duration_minutes', 'price', 'price_note')}),
        ('Display', {'fields': ('is_published', 'is_featured', 'order')}),
        ('SEO', {'fields': ('meta_title', 'meta_description', 'meta_keywords'), 'classes': ('collapse',)}),
    )


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['patient_name', 'service', 'rating', 'date', 'is_published', 'is_featured']
    list_filter = ['rating', 'is_published', 'is_featured', 'service']
    search_fields = ['patient_name', 'content']
    date_hierarchy = 'date'
