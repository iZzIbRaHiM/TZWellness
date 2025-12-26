"""
Service views.
"""

from rest_framework import viewsets, generics, filters
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Service, ServiceCategory, Testimonial
from .serializers import (
    ServiceListSerializer,
    ServiceDetailSerializer,
    ServiceCategorySerializer,
    TestimonialSerializer,
    ServiceAdminSerializer,
)


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for service categories."""
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for public service listing and detail.
    """
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'modality', 'is_featured']
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['order', 'title', 'created_at']
    
    def get_queryset(self):
        return Service.objects.filter(is_published=True).select_related('category').prefetch_related('faqs')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceListSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured services."""
        services = self.get_queryset().filter(is_featured=True)[:6]
        serializer = ServiceListSerializer(services, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class TestimonialListView(generics.ListAPIView):
    """Public list of testimonials."""
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['service', 'is_featured']
    
    def get_queryset(self):
        return Testimonial.objects.filter(is_published=True).select_related('service')


# Admin Views
class ServiceAdminViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for full service CRUD."""
    queryset = Service.objects.all().select_related('category').prefetch_related('faqs')
    serializer_class = ServiceAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'slug'
