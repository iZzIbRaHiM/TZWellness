# 🚀 Quick Start - Supabase Migration

## ⚡ 15-Minute Setup to Start

Follow these steps to begin your migration **right now**:

---

## Step 1: Create Supabase Account (3 minutes)

1. **Go to** [supabase.com](https://supabase.com)
2. **Click** "Start your project"
3. **Sign up** with GitHub (recommended) or email
4. **Create organization** (your name or company)

---

## Step 2: Create Project (2 minutes)

1. **Click** "New Project"
2. **Fill in**:
   - Name: `tz-wellness`
   - Database Password: Click "Generate" (SAVE THIS!)
   - Region: Choose closest to you (e.g., US East, EU West)
   - Plan: Free (you can upgrade later)
3. **Click** "Create new project"
4. **Wait** 2-3 minutes for provisioning

---

## Step 3: Save Your Credentials (1 minute)

Once project is ready:

1. **Go to** Settings → API
2. **Copy and save** these 3 things:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJxxxxxxxxxxxxxxxxxxxxxxxxxxx
service_role key: eyJxxxxxxxxxxxxxxxxxxxxxxxxxxx (SECRET!)
```

**Save to a file** called `supabase-credentials.txt` on your desktop.

---

## Step 4: Run Database Schema (5 minutes)

1. **In Supabase Dashboard**, click "SQL Editor" (left sidebar)
2. **Click** "New Query"
3. **Open this file**: `SUPABASE_MIGRATION_GUIDE.md`
4. **Scroll to** "Step 2.1 Create Tables in Supabase SQL Editor"
5. **Copy the ENTIRE SQL** (starts with `-- Enable UUID extension`)
6. **Paste** into Supabase SQL Editor
7. **Click** "Run" (or Ctrl+Enter)
8. **Wait** for "Success. No rows returned"

**Verify**:
- Click "Table Editor" (left sidebar)
- You should see 15+ tables

---

## Step 5: Add Sample Data (2 minutes)

1. **In SQL Editor**, click "New Query"
2. **Copy this** and paste:

```sql
-- Sample Service Category
INSERT INTO service_categories (name, slug, description, icon, "order") VALUES
('Mental Health', 'mental-health', 'Therapy and counseling', 'brain', 1),
('Wellness', 'wellness', 'Holistic wellness programs', 'heart', 2);

-- Sample Service
INSERT INTO services (title, slug, short_description, description, modality, duration_minutes, is_featured, is_published) 
VALUES (
  'Individual Therapy',
  'individual-therapy',
  'One-on-one counseling sessions',
  'Personalized therapy sessions tailored to your needs. Our licensed therapists provide a safe, confidential space to discuss your concerns.',
  'both',
  60,
  true,
  true
);

-- Weekly Availability (Mon-Fri, 9 AM - 5 PM)
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active) VALUES
(0, '09:00', '17:00', true), -- Monday
(1, '09:00', '17:00', true), -- Tuesday
(2, '09:00', '17:00', true), -- Wednesday
(3, '09:00', '17:00', true), -- Thursday
(4, '09:00', '17:00', true); -- Friday
```

3. **Click** "Run"
4. **Success!**

---

## Step 6: Install Frontend Dependencies (2 minutes)

Open terminal in your project:

```powershell
cd frontend
npm install @supabase/supabase-js @supabase/ssr
```

Wait for installation to complete.

---

## ✅ You're Done with Setup!

**What you've accomplished:**
- ✅ Supabase project created
- ✅ Database schema migrated (15 tables)
- ✅ Sample data added
- ✅ Frontend dependencies installed

---

## 🎯 What's Next?

### Option A: Continue Full Migration (Recommended)
Follow the detailed guide: `MIGRATION_CHECKLIST.md`

**Next steps:**
- Create Supabase client files
- Update API calls
- Setup email notifications

**Time**: 2-3 days for complete migration

### Option B: Test Supabase First (Quickest)
Want to see it working before committing?

1. **Create** `frontend/src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    'YOUR_PROJECT_URL', // Replace with your URL
    'YOUR_ANON_KEY'     // Replace with your anon key
  )
```

2. **Create** `frontend/src/app/test-supabase/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_published', true)

      if (error) {
        console.error('Error:', error)
      } else {
        setServices(data || [])
      }
      setLoading(false)
    }

    loadServices()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      <p className="mb-4">✅ Connected to Supabase!</p>
      
      <h2 className="text-xl font-semibold mb-2">Services:</h2>
      <ul>
        {services.map((service) => (
          <li key={service.id} className="mb-2">
            {service.title} - {service.modality}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

3. **Run dev server**:
```powershell
npm run dev
```

4. **Visit**: http://localhost:3000/test-supabase

**Should see**: Your sample service listed!

---

## 📚 Documentation Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **PROJECT_UNDERSTANDING.md** | Understand current project | Start here |
| **SUPABASE_MIGRATION_GUIDE.md** | Complete technical guide | Reference during migration |
| **MIGRATION_CHECKLIST.md** | Step-by-step tasks | Daily tracking |
| **THIS FILE** | Quick setup | Getting started |

---

## 🆘 Stuck? Common Issues

### "Error: Invalid API key"
- Double-check you copied the correct anon key
- Make sure no extra spaces

### "relation does not exist"
- Schema not created - re-run SQL from Step 4
- Check you're in the right project

### "npm install fails"
- Try: `npm install --legacy-peer-deps`
- Or: Delete `node_modules` and `package-lock.json`, then retry

### "Table Editor shows no tables"
- Click refresh button
- Make sure SQL query succeeded
- Check you're viewing "public" schema

---

## 💡 Pro Tips

1. **Use Supabase CLI** for faster development:
   ```powershell
   npm install -g supabase
   supabase login
   ```

2. **Generate TypeScript types** automatically:
   ```powershell
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
   ```

3. **Test SQL queries** in SQL Editor before adding to code

4. **Enable row level security** early to avoid security issues

5. **Keep service_role key SECRET** - never commit to Git!

---

## 🎯 Decision Time

### Ready to Continue?

**If YES** → Go to `MIGRATION_CHECKLIST.md` Phase 3

**If WANT TO LEARN MORE** → Read `PROJECT_UNDERSTANDING.md`

**If HAVE QUESTIONS** → Review `SUPABASE_MIGRATION_GUIDE.md`

---

## 📊 Progress Tracker

Track your progress:

- [x] ✅ Step 1: Supabase account
- [x] ✅ Step 2: Project created
- [x] ✅ Step 3: Credentials saved
- [x] ✅ Step 4: Database schema
- [x] ✅ Step 5: Sample data
- [x] ✅ Step 6: Dependencies installed
- [ ] ⏳ Step 7: Create Supabase clients
- [ ] ⏳ Step 8: Update API calls
- [ ] ⏳ Step 9: Setup emails
- [ ] ⏳ Step 10: Test everything
- [ ] ⏳ Step 11: Remove Django
- [ ] ⏳ Step 12: Deploy

---

## 🎉 Congratulations!

You've completed the initial setup. Your Supabase project is ready!

**Time invested**: ~15 minutes  
**Value created**: $24/month savings + better architecture  
**Next milestone**: Replace API calls (2-3 hours)

**Keep going!** 💪
