from django.contrib import admin
from .models import BlogPost, BlogCategory, BlogTag, BlogPostImage


class BlogPostImageInline(admin.TabularInline):
    model = BlogPostImage
    extra = 1


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'is_published', 'is_featured', 'published_at', 'views']
    list_filter = ['category', 'is_published', 'is_featured', 'author']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    inlines = [BlogPostImageInline]
    date_hierarchy = 'published_at'
    
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'author')}),
        ('Content', {'fields': ('excerpt', 'content', 'featured_image', 'featured_image_alt')}),
        ('Categorization', {'fields': ('category', 'tags')}),
        ('Publishing', {'fields': ('is_published', 'is_featured', 'published_at')}),
        ('SEO', {'fields': ('meta_title', 'meta_description', 'meta_keywords'), 'classes': ('collapse',)}),
    )
