"""
Common serializer mixins and base classes.
"""

from rest_framework import serializers


class SuccessResponseMixin:
    """Mixin to wrap responses in success envelope."""
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'success': True,
            'data': data
        }


class TimestampMixin(serializers.Serializer):
    """Mixin for timestamp fields."""
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class HoneypotMixin(serializers.Serializer):
    """
    Honeypot field mixin for bot detection.
    The field should be empty - if filled, it's a bot.
    """
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Bot detected")
        return value
