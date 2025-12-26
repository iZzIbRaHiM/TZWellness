"""
Management command to seed initial data for TF Welfare.
Creates ONLY ONE admin user, services, and sample data.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User
from apps.services.models import Service, ServiceCategory


class Command(BaseCommand):
    help = 'Seed initial data for TF Welfare platform - ONE ADMIN ONLY'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding TF Welfare database...\n')
        
        # Create ONLY ONE Admin User
        admin, created = User.objects.get_or_create(
            email='admin@tfwelfare.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Admin created: admin@tfwelfare.com / admin123'))
        else:
            self.stdout.write(f'  Admin already exists: admin@tfwelfare.com')
        
        # Create Service Categories
        categories_data = [
            {'name': 'Metabolic Health', 'slug': 'metabolic-health', 'icon': 'activity', 'order': 1},
            {'name': 'Endocrine Care', 'slug': 'endocrine-care', 'icon': 'heart', 'order': 2},
            {'name': 'Wellness', 'slug': 'wellness', 'icon': 'leaf', 'order': 3},
        ]
        
        for cat_data in categories_data:
            cat, created = ServiceCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Category created: {cat.name}'))
        
        metabolic = ServiceCategory.objects.get(slug='metabolic-health')
        endocrine = ServiceCategory.objects.get(slug='endocrine-care')
        wellness = ServiceCategory.objects.get(slug='wellness')
        
        # Create Services
        services_data = [
            {
                'title': 'Diabetes Management',
                'slug': 'diabetes-management',
                'category': metabolic,
                'short_description': 'Comprehensive diabetes care with personalized treatment plans.',
                'description': 'Our diabetes management program provides comprehensive care including blood sugar monitoring, medication management, lifestyle coaching, and regular check-ups to help you achieve optimal glucose control.',
                'duration_minutes': 60,
                'modality': Service.Modality.BOTH,
                'is_featured': True,
                'is_published': True,
                'order': 1,
            },
            {
                'title': 'Thyroid Care',
                'slug': 'thyroid-care',
                'category': endocrine,
                'short_description': 'Expert thyroid diagnosis and treatment for hormonal balance.',
                'description': 'Our thyroid specialists provide comprehensive evaluation and treatment for hypothyroidism, hyperthyroidism, thyroid nodules, and other thyroid conditions.',
                'duration_minutes': 45,
                'modality': Service.Modality.BOTH,
                'is_featured': True,
                'is_published': True,
                'order': 2,
            },
            {
                'title': 'PCOS Treatment',
                'slug': 'pcos-treatment',
                'category': endocrine,
                'short_description': 'Specialized care for polycystic ovary syndrome.',
                'description': 'Our PCOS program addresses hormonal imbalances, irregular periods, weight management, and fertility concerns with a holistic approach.',
                'duration_minutes': 60,
                'modality': Service.Modality.BOTH,
                'is_featured': True,
                'is_published': True,
                'order': 3,
            },
            {
                'title': 'Obesity Management',
                'slug': 'obesity-management',
                'category': wellness,
                'short_description': 'Medical weight loss programs tailored to your needs.',
                'description': 'Our obesity management program combines medical evaluation, nutritional counseling, behavioral therapy, and medication options when appropriate.',
                'duration_minutes': 45,
                'modality': Service.Modality.BOTH,
                'is_featured': False,
                'is_published': True,
                'order': 4,
            },
            {
                'title': 'Metabolic Health Check',
                'slug': 'metabolic-health-check',
                'category': metabolic,
                'short_description': 'Comprehensive metabolic assessment and optimization.',
                'description': 'A thorough evaluation of your metabolic health including blood tests, body composition analysis, and personalized recommendations.',
                'duration_minutes': 90,
                'modality': Service.Modality.IN_PERSON,
                'is_featured': False,
                'is_published': True,
                'order': 5,
            },
        ]
        
        for svc_data in services_data:
            svc, created = Service.objects.get_or_create(
                slug=svc_data['slug'],
                defaults=svc_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Service created: {svc.title}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write('\n📋 Login Credentials:')
        self.stdout.write('   Admin: admin@tfwelfare.com / admin123')
