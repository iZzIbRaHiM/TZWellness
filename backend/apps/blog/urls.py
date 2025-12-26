"""
Blog URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    BlogPostViewSet,
    BlogCategoryViewSet,
    BlogTagViewSet,
    BlogPostAdminViewSet,
)

app_name = 'blog'

router = DefaultRouter()
router.register(r'categories', BlogCategoryViewSet, basename='category')
router.register(r'tags', BlogTagViewSet, basename='tag')
router.register(r'posts', BlogPostViewSet, basename='post')

admin_router = DefaultRouter()
admin_router.register(r'', BlogPostAdminViewSet, basename='admin-post')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
