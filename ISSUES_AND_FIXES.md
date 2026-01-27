# 🔧 ISSUES & FIXES REFERENCE

**Purpose:** Complete troubleshooting guide for TZ Wellness and similar Next.js + Supabase projects  
**Last Updated:** January 27, 2026  
**Tech Stack:** Next.js 14, Supabase, PostgreSQL, TypeScript, Vercel

---

## 🔐 AUTHENTICATION & ADMIN ACCESS

### Issue 1: Admin Panel Shows "User Not Authorized"

**Symptom:**
```
Error: User not authorized to access this resource
Admin dashboard returns 403 or shows "Access Denied"
```

**Root Cause:**
- `is_admin()` function doesn't exist in Supabase database
- User metadata lacks `role: "admin"` field
- RLS policies check wrong JWT path

**Failed Attempts:**
- Setting environment variable `ADMIN_EMAIL`
- Client-side role checking
- Hardcoding admin check in middleware

**Working Solution:**
```sql
-- Step 1: Create is_admin() function
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json
    ->'user_metadata'->>'role' = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Assign admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}', '"admin"'
)
WHERE email = 'your-email@gmail.com';

-- Step 3: User MUST log out and back in
```

**Prevention:** Run `FIX_IS_ADMIN_FUNCTION.sql` + `MAKE_ME_ADMIN.sql` during setup

---

### Issue 2: Session Not Persisting After Login

**Symptom:**
```
User logs in successfully but is logged out on page refresh
Session cookie not set
```

**Root Cause:**
- Missing `updateSession()` in middleware
- Cookie options incorrect for server components
- Supabase client created incorrectly

**Working Solution:**
```typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  await supabase.auth.getUser()
  return response
}
```

**Tech:** Next.js Middleware, Supabase SSR

---

### Issue 3: RLS Policies Block Authenticated Users

**Symptom:**
```
Error: new row violates row-level security policy
INSERT/UPDATE operations fail despite being authenticated
```

**Root Cause:**
- RLS enabled but no policies defined
- Policy uses wrong auth check (`auth.uid()` vs `auth.jwt()`)
- Policy too restrictive

**Working Solution:**
```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policies using correct auth check
CREATE POLICY "Users can read own data"
ON your_table FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything"
ON your_table FOR ALL
USING (
  (current_setting('request.jwt.claims', true)::json
  ->'user_metadata'->>'role') = 'admin'
);
```

**Prevention:** Always create SELECT, INSERT, UPDATE, DELETE policies when enabling RLS

---

## 📅 BOOKING SYSTEM

### Issue 4: Available Slots Not Loading (404 Error)

**Symptom:**
```
Console: POST /rpc/get_available_slots 404
Calendar shows dates but "No slots available for this date"
Network tab: Failed to load resource: 404
```

**Root Cause:**
- `get_available_slots()` function doesn't exist in database
- Function name mismatch between frontend and database
- Function not granted EXECUTE permissions

**Failed Attempts:**
- Checking API endpoint configuration
- Restarting Supabase instance
- Clearing browser cache

**Working Solution:**
```sql
-- Create the function (simplified version)
CREATE OR REPLACE FUNCTION get_available_slots(
  start_date TEXT,
  end_date TEXT,
  modality_filter TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB := '{}'::JSONB;
BEGIN
  -- Implementation here
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_available_slots TO anon, authenticated;
```

**File:** `UPDATE_SLOT_AVAILABILITY_FIXED.sql`  
**Tech:** PostgreSQL Functions, Supabase RPC

---

### Issue 5: SQL Error "Column Reference Ambiguous"

**Symptom:**
```
Error: column reference "day_of_week" is ambiguous
Code: 42702
Function returns 400 Bad Request
```

**Root Cause:**
Multiple tables in JOIN have same column name without table prefix

**Working Solution:**
```sql
-- ❌ WRONG
SELECT day_of_week 
FROM weekly_availability 
JOIN time_slots ON ...
WHERE day_of_week = 0;

-- ✅ CORRECT
SELECT wa.day_of_week 
FROM weekly_availability wa
JOIN time_slots ts ON ...
WHERE wa.day_of_week = 0;
```

**Prevention:** Always use table aliases (wa, ts, etc.) in multi-table queries

---

### Issue 6: Reserved Keyword "current_date" Causes Syntax Error

**Symptom:**
```
ERROR: syntax error at or near "current_date"
LINE 25: current_date := start_date::DATE;
```

**Root Cause:**
`current_date` is a PostgreSQL reserved keyword, can't be used as variable name

**Working Solution:**
```sql
-- ❌ WRONG
DECLARE
  current_date DATE;

-- ✅ CORRECT
DECLARE
  iter_date DATE;
```

**Prevention:** Avoid reserved keywords: `current_date`, `user`, `table`, `order`

---

### Issue 7: No Slots Available Despite Empty Calendar

**Symptom:**
```
Calendar loads dates successfully
Selecting date shows "No slots available"
weekly_availability table is empty or misconfigured
```

**Root Cause:**
- `weekly_availability` table not populated
- Duplicate 30-minute slot entries instead of full-day entries
- `is_active` set to false

**Working Solution:**
```sql
-- Remove duplicate entries (if they exist)
DELETE FROM weekly_availability
WHERE end_time = start_time + INTERVAL '30 minutes';

-- Insert correct full-day entries
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active)
VALUES
  (0, '09:00', '17:00', true),  -- Monday
  (1, '09:00', '17:00', true),  -- Tuesday
  (2, '09:00', '17:00', true),  -- Wednesday
  (3, '09:00', '17:00', true),  -- Thursday
  (4, '09:00', '17:00', true);  -- Friday

-- Verify
SELECT * FROM weekly_availability WHERE is_active = true;
```

**File:** `SETUP_BOOKING_SLOTS.sql`  
**Prevention:** Run setup script before first booking test

---

## 🖼️ STORAGE & UPLOADS

### Issue 8: Image Upload Fails with 403

**Symptom:**
```
Error: Failed to upload image
Storage: new row violates row-level security policy
Image URL returns 403 Forbidden
```

**Root Cause:**
- Storage bucket doesn't exist
- RLS policies on `storage.objects` not configured
- Bucket not set to public

**Working Solution:**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Allow public read
CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow admin upload
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  (current_setting('request.jwt.claims', true)::json
   ->'user_metadata'->>'role') = 'admin'
);
```

**Prevention:** Create storage buckets and RLS policies before using CMS

---

## 🔗 API & INTEGRATION

### Issue 9: CORS Error on API Calls

**Symptom:**
```
Access to fetch has been blocked by CORS policy
No 'Access-Control-Allow-Origin' header present
```

**Root Cause:**
- Supabase anon key not in environment variables
- API URL incorrect
- Browser blocking cross-origin requests

**Working Solution:**
```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

// Verify in lib/supabase/client.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}
```

**Prevention:** Use `NEXT_PUBLIC_` prefix for client-side env vars

---

### Issue 10: WhatsApp Links Not Working

**Symptom:**
```
Phone numbers hardcoded in 9+ components
Different phone formats across pages
WhatsApp opens without pre-filled message
```

**Root Cause:**
- No centralized WhatsApp utility
- Phone number extraction logic duplicated
- Missing message encoding

**Working Solution:**
```typescript
// lib/whatsapp.ts
export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppNumber(telHref: string): string {
  return telHref.replace('tel:', '').replace(/\D/g, '');
}
```

**Prevention:** Create utility functions for repeated logic

---

## 🎨 UI & STYLING

### Issue 11: Text Contrast Too Low (Accessibility)

**Symptom:**
```
Lighthouse: Color contrast ratio < 4.5:1
Text barely visible on dark backgrounds
WCAG AAA standards violated
```

**Working Solution:**
```tsx
// ❌ WRONG - Low contrast
<h2 className="text-emerald-400">Heading</h2>

// ✅ CORRECT - High contrast
<h2 className="text-white">Heading</h2>
```

**Prevention:** Use Tailwind `text-white` or `text-gray-900` for body text

---

### Issue 12: Hydration Mismatch Errors

**Symptom:**
```
Warning: Text content did not match
Error: Hydration failed
Client and server HTML don't match
```

**Root Cause:**
- Date formatting differs between server/client
- `Math.random()` in component initialization
- `useEffect` modifying state before hydration

**Working Solution:**
```typescript
// ❌ WRONG
const [id] = useState(() => Math.random());

// ✅ CORRECT
const [id, setId] = useState('');
useEffect(() => {
  setId(Math.random().toString());
}, []);
```

**Prevention:** Defer random/date-dependent content to `useEffect`

---

## 🚀 BUILD & DEPLOYMENT

### Issue 13: Vercel Build Fails with TypeScript Errors

**Symptom:**
```
Type error: Property 'X' does not exist on type 'Y'
Build failed with exit code 1
```

**Root Cause:**
- Missing type definitions
- Supabase response types not defined
- API response shape changed

**Working Solution:**
```typescript
// Define complete types in lib/api.ts
export interface Service {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  // ... all fields
}

// Use in API calls
const { data, error } = await supabase
  .from('services')
  .select('*')
  .returns<Service[]>();
```

**Prevention:** Define types before building components

---

### Issue 14: Environment Variables Not Found in Production

**Symptom:**
```
Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL
Build succeeds but runtime fails
```

**Root Cause:**
- Env vars not set in Vercel dashboard
- Using wrong variable prefix (missing `NEXT_PUBLIC_`)
- `.env.local` not gitignored

**Working Solution:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add all `NEXT_PUBLIC_` vars for Production
3. Redeploy

**Prevention:** Use `lib/env.ts` with Zod validation

---

## 📱 MOBILE & RESPONSIVE

### Issue 15: Images Not Displaying on Mobile

**Symptom:**
```
Images show on desktop but broken on mobile
Alt text displayed instead of image
Network tab shows 404 for image URLs
```

**Root Cause:**
- Image paths use absolute URLs without domain
- `next/image` requires proper loader configuration
- Storage bucket CORS not configured

**Working Solution:**
```typescript
// Use relative paths with next/image
<Image
  src="/images/logo.png"
  alt="Logo"
  width={400}
  height={133}
/>

// For Supabase storage
const { data: { publicUrl } } = supabase.storage
  .from('blog-images')
  .getPublicUrl('path/to/image.jpg');
```

**Tech:** Next.js Image Optimization, Supabase Storage

---

## 🔍 SEO & METADATA

### Issue 16: Sitemap Not Updating

**Symptom:**
```
Google Search Console shows old URLs
New pages not appearing in sitemap.xml
Sitemap returns 404
```

**Root Cause:**
- Static sitemap not regenerated
- Dynamic sitemap route not created
- Vercel caching old sitemap

**Working Solution:**
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tzwellnesscentre.com'
  
  // Fetch dynamic routes from database
  const posts = await getBlogPosts()
  
  return [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    ...posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
```

**Prevention:** Use dynamic `sitemap.ts` instead of static XML

---

## 🗄️ DATABASE & QUERIES

### Issue 17: Query Returns Empty Despite Data Existing

**Symptom:**
```
SELECT query returns []
Data visible in Supabase table editor
RLS not blocking (policy exists)
```

**Root Cause:**
- Query filtering on wrong column
- Case-sensitive string comparison
- Timezone mismatch in date queries

**Working Solution:**
```sql
-- ❌ WRONG - Case sensitive
WHERE slug = 'My-Blog-Post'

-- ✅ CORRECT - Case insensitive
WHERE LOWER(slug) = LOWER('My-Blog-Post')

-- ❌ WRONG - Timezone issues
WHERE created_at = '2026-01-27'

-- ✅ CORRECT - Use date range
WHERE created_at::DATE = '2026-01-27'::DATE
```

**Prevention:** Use `LOWER()` for string comparisons, `::DATE` for date filtering

---

### Issue 18: Foreign Key Constraint Violation

**Symptom:**
```
ERROR: insert or update violates foreign key constraint
Key (category_id) is not present in table "service_categories"
```

**Root Cause:**
- Inserting UUID that doesn't exist in referenced table
- NULL not allowed but no default value
- Referenced row was deleted

**Working Solution:**
```sql
-- Option 1: Set foreign key to NULL
ALTER TABLE services
ALTER COLUMN category_id DROP NOT NULL;

-- Option 2: Use ON DELETE SET NULL
ALTER TABLE services
DROP CONSTRAINT services_category_id_fkey,
ADD CONSTRAINT services_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES service_categories(id)
  ON DELETE SET NULL;
```

**Prevention:** Define cascade behavior when creating foreign keys

---

## 📊 PERFORMANCE

### Issue 19: Slow Page Load Due to Large Queries

**Symptom:**
```
Page takes 3+ seconds to load
Network waterfall shows sequential API calls
Database query time > 1000ms
```

**Root Cause:**
- Fetching too many columns with `SELECT *`
- N+1 query problem (fetching related data in loop)
- No query caching

**Working Solution:**
```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['services', categoryId],
  queryFn: async () => {
    const { data } = await supabase
      .from('services')
      .select('id, title, slug, short_description')  // Only needed fields
      .eq('category_id', categoryId)
      .limit(10)
    return data
  },
  staleTime: 5 * 60 * 1000,  // Cache 5 minutes
})
```

**Prevention:** Use React Query, select only needed columns, add indexes

---

## 🔄 STATE MANAGEMENT

### Issue 20: Zustand State Not Persisting

**Symptom:**
```
State resets on page refresh
localStorage appears empty
Persist middleware not working
```

**Root Cause:**
- Missing `persist` middleware configuration
- Storage name conflict
- Hydration before client-side mount

**Working Solution:**
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

**Tech:** Zustand Persist Middleware

---

## 📞 THIRD-PARTY INTEGRATIONS

### Issue 21: International Phone Numbers Not Formatting Correctly

**Symptom:**
```
Pakistan number +92 332 5858314 displays as invalid
WhatsApp link uses wrong format
tel: href not clickable on mobile
```

**Root Cause:**
- Hardcoded US phone format validation
- Missing international prefix
- Phone number extraction removes country code

**Working Solution:**
```typescript
// Support international format
function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  // Ensure country code included
  if (cleaned.length === 10) {
    return `92${cleaned}`;  // Pakistan default
  }
  return cleaned;
}

// Create WhatsApp link
const whatsappUrl = `https://wa.me/${formatPhoneForWhatsApp(phone)}`;
```

**Prevention:** Don't assume phone number format, support international

---

## 🛠️ DEVELOPMENT ENVIRONMENT

### Issue 22: Hot Reload Not Working

**Symptom:**
```
Changes to code don't reflect in browser
Must manually refresh to see updates
No console errors
```

**Root Cause:**
- `.next` cache corruption
- File watcher limit exceeded
- WSL2 file system issues

**Working Solution:**
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart dev server
npm run dev

# On Linux/WSL, increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Prevention:** Restart dev server after major dependency changes

---

## 🔐 SECURITY

### Issue 23: Sensitive Data Exposed in Client Bundle

**Symptom:**
```
Supabase service role key visible in browser
API keys in JavaScript bundle
Lighthouse security warning
```

**Root Cause:**
- Using service role key in client code
- Server-only env vars accessed in client components
- Missing `NEXT_PUBLIC_` prefix check

**Working Solution:**
```typescript
// ❌ WRONG - Server key in client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // LEAKED!
)

// ✅ CORRECT - Use anon key for client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Safe
)
```

**Prevention:** Never use service role key in client code, only in API routes

---

## 📝 FORMS & VALIDATION

### Issue 24: Form Submission Fails Silently

**Symptom:**
```
Submit button disabled after click
No error message shown
Network tab shows 200 OK but no data changes
```

**Root Cause:**
- Zod validation failing without error display
- Async submission not awaited
- Success toast shown even on error

**Working Solution:**
```typescript
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

async function onSubmit(values: z.infer<typeof schema>) {
  try {
    const validated = schema.parse(values)
    const { error } = await supabase.from('table').insert(validated)
    
    if (error) throw error
    
    toast({ title: 'Success!', description: 'Form submitted' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      toast({ 
        variant: 'destructive',
        title: 'Validation Error',
        description: error.errors[0].message 
      })
    }
  }
}
```

**Tech:** Zod Validation, React Hook Form

---

## ⚡ QUICK REFERENCE

**Most Common Fixes:**
1. **404 on RPC function** → Function not created in database
2. **403 Forbidden** → RLS policy missing or too restrictive
3. **Ambiguous column** → Add table aliases to SQL query
4. **Hydration error** → Move random/date logic to `useEffect`
5. **Admin not authorized** → Run `is_admin()` function + assign role
6. **Build fails** → Define TypeScript types for all API responses
7. **No slots available** → Run `SETUP_BOOKING_SLOTS.sql`
8. **Image upload fails** → Create storage bucket + RLS policies
9. **WhatsApp not working** → Use centralized `whatsapp.ts` utility
10. **State not persisting** → Add Zustand persist middleware

**Essential SQL Scripts:**
- `all_querries.sql` - Master schema
- `SETUP_BOOKING_SLOTS.sql` - Initialize availability
- `UPDATE_SLOT_AVAILABILITY_FIXED.sql` - Fix slot function
- `FIX_IS_ADMIN_FUNCTION.sql` - Enable admin access
- `MAKE_ME_ADMIN.sql` - Assign admin role

**Debugging Commands:**
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';

-- View user metadata
SELECT raw_user_meta_data FROM auth.users WHERE email = 'your@email.com';

-- Test admin function
SELECT is_admin();

-- Check available slots
SELECT * FROM get_available_slots('2026-01-27', '2026-01-28', NULL);
```

---

**Document Purpose:** AI-optimized troubleshooting reference  
**Reuse Context:** Next.js 14 + Supabase + TypeScript projects  
**Update Frequency:** After each major fix
