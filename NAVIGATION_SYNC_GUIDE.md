# Navigation Configuration System

## Overview
This system ensures that all services and resources displayed across the website (header menus, footer links, etc.) are synchronized and up-to-date.

## Files Structure

### Centralized Configuration
**Location:** `frontend/src/lib/navigation-config.ts`

This is the **SINGLE SOURCE OF TRUTH** for all navigation links across the application.

### Components Using This Config
- `frontend/src/components/layout/header.tsx` - Main navigation menu
- `frontend/src/components/layout/footer.tsx` - Footer links
- Any other components that need navigation data

## How to Add a New Service

### Step 1: Add to Backend Database
1. Log into Django Admin: `http://127.0.0.1:8000/admin/`
2. Navigate to **Services → Services**
3. Click **Add Service**
4. Fill in the form:
   - **Title**: e.g., "Weight Loss Program"
   - **Slug**: e.g., "weight-loss-program" (auto-generated from title)
   - **Category**: Select appropriate category
   - **Description**: Full service details
   - **Is Published**: Check to make it visible
5. Save the service

### Step 2: Update Frontend Configuration
1. Open `frontend/src/lib/navigation-config.ts`
2. Add the new service to the `SERVICES` array:

```typescript
export const SERVICES: NavLink[] = [
  { name: "Diabetes Management", href: "/services/diabetes-management" },
  { name: "Thyroid Care", href: "/services/thyroid-care" },
  { name: "PCOS Treatment", href: "/services/pcos-treatment" },
  { name: "Obesity Management", href: "/services/obesity-management" },
  { name: "Metabolic Health Check", href: "/services/metabolic-health-check" },
  // Add your new service here
  { name: "Weight Loss Program", href: "/services/weight-loss-program" },
];
```

**IMPORTANT:** The `href` slug MUST match the slug in the database!

### Step 3: Verify Changes
The new service will automatically appear in:
- Header dropdown menu under "Services"
- Footer "Services" section
- Any other component importing from `navigation-config.ts`

## How to Add a New Resource Page

Resources are frontend-only pages (no database entries needed).

### Step 1: Update Configuration
1. Open `frontend/src/lib/navigation-config.ts`
2. Add the new resource to the `RESOURCES` array:

```typescript
export const RESOURCES: NavLink[] = [
  { name: "New Patient Guide", href: "/resources#new-patient-guide" },
  { name: "Payment Information", href: "/resources#payment-information" },
  { name: "Telehealth Prep", href: "/resources#telehealth-prep" },
  { name: "Pre-Visit Checklist", href: "/resources#pre-visit-checklist" },
  { name: "FAQs", href: "/resources#faqs" },
  // Add your new resource here
  { name: "Insurance Guide", href: "/resources#insurance-guide" },
];
```

### Step 2: Add Content Section
1. Open `frontend/src/components/resources/resources-sections.tsx`
2. Add a new section for your resource with the corresponding ID

## Verification Checklist

After adding a new service or resource, verify:

- [ ] Backend database has the service (if applicable)
- [ ] `navigation-config.ts` has been updated
- [ ] Slug in config matches slug in database
- [ ] Service appears in header dropdown
- [ ] Service appears in footer links
- [ ] Clicking the link navigates correctly
- [ ] Service detail page loads properly

## Database vs Frontend Sync

### Services (Database-Driven)
- **Backend**: Django models in `backend/apps/services/models.py`
- **Database Table**: Contains full service information
- **Frontend Config**: Only navigation links (name + URL)
- **Detail Pages**: Dynamically generated from database

### Resources (Frontend-Only)
- **No Database**: Pure frontend content
- **Frontend Config**: Navigation links only
- **Content**: Hardcoded in React components

## Commands Reference

### Check Current Services in Database
```powershell
cd "c:\Users\HP\Downloads\TF Wellfare\backend"
& "C:/Users/HP/Downloads/TF Wellfare/.venv/Scripts/python.exe" manage.py shell -c "from apps.services.models import Service; [print(f'{s.title} -> /services/{s.slug}') for s in Service.objects.filter(is_published=True)]"
```

### Create Django Admin Superuser
```powershell
cd "c:\Users\HP\Downloads\TF Wellfare\backend"
& "C:/Users/HP/Downloads/TF Wellfare/.venv/Scripts/python.exe" manage.py createsuperuser
```

## Benefits of This System

1. **Single Source of Truth**: One file to update for all navigation changes
2. **Type Safety**: TypeScript interfaces ensure consistency
3. **Easy Maintenance**: Clear documentation and structure
4. **Auto-Propagation**: Update once, reflects everywhere
5. **Reduces Errors**: No need to manually update multiple files

## Future Enhancements

Consider implementing:
1. **API Integration**: Fetch services dynamically from backend API
2. **CMS Integration**: Allow admins to manage navigation without code changes
3. **Multi-language Support**: Extend config for internationalization
4. **Analytics Tracking**: Add tracking IDs to navigation items

## Troubleshooting

### Service Not Appearing in Menu
1. Check if `is_published=True` in database
2. Verify slug matches exactly in config file
3. Clear browser cache and restart dev server

### 404 Error on Service Page
1. Verify service exists in database with matching slug
2. Check dynamic route exists: `frontend/src/app/services/[slug]/page.tsx`
3. Ensure service is published

### Resource Section Not Found
1. Verify the ID in the href matches the section ID in the component
2. Check that anchor scrolling is enabled

## Contact

For questions about this system, refer to the project documentation or contact the development team.
