"""
Blog views.
"""

from rest_framework import viewsets, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import BlogPost, BlogCategory, BlogTag
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogCategorySerializer,
    BlogTagSerializer,
    BlogPostAdminSerializer,
    RelatedPostSerializer,
)


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for blog categories."""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class BlogTagViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for blog tags."""
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for public blog posts.
    Optimized for SSR with Next.js.
    """
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_featured']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'views', 'title']
    
    def get_queryset(self):
        queryset = BlogPost.objects.filter(
            is_published=True
        ).select_related('category', 'author').prefetch_related('tags')
        
        # Filter by tag
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get post detail and increment views."""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts."""
        posts = self.get_queryset().filter(is_featured=True)[:6]
        serializer = BlogPostListSerializer(posts, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Real-time search with debounce support."""
        query = request.query_params.get('q', '')
        
        if len(query) < 2:
            return Response({
                'success': True,
                'data': []
            })
        
        posts = self.get_queryset().filter(
            Q(title__icontains=query) |
            Q(excerpt__icontains=query) |
            Q(content__icontains=query)
        )[:10]
        
        serializer = BlogPostListSerializer(posts, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related posts based on category and tags."""
        post = self.get_object()
        
        related = BlogPost.objects.filter(
            is_published=True
        ).exclude(id=post.id)
        
        # Filter by same category or tags
        if post.category:
            related = related.filter(
                Q(category=post.category) |
                Q(tags__in=post.tags.all())
            ).distinct()
        
        related = related[:4]
        serializer = RelatedPostSerializer(related, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


# Admin Views
class BlogPostAdminViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for blog post CRUD."""
    queryset = BlogPost.objects.all().select_related('category', 'author').prefetch_related('tags')
    serializer_class = BlogPostAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_published', 'is_featured']
    search_fields = ['title', 'excerpt']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
