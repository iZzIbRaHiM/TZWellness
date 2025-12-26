from django.contrib import admin
from .models import Event, EventCategory, EventRegistration


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'event_type']
    prepopulated_fields = {'slug': ('name',)}


class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0
    readonly_fields = ['confirmation_code', 'created_at']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'start_datetime', 'status', 'modality', 'is_published', 'is_featured']
    list_filter = ['category', 'status', 'modality', 'is_published', 'is_featured']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [EventRegistrationInline]
    date_hierarchy = 'start_datetime'
    
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'category', 'host')}),
        ('Content', {'fields': ('short_description', 'description', 'what_to_expect', 'image', 'video_url')}),
        ('Schedule', {'fields': ('start_datetime', 'end_datetime', 'timezone')}),
        ('Location', {'fields': ('modality', 'location', 'meeting_link')}),
        ('Capacity', {'fields': ('max_attendees', 'current_attendees')}),
        ('Pricing', {'fields': ('is_free', 'price')}),
        ('Registration', {'fields': ('registration_required', 'registration_deadline')}),
        ('Status', {'fields': ('status', 'is_published', 'is_featured')}),
        ('SEO', {'fields': ('meta_title', 'meta_description', 'meta_keywords'), 'classes': ('collapse',)}),
    )


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'event', 'confirmation_code', 'is_confirmed', 'attended']
    list_filter = ['event', 'is_confirmed', 'attended']
    search_fields = ['name', 'email', 'confirmation_code']
