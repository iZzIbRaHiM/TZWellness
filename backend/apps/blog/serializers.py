"""
Blog serializers.
"""

from rest_framework import serializers
from .models import BlogPost, BlogCategory, BlogTag


class BlogTagSerializer(serializers.ModelSerializer):
    """Serializer for blog tags."""
    
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


class BlogCategorySerializer(serializers.ModelSerializer):
    """Serializer for blog categories."""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'color', 'post_count']
    
    def get_post_count(self, obj):
        return obj.posts.filter(is_published=True).count()


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for blog post list view."""
    category = BlogCategorySerializer(read_only=True)
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'category', 'tags', 'author_name', 'read_time_minutes',
            'published_at', 'is_featured', 'views'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog post detail view (SSR)."""
    category = BlogCategorySerializer(read_only=True)
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_bio = serializers.CharField(source='author.bio', read_only=True)
    author_avatar = serializers.ImageField(source='author.avatar', read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    
    # SEO fields
    og_title = serializers.SerializerMethodField()
    og_description = serializers.SerializerMethodField()
    og_image = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content',
            'featured_image', 'featured_image_alt',
            'category', 'tags',
            'author_name', 'author_bio', 'author_avatar',
            'read_time_minutes', 'views',
            'published_at', 'updated_at',
            'meta_title', 'meta_description', 'meta_keywords',
            'og_title', 'og_description', 'og_image'
        ]
    
    def get_og_title(self, obj):
        return obj.meta_title or obj.title
    
    def get_og_description(self, obj):
        return obj.meta_description or obj.excerpt[:160]
    
    def get_og_image(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None


class BlogPostAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for full CRUD."""
    
    class Meta:
        model = BlogPost
        fields = '__all__'


class RelatedPostSerializer(serializers.ModelSerializer):
    """Serializer for related posts."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'featured_image', 'category_name', 'published_at']
