"""
Validation script to ensure frontend navigation config matches backend database.
Run this script to verify that all services in the database are reflected in the frontend config.

Usage:
    python scripts/validate_navigation.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.services.models import Service


def get_published_services():
    """Get all published services from database."""
    return Service.objects.filter(is_published=True).values_list('title', 'slug')


def read_frontend_config():
    """Read the frontend navigation config file."""
    config_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        '..',
        'frontend',
        'src',
        'lib',
        'navigation-config.ts'
    )
    
    if not os.path.exists(config_path):
        return None, "Config file not found"
    
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return content, None


def extract_services_from_config(content):
    """Extract service links from the config file."""
    import re
    services = []
    in_services_section = False
    
    for line in content.split('\n'):
        if 'export const SERVICES' in line:
            in_services_section = True
            continue
        if in_services_section and '];' in line:
            break
        if in_services_section and 'name:' in line and 'href:' in line:
            # Extract name using regex
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', line)
            href_match = re.search(r'href:\s*["\']([^"\']+)["\']', line)
            
            if name_match and href_match:
                name = name_match.group(1)
                href = href_match.group(1)
                # Extract slug from href
                slug = href.split('/')[-1]
                services.append((name, slug))
    
    return services


def main():
    print("=" * 70)
    print("NAVIGATION CONFIGURATION VALIDATION")
    print("=" * 70)
    print()
    
    # Get backend services
    print("📊 Fetching services from database...")
    backend_services = list(get_published_services())
    print(f"   Found {len(backend_services)} published services in database")
    print()
    
    # Get frontend config
    print("📄 Reading frontend configuration...")
    config_content, error = read_frontend_config()
    if error:
        print(f"   ❌ ERROR: {error}")
        return
    
    frontend_services = extract_services_from_config(config_content)
    print(f"   Found {len(frontend_services)} services in navigation-config.ts")
    print()
    
    # Compare
    print("🔍 Comparing backend and frontend...")
    print()
    
    # Create sets for comparison
    backend_slugs = {slug for _, slug in backend_services}
    frontend_slugs = {slug for _, slug in frontend_services}
    
    # Find discrepancies
    missing_in_frontend = backend_slugs - frontend_slugs
    extra_in_frontend = frontend_slugs - backend_slugs
    
    # Display results
    if not missing_in_frontend and not extra_in_frontend:
        print("✅ PERFECT SYNC!")
        print("   All services in database are present in frontend config.")
        print("   All services in frontend config exist in database.")
    else:
        print("⚠️  DISCREPANCIES FOUND!")
        print()
        
        if missing_in_frontend:
            print("❌ Services in DATABASE but MISSING from FRONTEND config:")
            for title, slug in backend_services:
                if slug in missing_in_frontend:
                    print(f"   - {title} (slug: {slug})")
                    print(f"     Add this to navigation-config.ts:")
                    print(f'     {{ name: "{title}", href: "/services/{slug}" }},')
            print()
        
        if extra_in_frontend:
            print("⚠️  Services in FRONTEND config but NOT in database:")
            for name, slug in frontend_services:
                if slug in extra_in_frontend:
                    print(f"   - {name} (slug: {slug})")
                    print(f"     Either add to database or remove from config")
            print()
    
    print()
    print("=" * 70)
    print("DETAILED LISTINGS")
    print("=" * 70)
    print()
    
    print("Backend Services (Database):")
    for title, slug in backend_services:
        status = "✓" if slug in frontend_slugs else "✗"
        print(f"  {status} {title:30} -> /services/{slug}")
    print()
    
    print("Frontend Services (navigation-config.ts):")
    for name, slug in frontend_services:
        status = "✓" if slug in backend_slugs else "✗"
        print(f"  {status} {name:30} -> /services/{slug}")
    print()


if __name__ == '__main__':
    main()
