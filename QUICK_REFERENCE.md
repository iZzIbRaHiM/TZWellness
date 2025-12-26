# Quick Reference: Adding Services & Resources

## ✅ Adding a New Service (3 Steps)

### 1. Backend: Add to Database
```bash
# Access Django Admin
http://127.0.0.1:8000/admin/

# Navigate to: Services → Services → Add Service
# Fill in: Title, Category, Description
# Check: "Is Published" ✓
# Save
```

### 2. Frontend: Update Navigation Config
```typescript
// File: frontend/src/lib/navigation-config.ts

export const SERVICES: NavLink[] = [
  { name: "Diabetes Management", href: "/services/diabetes-management" },
  { name: "Thyroid Care", href: "/services/thyroid-care" },
  { name: "PCOS Treatment", href: "/services/pcos-treatment" },
  { name: "Obesity Management", href: "/services/obesity-management" },
  { name: "Metabolic Health Check", href: "/services/metabolic-health-check" },
  // ⬇️ ADD YOUR NEW SERVICE HERE
  { name: "Your New Service", href: "/services/your-new-service" },
];
```

⚠️ **IMPORTANT**: The slug in `href` MUST match the database slug!

### 3. Validate: Run Sync Check
```bash
cd backend
python scripts/validate_navigation.py
```

## ✅ Adding a New Resource (2 Steps)

### 1. Update Navigation Config
```typescript
// File: frontend/src/lib/navigation-config.ts

export const RESOURCES: NavLink[] = [
  { name: "New Patient Guide", href: "/resources#new-patient-guide" },
  { name: "Payment Information", href: "/resources#payment-information" },
  { name: "Telehealth Prep", href: "/resources#telehealth-prep" },
  { name: "Pre-Visit Checklist", href: "/resources#pre-visit-checklist" },
  { name: "FAQs", href: "/resources#faqs" },
  // ⬇️ ADD YOUR NEW RESOURCE HERE
  { name: "Your Resource", href: "/resources#your-resource" },
];
```

### 2. Add Content Section
```typescript
// File: frontend/src/components/resources/resources-sections.tsx

// Add a new section with id matching your href anchor
<section id="your-resource">
  <h2>Your Resource Title</h2>
  <p>Your resource content...</p>
</section>
```

---

## 🔍 Validation Commands

### Check Services in Database
```powershell
cd "c:\Users\HP\Downloads\TF Wellfare\backend"
& "C:/Users/HP/Downloads/TF Wellfare/.venv/Scripts/python.exe" manage.py shell -c "from apps.services.models import Service; [print(f'{s.title} -> /services/{s.slug}') for s in Service.objects.filter(is_published=True)]"
```

### Run Full Sync Validation
```powershell
cd "c:\Users\HP\Downloads\TF Wellfare\backend"
& "C:/Users/HP/Downloads/TF Wellfare/.venv/Scripts/python.exe" scripts/validate_navigation.py
```

---

## 📍 Where Things Update Automatically

After updating `navigation-config.ts`, changes appear in:

- ✅ Header dropdown menu (Services section)
- ✅ Footer links (Services section)
- ✅ Footer links (Resources section)
- ✅ Any component importing from the config

---

## 🚀 Starting the Project

### Backend (Django)
```powershell
cd "c:\Users\HP\Downloads\TF Wellfare\backend"
& "C:/Users/HP/Downloads/TF Wellfare/.venv/Scripts/python.exe" manage.py runserver
```
**Runs at:** http://127.0.0.1:8000

### Frontend (Next.js)
```powershell
cd "c:\Users\HP\Downloads\TF Wellfare\frontend"
npm run dev
```
**Runs at:** http://localhost:3000

---

## 📚 Full Documentation

For detailed information, see: **NAVIGATION_SYNC_GUIDE.md**
