"""
Blog models for content management.
"""

from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.core.models import TimeStampedModel, PublishableModel, SEOModel


class BlogCategory(TimeStampedModel):
    """Category for blog posts."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#064E3B', help_text="Hex color code")
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Blog Category'
        verbose_name_plural = 'Blog Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogTag(TimeStampedModel):
    """Tags for blog posts."""
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True)
    
    class Meta:
        verbose_name = 'Blog Tag'
        verbose_name_plural = 'Blog Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(TimeStampedModel, PublishableModel, SEOModel):
    """
    Blog post model with full SEO support.
    Designed for SSR with Next.js.
    """
    
    # Content
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    excerpt = models.TextField(max_length=500, help_text="Short summary for listings")
    content = models.TextField(help_text="Full article content (supports Markdown)")
    
    # Media
    featured_image = models.ImageField(upload_to='blog/', null=True, blank=True)
    featured_image_alt = models.CharField(max_length=200, blank=True)
    
    # Categorization
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts'
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')
    
    # Author
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='blog_posts'
    )
    
    # Metrics
    read_time_minutes = models.PositiveIntegerField(default=5)
    views = models.PositiveIntegerField(default=0)
    
    # Display
    is_featured = models.BooleanField(default=False, db_index=True)
    
    class Meta:
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['category', '-published_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Calculate read time (200 words per minute)
        if self.content:
            word_count = len(self.content.split())
            self.read_time_minutes = max(1, word_count // 200)
        
        super().save(*args, **kwargs)
    
    def increment_views(self):
        """Increment view count."""
        self.views += 1
        self.save(update_fields=['views'])


class BlogPostImage(TimeStampedModel):
    """Additional images for blog posts."""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='blog/images/')
    alt_text = models.CharField(max_length=200, blank=True)
    caption = models.CharField(max_length=300, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.post.title} - Image {self.order}"
