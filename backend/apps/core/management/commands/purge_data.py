"""
Management command to completely purge all data and reset the database.
USE WITH CAUTION - THIS DELETES EVERYTHING!
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Purge all data from the database (DESTRUCTIVE)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        if not options['yes']:
            confirm = input('⚠️  This will DELETE ALL DATA. Are you sure? Type "DELETE" to confirm: ')
            if confirm != 'DELETE':
                self.stdout.write(self.style.ERROR('❌ Cancelled'))
                return

        self.stdout.write('🗑️  Purging database...\n')

        # Delete all data from all tables
        with connection.cursor() as cursor:
            # Get all table names
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                AND name NOT LIKE 'django_migrations'
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            # Disable foreign key checks
            cursor.execute('PRAGMA foreign_keys = OFF;')
            
            # Delete all data from each table
            for table in tables:
                try:
                    cursor.execute(f'DELETE FROM {table};')
                    self.stdout.write(f'  ✓ Cleared {table}')
                except Exception as e:
                    self.stdout.write(f'  ⚠ Skipped {table}: {e}')
            
            # Re-enable foreign key checks
            cursor.execute('PRAGMA foreign_keys = ON;')

        self.stdout.write(self.style.SUCCESS('\n✅ Database purged successfully!'))
        self.stdout.write('💡 Run: python manage.py seed_data to create fresh data')
