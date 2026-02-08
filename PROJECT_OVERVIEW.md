# 📘 PROJECT OVERVIEW

**Project Name:** TZ Wellness Centre  
**Type:** Healthcare Wellness Center Website  
**Version:** 1.0 (Production)  
**Last Updated:** January 27, 2026  
**Repository:** github.com/iZzIbRaHiM/TZWellness

---

## 🎯 PROJECT MISSION

A full-stack web application for TZ Wellness Centre providing:
- Service catalog and booking system
- Blog/content management
- Event management
- Resource library
- Admin dashboard for content management

**Target Users:**
1. **Patients/Clients** - Browse services, book appointments, read blog
2. **Admin Staff** - Manage bookings, content, events

**Core Requirements:**
- Mobile-first responsive design
- Real-time appointment booking
- SEO-optimized content pages
- WhatsApp integration for inquiries
- Secure admin access

---

## 🏗️ TECH STACK

### Frontend
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Radix UI, Shadcn/UI
- **State Management:** Zustand (with persist middleware)
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** React Query (@tanstack/react-query)
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Backend
- **Database:** Supabase (PostgreSQL 15)
- **Authentication:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage (for blog images, resources)
- **Real-time:** Supabase Realtime subscriptions
- **API:** Supabase client + custom Next.js API routes

### DevOps
- **Hosting:** Vercel (frontend)
- **Database:** Supabase Cloud
- **Version Control:** Git (GitHub)
- **CI/CD:** Vercel auto-deploy on push to main
- **Environment:** Node.js 20.x

### Third-Party Integrations
- **WhatsApp Business API** (via wa.me links)
- **Google Analytics** (optional)
- **Email:** Supabase Auth emails

---

## 📁 ARCHITECTURE OVERVIEW

### Project Structure
```
TZWELLNESS_SUPABASE/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── (auth)/       # Auth routes (login, register)
│   │   │   ├── (main)/       # Public routes
│   │   │   ├── admin/        # Protected admin routes
│   │   │   ├── api/          # API routes
│   │   │   └── globals.css   # Global styles
│   │   ├── components/       # React components
│   │   │   ├── layout/       # Header, Footer, Navigation
│   │   │   ├── home/         # Homepage sections
│   │   │   ├── services/     # Service-related components
│   │   │   ├── booking/      # Booking flow components
│   │   │   ├── admin/        # Admin dashboard components
│   │   │   └── ui/           # Reusable UI primitives (Shadcn)
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-auth.ts   # Authentication state
│   │   │   ├── use-site-settings.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/              # Utilities and configurations
│   │   │   ├── supabase/     # Supabase clients (client, server, middleware)
│   │   │   ├── api.ts        # API client functions
│   │   │   ├── navigation-config.ts  # Site navigation
│   │   │   ├── whatsapp.ts   # WhatsApp utility
│   │   │   └── utils.ts      # Shared utilities
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   │   ├── images/           # Logo, certifications, etc.
│   │   └── favicon.ico
│   ├── next.config.js        # Next.js configuration
│   ├── tailwind.config.ts    # Tailwind CSS config
│   └── package.json
├── backend/                  # Django backend (legacy, not used)
└── *.sql                     # Database migration scripts
```

### Page Routes
**Public Pages:**
- `/` - Homepage
- `/about` - About Us
- `/services` - Services catalog
- `/services/[slug]` - Service detail
- `/booking/[serviceSlug]` - Booking flow
- `/booking/confirmation/[id]` - Booking confirmation
- `/blog` - Blog listing
- `/blog/[slug]` - Blog post detail
- `/events` - Events listing
- `/events/[id]` - Event detail
- `/resources` - Resource library
- `/contact` - Contact page

**Auth Pages:**
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset

**Protected Admin Pages:**
- `/admin/dashboard` - Admin overview
- `/admin/appointments` - Appointment management
- `/admin/blog` - Blog CMS
- `/admin/events` - Event management
- `/admin/services` - Service management

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Auth Flow

**1. User Registration:**
```typescript
// Client-side (React)
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
  }
})
```

**2. Email Verification:**
- Supabase sends verification email
- User clicks link → redirects to `/auth/callback`
- Session established via JWT token

**3. Login:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})
```

**4. Session Management:**
- JWT stored in HTTP-only cookies (via middleware)
- Auto-refresh on token expiration
- `useAuth` hook provides user state across app

### Role-Based Access Control (RBAC)

**Roles:**
- `user` (default) - Can book appointments, view content
- `admin` - Full access to admin dashboard

**Admin Assignment:**
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}', '"admin"'
)
WHERE email = 'admin@example.com';
```

**Admin Check (Database Function):**
```sql
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json
    ->'user_metadata'->>'role' = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Middleware Protection:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  return response
}
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

#### `services`
**Purpose:** Service catalog (e.g., Yoga, Meditation, Therapy)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Service name |
| slug | text | URL-friendly identifier |
| short_description | text | Brief summary |
| description | text | Full markdown content |
| category_id | uuid | FK to service_categories |
| price | decimal | Optional pricing |
| duration_minutes | integer | Session length |
| image_url | text | Header image |
| is_published | boolean | Visibility control |
| created_at | timestamptz | Auto-generated |
| updated_at | timestamptz | Auto-updated |

**RLS Policies:**
- Public SELECT (where `is_published = true`)
- Admin INSERT/UPDATE/DELETE

---

#### `appointments`
**Purpose:** Track booking requests

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| service_id | uuid | FK to services |
| modality | text | In-person or Virtual |
| appointment_date | date | Scheduled date |
| time_slot | time | Scheduled time |
| status | text | pending/confirmed/approved/cancelled |
| patient_name | text | Full name |
| patient_email | text | Contact email |
| patient_phone | text | Contact phone |
| additional_notes | text | Special requests |
| created_at | timestamptz | Booking timestamp |

**RLS Policies:**
- Users can SELECT own appointments (`user_id = auth.uid()`)
- Users can INSERT (anyone can book)
- Admin can SELECT/UPDATE all

**Status Workflow:**
1. `pending` - Initial booking
2. `confirmed` - Admin acknowledges
3. `approved` - Final confirmation
4. `cancelled` - User/admin cancels

---

#### `blog_posts`
**Purpose:** Content management

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Post title |
| slug | text | URL identifier (unique) |
| excerpt | text | SEO description |
| content | text | Full markdown content |
| featured_image_url | text | Header image |
| author_id | uuid | FK to auth.users |
| category | text | Optional category tag |
| tags | text[] | Array of tags |
| is_published | boolean | Draft vs published |
| published_at | timestamptz | Publish date |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last edit |

**RLS Policies:**
- Public SELECT (where `is_published = true`)
- Admin INSERT/UPDATE/DELETE

---

#### `events`
**Purpose:** Workshops, webinars, group sessions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Event name |
| description | text | Full details |
| event_date | timestamptz | Start date/time |
| end_date | timestamptz | End date/time |
| location | text | Venue or "Virtual" |
| max_participants | integer | Capacity limit |
| current_participants | integer | Counter |
| registration_link | text | External URL or internal |
| image_url | text | Event banner |
| is_published | boolean | Visibility |
| created_at | timestamptz | Auto-generated |

**RLS Policies:**
- Public SELECT (where `is_published = true`)
- Admin INSERT/UPDATE/DELETE

---

#### `weekly_availability`
**Purpose:** Define clinic operating hours per weekday

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| day_of_week | integer | 0=Monday, 6=Sunday |
| start_time | time | Opening time (e.g., 09:00) |
| end_time | time | Closing time (e.g., 17:00) |
| is_active | boolean | Enable/disable day |

**Example Data:**
```sql
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active)
VALUES
  (0, '09:00', '17:00', true),  -- Monday
  (1, '09:00', '17:00', true),  -- Tuesday
  (2, '09:00', '17:00', true),  -- Wednesday
  (3, '09:00', '17:00', true),  -- Thursday
  (4, '09:00', '17:00', true);  -- Friday
```

---

#### `time_slots`
**Purpose:** 30-minute booking intervals

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| time | time | Slot time (09:00, 09:30, 10:00, etc.) |

**Generated via SQL script** (16 slots from 9 AM - 5 PM)

---

#### `resources`
**Purpose:** Downloadable guides, PDFs, videos

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Resource name |
| description | text | Summary |
| category | text | e.g., "Guide", "Video" |
| file_url | text | Supabase Storage link |
| thumbnail_url | text | Preview image |
| download_count | integer | Usage metric |
| is_published | boolean | Visibility |
| created_at | timestamptz | Upload date |

**RLS Policies:**
- Public SELECT (where `is_published = true`)
- Admin INSERT/UPDATE/DELETE

---

### Key Database Functions

#### `get_available_slots(start_date, end_date, modality_filter)`
**Purpose:** Returns available booking slots grouped by date

**Logic:**
1. Generate date range from `start_date` to `end_date`
2. Join with `weekly_availability` (filter active days)
3. Join with `time_slots`
4. Exclude slots with existing appointments (`status != 'cancelled'`)
5. Return JSON: `{ "2026-01-27": [...slots], "2026-01-28": [...slots] }`

**Usage:**
```typescript
const { data } = await supabase.rpc('get_available_slots', {
  start_date: '2026-01-27',
  end_date: '2026-02-03',
  modality_filter: 'In-Person'
})
```

**Return Example:**
```json
{
  "2026-01-27": [
    { "time": "09:00:00", "available": true },
    { "time": "09:30:00", "available": true },
    { "time": "10:00:00", "available": false }
  ]
}
```

---

#### `get_available_dates(start_date, end_date)`
**Purpose:** Returns array of dates with at least one available slot

**Logic:**
1. Call `get_available_slots()` internally
2. Filter dates where `available: true` exists
3. Return string array: `["2026-01-27", "2026-01-28"]`

---

#### `check_slot_available(date, time, modality)`
**Purpose:** Validate slot before booking (race condition check)

**Returns:** Boolean (true = available, false = taken)

---

#### `is_admin()`
**Purpose:** Check if current user has admin role

**Returns:** Boolean (used in RLS policies)

---

### Storage Buckets

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `blog-images` | Yes | Blog post featured images |
| `resource-files` | Yes | Downloadable PDFs/guides |
| `event-banners` | Yes | Event promotional images |

**RLS Policies:**
- Public SELECT (read access)
- Admin INSERT (upload access)

---

## 🔒 ROW-LEVEL SECURITY (RLS) STRATEGY

### Philosophy
**Default Deny:** All tables have RLS enabled with no implicit access

**Policy Types:**
1. **Public Read** - `is_published = true` content
2. **User Ownership** - Users can CRUD own data (`user_id = auth.uid()`)
3. **Admin Full Access** - `is_admin() = true` bypasses restrictions

### Example Policies

#### Services Table
```sql
-- Public can view published services
CREATE POLICY "Public can view published services"
ON services FOR SELECT
USING (is_published = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage services"
ON services FOR ALL
USING (is_admin());
```

#### Appointments Table
```sql
-- Users can view own appointments
CREATE POLICY "Users can view own appointments"
ON appointments FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can create appointments
CREATE POLICY "Anyone can book appointments"
ON appointments FOR INSERT
WITH CHECK (true);

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments"
ON appointments FOR SELECT
USING (is_admin());

-- Admins can update appointments
CREATE POLICY "Admins can update appointments"
ON appointments FOR UPDATE
USING (is_admin());
```

#### Storage Objects
```sql
-- Public read for blog images
CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Admins can upload blog images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND is_admin()
);
```

### Security Considerations
- **JWT Claims:** Admin role stored in `user_metadata` (not `app_metadata`)
- **SECURITY DEFINER:** `is_admin()` function runs with elevated privileges
- **Session Validation:** Middleware checks session on every admin route
- **SQL Injection:** All queries use parameterized statements
- **CSRF:** Next.js CSRF protection via SameSite cookies

---

## 🚀 DEPLOYMENT FLOW

### Development Environment
```bash
# Frontend
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000

# Environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Deployment

**1. Supabase Setup**
- Create project at supabase.com
- Run SQL migrations from `all_querries.sql`
- Run initialization scripts:
  - `SETUP_BOOKING_SLOTS.sql`
  - `FIX_IS_ADMIN_FUNCTION.sql`
  - `MAKE_ME_ADMIN.sql` (with your email)
- Configure storage buckets
- Enable RLS on all tables
- Create policies as documented

**2. Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variables in Vercel dashboard
# OR via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Deploy
vercel --prod
```

**3. Environment Variables (Production)**
| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://tzwellnesscentre.com` | Yes |

**4. Post-Deploy Checklist**
- [ ] Verify homepage loads
- [ ] Test user registration/login
- [ ] Test admin login
- [ ] Create test appointment
- [ ] Upload test blog post
- [ ] Check SEO metadata (View Source)
- [ ] Test mobile responsiveness
- [ ] Verify WhatsApp links work

---

## 🌐 SUPABASE USAGE

### Client Initialization

**Client-Side (Browser):**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Server-Side (API Routes):**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Middleware (Session Management):**
```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  await supabase.auth.getUser()  // Refreshes session
  return response
}
```

### API Patterns

**Fetching Data:**
```typescript
// Get all published services
const { data: services, error } = await supabase
  .from('services')
  .select('*')
  .eq('is_published', true)
  .order('created_at', { ascending: false })

if (error) throw error
return services
```

**Inserting Data:**
```typescript
// Create appointment
const { data, error } = await supabase
  .from('appointments')
  .insert({
    user_id: user.id,
    service_id: serviceId,
    appointment_date: date,
    time_slot: time,
    status: 'pending',
    patient_name: name,
    patient_email: email,
  })
  .select()
  .single()
```

**Calling Functions:**
```typescript
// Get available slots
const { data, error } = await supabase.rpc('get_available_slots', {
  start_date: '2026-01-27',
  end_date: '2026-02-03',
  modality_filter: null
})
```

**File Upload:**
```typescript
// Upload blog image
const fileName = `${Date.now()}-${file.name}`
const { data, error } = await supabase.storage
  .from('blog-images')
  .upload(fileName, file)

if (error) throw error

const { data: { publicUrl } } = supabase.storage
  .from('blog-images')
  .getPublicUrl(fileName)
```

---

## 🧩 KEY DESIGN DECISIONS

### Why Next.js App Router?
- **SSR & SSG:** SEO-critical pages pre-rendered
- **Server Components:** Reduced client bundle size
- **File-based Routing:** Intuitive page structure
- **API Routes:** Backend logic without separate server

### Why Supabase Over Custom Backend?
- **Speed:** PostgreSQL + Auth + Storage + Realtime in one
- **RLS:** Database-level security instead of middleware
- **Realtime:** WebSocket connections for live updates (future feature)
- **Cost:** Free tier sufficient for MVP, scales predictably

### Why TypeScript?
- **Type Safety:** Catch errors at compile-time
- **API Contracts:** Supabase types auto-generated
- **Refactoring:** Confident large-scale changes
- **Tooling:** Better IDE autocomplete and refactoring

### Why Zustand Over Redux?
- **Simplicity:** Minimal boilerplate
- **Size:** 1KB vs 3KB (Redux Toolkit)
- **Persist Middleware:** Built-in localStorage sync
- **Learning Curve:** Easier for small team

### Why React Query?
- **Caching:** Avoid redundant API calls
- **Stale-While-Revalidate:** Show cached data, fetch in background
- **Loading States:** Built-in `isLoading`, `isError`
- **Mutations:** Optimistic updates for better UX

### Why Shadcn/UI Over Material-UI?
- **Customization:** Full control over component code
- **Accessibility:** Built on Radix UI primitives (ARIA compliant)
- **Tree-Shaking:** Copy only components you use
- **No Runtime:** Components compile to Tailwind CSS

---

## 📦 COMPONENT ARCHITECTURE

### Atomic Design Principles

**1. Atoms (UI Primitives)**
- `Button`, `Input`, `Badge`, `Avatar`
- Located in `components/ui/`
- Sourced from Shadcn/UI
- No business logic, only presentation

**2. Molecules (Composite Components)**
- `ServiceCard`, `TestimonialCard`, `StatCard`
- Located in `components/[domain]/`
- Combine atoms with minimal logic
- Accept props for reusability

**3. Organisms (Feature Sections)**
- `ServicesSection`, `HeroSection`, `BookingForm`
- Located in `components/[domain]/`
- Complex logic, state management
- Domain-specific (home, booking, admin)

**4. Templates (Page Layouts)**
- `DashboardLayout`, `MainLayout`
- Located in `components/layout/`
- Composition of organisms
- Define page structure

**5. Pages (Route Components)**
- `page.tsx` in `app/` directory
- Fetch data, pass to templates
- Handle routing, metadata

### Component Patterns

**Server Components (Default):**
```typescript
// app/services/page.tsx
export default async function ServicesPage() {
  const services = await getServices()  // Direct DB call
  return <ServicesGrid services={services} />
}
```

**Client Components (Interactive):**
```typescript
'use client'

export function BookingForm() {
  const [date, setDate] = useState<Date>()
  // ... event handlers
}
```

**Shared Components:**
```typescript
// components/services/service-card.tsx
interface ServiceCardProps {
  service: Service
  showBookButton?: boolean
}

export function ServiceCard({ service, showBookButton }: ServiceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.title}</CardTitle>
      </CardHeader>
      {/* ... */}
    </Card>
  )
}
```

---

## 🔧 UTILITY FUNCTIONS

### Navigation Configuration (`lib/navigation-config.ts`)
- Centralized site navigation structure
- Used by header, footer, sitemap
- Social media links
- Contact information

### WhatsApp Utility (`lib/whatsapp.ts`)
- `getWhatsAppLink()` - Generate wa.me URL
- `getWhatsAppNumber()` - Extract phone from tel: href
- Pre-filled message templates
- Used across 9 components

### API Client (`lib/api.ts`)
- Type-safe Supabase query wrappers
- Error handling
- Response type definitions
- Used by pages and components

### Utilities (`lib/utils.ts`)
- `cn()` - Tailwind class merging (clsx + tailwind-merge)
- Date formatting helpers
- String manipulation
- Shared validation logic

---

## 📊 PERFORMANCE OPTIMIZATIONS

### Bundle Size
- **Homepage:** 14.1 kB (gzipped)
- **Services:** 7.29 kB
- **Admin Dashboard:** 41.7 kB

**Techniques:**
1. **Code Splitting:** Each route lazy-loaded
2. **Tree Shaking:** Unused Tailwind classes purged
3. **Image Optimization:** Next.js `<Image>` with WebP
4. **Font Optimization:** Next.js Font with subset loading

### Data Fetching
- **React Query Cache:** 5-minute stale time
- **Supabase RLS:** Database-level filtering (no overfetching)
- **SELECT Specific Columns:** Avoid `SELECT *`
- **Pagination:** Limit queries to 10-20 items

### Rendering Strategy
- **Static Pages:** About, Contact (pre-rendered at build)
- **ISR:** Blog posts (revalidate every 60 seconds)
- **Dynamic:** Booking, Admin (server-rendered per request)

---

## 🚧 KNOWN CONSTRAINTS

### Technical Limitations
1. **Booking Concurrency:** No optimistic locking (race conditions possible)
2. **Email Customization:** Limited to Supabase Auth templates
3. **Storage Limits:** 1GB free tier (Supabase)
4. **RLS Performance:** Complex policies may slow queries
5. **No Offline Mode:** Requires internet connection

### Business Rules
1. **Single Service Per Appointment:** Can't book multiple services
2. **30-Minute Slots:** Fixed interval (configurable in DB)
3. **No Recurring Appointments:** Each booking is one-time
4. **No Payment Gateway:** Bookings are inquiry-only
5. **Admin Role Manual:** No self-service admin creation

### Scalability Considerations
1. **Database Indexes:** Add on `slug`, `email`, `appointment_date` if slow
2. **CDN Caching:** Vercel Edge Network caches static assets
3. **Rate Limiting:** No current implementation (potential abuse vector)
4. **Background Jobs:** No task queue (use Vercel Cron or Supabase Edge Functions)

---

## 🔄 FUTURE ROADMAP (Not Implemented)

### Phase 2 Features
- [ ] Payment gateway (Stripe/PayPal)
- [ ] Recurring appointments
- [ ] Email notifications (custom templates)
- [ ] SMS reminders (Twilio)
- [ ] Multi-language support (i18n)
- [ ] Advanced admin analytics
- [ ] User reviews/testimonials

### Technical Debt
- [ ] Add E2E tests (Playwright)
- [ ] Unit tests for critical functions
- [ ] Storybook for component library
- [ ] OpenAPI spec for API routes
- [ ] Database migration tool (Prisma/Drizzle)
- [ ] Error monitoring (Sentry)

---

## 🛠️ DEVELOPMENT WORKFLOW

### Local Setup
```bash
# Clone repository
git clone https://github.com/iZzIbRaHiM/TZWellness.git
cd TZWellness/frontend

# Install dependencies
npm install

# Create .env.local (see Environment Variables)
# Start dev server
npm run dev
```

### Code Standards
- **Linting:** ESLint with Next.js config
- **Formatting:** Prettier (auto-format on save)
- **Commit Messages:** Conventional commits (feat:, fix:, docs:)
- **Branch Strategy:** main (production), feature/* (development)

### Database Changes
1. Write SQL migration in root directory (`*.sql`)
2. Test in Supabase SQL Editor
3. Document in migration file header
4. Run in production via SQL Editor
5. Commit `.sql` file to Git

### Deployment Process
1. Push to `main` branch
2. Vercel auto-deploys (2-3 minutes)
3. Test production URL
4. Monitor Vercel dashboard for errors

---

## 📞 SUPPORT & MAINTENANCE

### Key Files for Troubleshooting
- `ISSUES_AND_FIXES.md` - Error reference guide
- `PROJECT_AUDIT_REPORT.md` - File inventory and cleanup plan
- `all_querries.sql` - Master database schema
- `logs/` - Server logs (if enabled)

### Common Maintenance Tasks
1. **Update Service:** Edit in admin dashboard → auto-saves to DB
2. **Assign Admin:** Run `MAKE_ME_ADMIN.sql` with new email
3. **Change Business Hours:** Update `weekly_availability` table
4. **Add Time Slot:** Insert into `time_slots` table
5. **Backup Database:** Supabase Dashboard → Database → Backups

### Monitoring
- **Vercel Analytics:** Page views, Web Vitals
- **Supabase Logs:** Query performance, errors
- **Browser Console:** Client-side errors (check in production)

---

## 🎯 SUCCESS METRICS

### Technical KPIs
- **Uptime:** 99.9% (Vercel SLA)
- **Page Load:** < 3 seconds (mobile 3G)
- **TypeScript Errors:** 0
- **Build Time:** < 2 minutes
- **Bundle Size:** < 50 kB per route

### Business KPIs
- **Appointment Conversion:** Booking form submissions
- **Blog Engagement:** Post views, time on page
- **SEO Performance:** Google Search Console rankings
- **Mobile Traffic:** 60%+ mobile users

---

## 📝 DOCUMENTATION MAINTENANCE

**Update Frequency:**
- After major features: Update architecture section
- After bug fixes: Update ISSUES_AND_FIXES.md
- After schema changes: Update database schema section
- Quarterly: Review and archive old documentation

**Owner:** Lead developer (iZzIbRaHiM)  
**Last Review:** January 27, 2026  
**Next Review:** April 2026

---

**Document Purpose:** Complete technical reference for TZ Wellness project  
**Intended Audience:** Senior engineers, AI agents, technical stakeholders  
**Usage:** Onboarding, troubleshooting, architecture decisions
