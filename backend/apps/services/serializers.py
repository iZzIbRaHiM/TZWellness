"""
Service serializers.
"""

from rest_framework import serializers
from .models import Service, ServiceCategory, ServiceFAQ, Testimonial


class ServiceFAQSerializer(serializers.ModelSerializer):
    """Serializer for service FAQs."""
    
    class Meta:
        model = ServiceFAQ
        fields = ['id', 'question', 'answer', 'order']


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for service categories."""
    service_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'service_count']
    
    def get_service_count(self, obj):
        return obj.services.filter(is_published=True).count()


class ServiceListSerializer(serializers.ModelSerializer):
    """Serializer for service list view."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'slug', 'short_description', 'image', 'icon',
            'category', 'category_name', 'modality', 'duration_minutes',
            'price', 'price_note', 'is_featured'
        ]


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Serializer for service detail view."""
    category = ServiceCategorySerializer(read_only=True)
    faqs = ServiceFAQSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'slug', 'short_description', 'description',
            'symptoms', 'approach', 'what_to_expect', 'image', 'icon',
            'category', 'modality', 'duration_minutes', 'price', 'price_note',
            'is_featured', 'faqs', 'meta_title', 'meta_description',
            'created_at', 'updated_at'
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    """Serializer for testimonials."""
    service_title = serializers.CharField(source='service.title', read_only=True)
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'patient_name', 'patient_location', 'content',
            'rating', 'date', 'is_verified', 'service', 'service_title'
        ]


class ServiceAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for full CRUD operations."""
    faqs = ServiceFAQSerializer(many=True, required=False)
    
    class Meta:
        model = Service
        fields = '__all__'
    
    def create(self, validated_data):
        faqs_data = validated_data.pop('faqs', [])
        service = Service.objects.create(**validated_data)
        
        for faq_data in faqs_data:
            ServiceFAQ.objects.create(service=service, **faq_data)
        
        return service
    
    def update(self, instance, validated_data):
        faqs_data = validated_data.pop('faqs', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if faqs_data is not None:
            instance.faqs.all().delete()
            for faq_data in faqs_data:
                ServiceFAQ.objects.create(service=instance, **faq_data)
        
        return instance
