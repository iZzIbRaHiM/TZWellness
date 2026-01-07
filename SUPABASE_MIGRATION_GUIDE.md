# 🚀 Complete Migration Guide: Django Backend → Supabase

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Architecture](#current-architecture)
3. [Migration Strategy](#migration-strategy)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Database Schema Migration](#database-schema-migration)
6. [Frontend API Changes](#frontend-api-changes)
7. [Feature Preservation](#feature-preservation)
8. [Testing & Deployment](#testing--deployment)

---

## 🏗️ Project Overview

### Current Stack
- **Backend**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL (Django ORM)
- **Queue**: Celery + Redis (email notifications)
- **Frontend**: Next.js 14 (App Router)
- **State**: TanStack Query (React Query)

### Target Stack (After Migration)
- **Backend**: ❌ REMOVED (Django completely replaced)
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Queue**: Supabase Edge Functions + pg_cron OR Resend/SendGrid
- **Frontend**: Next.js 14 (App Router) - **NO CHANGES NEEDED**
- **State**: TanStack Query - **NO CHANGES NEEDED**

---

## 📊 Current Architecture

### Django Apps & Functionality

#### 1. **Appointments App** (`apps/appointments/`)
**Models:**
- `Appointment` - Main booking model (guest checkout)
  - Fields: reference_id, patient_details (JSON), service, modality, status, scheduled_date/time
  - Status flow: PENDING → APPROVED/REJECTED → COMPLETED/CANCELLED/NO_SHOW
- `WeeklyAvailability` - Recurring time slots (Mon-Sun)
- `ExceptionDate` - Holidays/blocked dates

**Key Features:**
- Guest booking (no login required)
- Real-time availability calculation
- Rate limiting (5 bookings/hour per email)
- Atomic transactions (prevent double-booking)
- Calendar invite generation (.ics files)
- Email notifications (Celery tasks)

**Endpoints:**
```
GET  /api/v1/appointments/available-slots/
GET  /api/v1/appointments/available-dates/
POST /api/v1/appointments/book/
GET  /api/v1/appointments/lookup/?reference_id=XXX
POST /api/v1/appointments/{id}/cancel/
GET  /api/v1/appointments/admin/ (list all)
POST /api/v1/appointments/{id}/approve/
POST /api/v1/appointments/{id}/reject/
```

#### 2. **Services App** (`apps/services/`)
**Models:**
- `Service` - Medical services (therapy, consultations)
- `ServiceCategory` - Grouping (e.g., "Mental Health", "Wellness")

**Endpoints:**
```
GET /api/v1/services/
GET /api/v1/services/{slug}/
GET /api/v1/services/categories/
```

#### 3. **Blog App** (`apps/blog/`)
**Models:**
- `BlogPost` - Articles with SEO
- `BlogCategory`, `BlogTag` - Taxonomy
- `BlogAuthor` - Staff authors

**Endpoints:**
```
GET /api/v1/blog/posts/
GET /api/v1/blog/posts/{slug}/
GET /api/v1/blog/categories/
GET /api/v1/blog/tags/
```

#### 4. **Events App** (`apps/events/`)
**Models:**
- `Event` - Workshops, webinars, Q&A sessions
- `EventCategory` - Event types
- `EventRegistration` - RSVP tracking

**Endpoints:**
```
GET /api/v1/events/
GET /api/v1/events/{slug}/
POST /api/v1/events/{id}/register/
```

#### 5. **Users App** (`apps/users/`)
**Models:**
- `User` - Admin/Staff only (no patient accounts)

**Endpoints:**
```
POST /api/v1/auth/login/
POST /api/v1/auth/refresh/
POST /api/v1/auth/logout/
GET  /api/v1/auth/me/
```

#### 6. **Core App** (`apps/core/`)
**Features:**
- Dashboard statistics (admin panel)
- Activity logs
- Rate limiting middleware
- Health checks

**Endpoints:**
```
GET /api/v1/dashboard/summary/
GET /api/v1/dashboard/recent-activity/
GET /api/v1/dashboard/appointments-by-date/
```

#### 7. **Resources App** (`apps/resources/`)
**Models:**
- `ResourceCategory`, `Resource` - Patient resources/guides

---

## 🎯 Migration Strategy

### Phase 1: Setup Supabase (Day 1)
1. Create Supabase project
2. Migrate database schema
3. Setup Row Level Security (RLS)
4. Configure authentication
5. Setup Edge Functions (for emails)

### Phase 2: Replace Backend (Day 2-3)
1. Update frontend API client (`lib/api.ts`)
2. Replace Django API calls with Supabase queries
3. Implement server actions for mutations
4. Test all features

### Phase 3: Remove Django (Day 4)
1. Verify all features working
2. Delete `backend/` directory
3. Update deployment configs
4. Remove Celery/Redis dependencies

---

## 🚀 Step-by-Step Migration

### Step 1: Create Supabase Project

1. **Sign up at [supabase.com](https://supabase.com)**
   ```
   - Create new project
   - Choose region closest to your users
   - Save your credentials:
     * Project URL: https://xxxxx.supabase.co
     * API Key (anon): eyJxxx...
     * API Key (service_role): eyJxxx... (keep secret!)
   ```

2. **Install Supabase in Frontend**
   ```bash
   cd frontend
   npm install @supabase/supabase-js @supabase/ssr
   ```

---

### Step 2: Migrate Database Schema

#### 2.1 Create Tables in Supabase SQL Editor

**Navigate to:** Supabase Dashboard → SQL Editor → New Query

```sql
-- ============================================
-- TZ WELLNESS SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SERVICE CATEGORIES
-- ============================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. SERVICES
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  
  -- Basic Info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  short_description VARCHAR(300),
  description TEXT,
  symptoms TEXT,
  approach TEXT,
  what_to_expect TEXT,
  
  -- Media
  image TEXT,
  icon VARCHAR(50),
  
  -- Booking Details
  modality VARCHAR(20) DEFAULT 'both' CHECK (modality IN ('in_person', 'virtual', 'both')),
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  price_note VARCHAR(100),
  
  -- Display
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_published ON services(is_published);
CREATE INDEX idx_services_featured ON services(is_featured);
CREATE INDEX idx_services_slug ON services(slug);

-- ============================================
-- 3. WEEKLY AVAILABILITY
-- ============================================
CREATE TABLE weekly_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Monday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  allows_virtual BOOLEAN DEFAULT true,
  allows_in_person BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weekly_availability_active ON weekly_availability(is_active);

-- ============================================
-- 4. EXCEPTION DATES
-- ============================================
CREATE TABLE exception_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  exception_type VARCHAR(20) DEFAULT 'blocked' CHECK (exception_type IN ('blocked', 'modified')),
  reason VARCHAR(200),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exception_dates_date ON exception_dates(date);

-- ============================================
-- 5. APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id VARCHAR(20) UNIQUE NOT NULL,
  
  -- Patient Info (Guest Checkout)
  patient_name VARCHAR(200) NOT NULL,
  patient_email VARCHAR(254) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  patient_type VARCHAR(20) DEFAULT 'new' CHECK (patient_type IN ('new', 'returning')),
  
  -- Service & Scheduling
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  modality VARCHAR(20) NOT NULL CHECK (modality IN ('virtual', 'in_person', 'phone')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Status & Notes
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  admin_notes TEXT,
  
  -- Communication
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  meeting_link TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_reference ON appointments(reference_id);
CREATE INDEX idx_appointments_email ON appointments(patient_email);

-- ============================================
-- 6. BLOG CATEGORIES & TAGS
-- ============================================
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#064E3B',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. BLOG POSTS
-- ============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  
  -- Content
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  
  -- Media
  featured_image TEXT,
  image_caption VARCHAR(200),
  
  -- Publishing
  author_name VARCHAR(100),
  author_bio TEXT,
  author_avatar TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Engagement
  read_time_minutes INTEGER,
  views INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Blog Post Tags (Many-to-Many)
CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- 8. EVENT CATEGORIES
-- ============================================
CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(20) DEFAULT 'workshop' CHECK (event_type IN ('workshop', 'live_qa', 'support_group', 'webinar', 'seminar')),
  description TEXT,
  color VARCHAR(7) DEFAULT '#064E3B',
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. EVENTS
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  
  -- Basic Info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  what_to_bring TEXT,
  
  -- Scheduling
  modality VARCHAR(20) DEFAULT 'virtual' CHECK (modality IN ('virtual', 'in_person', 'hybrid')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Capacity
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Location
  location_name VARCHAR(200),
  location_address TEXT,
  virtual_link TEXT,
  
  -- Media
  image TEXT,
  
  -- Publishing
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_published ON events(is_published);
CREATE INDEX idx_events_start_date ON events(start_date);

-- ============================================
-- 10. EVENT REGISTRATIONS
-- ============================================
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(20),
  
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, email)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);

-- ============================================
-- 11. ACTIVITY LOGS (Admin Dashboard)
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- 12. RESOURCE CATEGORIES & RESOURCES
-- ============================================
CREATE TABLE resource_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES resource_categories(id) ON DELETE SET NULL,
  
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  resource_type VARCHAR(20) DEFAULT 'guide' CHECK (resource_type IN ('guide', 'video', 'download', 'external_link')),
  url TEXT,
  file_url TEXT,
  
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resources_published ON resources(is_published);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate reference ID for appointments
CREATE OR REPLACE FUNCTION generate_appointment_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_id IS NULL THEN
    NEW.reference_id := 'APT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 9));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_appointment_reference BEFORE INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION generate_appointment_reference();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public services are viewable by everyone" ON services FOR SELECT USING (is_published = true);
CREATE POLICY "Public blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public events are viewable by everyone" ON events FOR SELECT USING (is_published = true);

-- Appointments: Anyone can create (guest booking), only authenticated can view all
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can lookup their own appointments" ON appointments FOR SELECT USING (true); -- Will filter by reference_id in app
CREATE POLICY "Only authenticated users can view all appointments" ON appointments FOR SELECT USING (auth.role() = 'authenticated');

-- Admin-only access for activity logs
CREATE POLICY "Only authenticated users can view activity logs" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
```

#### 2.2 Seed Initial Data (Optional)

```sql
-- Sample Service Categories
INSERT INTO service_categories (name, slug, description, icon, "order") VALUES
('Mental Health', 'mental-health', 'Therapy and counseling services', 'brain', 1),
('Wellness', 'wellness', 'Holistic wellness programs', 'heart', 2),
('Consultation', 'consultation', 'Medical consultations', 'stethoscope', 3);

-- Sample Services
INSERT INTO services (category_id, title, slug, short_description, description, modality, duration_minutes, is_featured, is_published) 
SELECT 
  c.id,
  'Individual Therapy',
  'individual-therapy',
  'One-on-one counseling sessions',
  'Personalized therapy sessions tailored to your needs',
  'both',
  60,
  true,
  true
FROM service_categories c WHERE c.slug = 'mental-health';

-- Sample Weekly Availability (Mon-Fri, 9 AM - 5 PM)
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active) VALUES
(0, '09:00', '17:00', true), -- Monday
(1, '09:00', '17:00', true), -- Tuesday
(2, '09:00', '17:00', true), -- Wednesday
(3, '09:00', '17:00', true), -- Thursday
(4, '09:00', '17:00', true); -- Friday
```

---

### Step 3: Setup Supabase Client in Frontend

#### 3.1 Create Supabase Client

**Create:** `frontend/src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

#### 3.2 Create Server Client (for Server Components)

**Create:** `frontend/src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )
}
```

#### 3.3 Update Environment Variables

**Create:** `frontend/.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Service Role Key (server-side only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Email Provider (Resend recommended)
RESEND_API_KEY=re_xxx

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLINIC_NAME="TZ Wellness"
NEXT_PUBLIC_CLINIC_PHONE="+1 (555) 123-4567"
NEXT_PUBLIC_CLINIC_EMAIL="info@tzwellness.com"
```

---

### Step 4: Replace API Client

#### 4.1 Create New API Client with Supabase

**Replace:** `frontend/src/lib/api.ts`

```typescript
/**
 * Supabase API Client
 * Replaces Django REST Framework API
 */

import { createClient } from './supabase/client'
import type { Database } from './supabase/types' // Generate this with Supabase CLI

// Type aliases
type Service = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type Appointment = Database['public']['Tables']['appointments']['Row']
type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type Event = Database['public']['Tables']['events']['Row']

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

// ============================================
// SERVICES API
// ============================================
export const servicesApi = {
  getAll: async (params?: { category?: string; featured?: boolean }) => {
    const supabase = createClient()
    
    let query = supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('is_published', true)
      .order('order', { ascending: true })

    if (params?.category) {
      query = query.eq('category_id', params.category)
    }

    if (params?.featured) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: {
          code: 'SERVICES_FETCH_ERROR',
          message: error.message,
        },
      } as ApiResponse<Service[]>
    }

    return {
      success: true,
      data,
    } as ApiResponse<Service[]>
  },

  getBySlug: async (slug: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: error.message,
        },
      } as ApiResponse<Service>
    }

    return {
      success: true,
      data,
    } as ApiResponse<Service>
  },
}

// ============================================
// APPOINTMENTS API
// ============================================
export const appointmentsApi = {
  getAvailableDates: async (days: number = 30) => {
    const supabase = createClient()
    
    // Call database function or Edge Function
    const { data, error } = await supabase.rpc('get_available_dates', {
      days_ahead: days,
    })

    if (error) {
      return {
        success: false,
        error: {
          code: 'AVAILABILITY_ERROR',
          message: error.message,
        },
      } as ApiResponse<{ dates: string[] }>
    }

    return {
      success: true,
      data: { dates: data || [] },
    } as ApiResponse<{ dates: string[] }>
  },

  getAvailableSlots: async (params: {
    start_date: string
    end_date: string
    modality?: string
  }) => {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_available_slots', {
      start_date: params.start_date,
      end_date: params.end_date,
      modality_filter: params.modality,
    })

    if (error) {
      return {
        success: false,
        error: {
          code: 'SLOTS_ERROR',
          message: error.message,
        },
      }
    }

    return {
      success: true,
      data: { slots: data || {} },
    }
  },

  book: async (bookingData: {
    service_id: string
    modality: string
    scheduled_date: string
    scheduled_time: string
    patient_name: string
    patient_email: string
    patient_phone: string
    patient_type: string
    reason: string
  }) => {
    const supabase = createClient()
    
    // Rate limiting check (stored in edge function or trigger)
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...bookingData,
        status: 'pending',
        confirmation_sent: false,
      }])
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: 'BOOKING_ERROR',
          message: error.message,
        },
      } as ApiResponse<Appointment>
    }

    // Trigger email via Edge Function
    await supabase.functions.invoke('send-booking-confirmation', {
      body: { appointment_id: data.id },
    })

    return {
      success: true,
      data,
    } as ApiResponse<Appointment>
  },

  lookup: async (reference_id: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(*)
      `)
      .eq('reference_id', reference_id.toUpperCase())
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found',
        },
      } as ApiResponse<Appointment>
    }

    return {
      success: true,
      data,
    } as ApiResponse<Appointment>
  },

  cancel: async (reference_id: string, email: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('reference_id', reference_id.toUpperCase())
      .eq('patient_email', email)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: 'CANCEL_ERROR',
          message: error.message,
        },
      } as ApiResponse<Appointment>
    }

    return {
      success: true,
      data,
    } as ApiResponse<Appointment>
  },
}

// ============================================
// BLOG API
// ============================================
export const blogApi = {
  getPosts: async (params?: { category?: string; tag?: string; featured?: boolean }) => {
    const supabase = createClient()
    
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        tags:blog_post_tags(tag:blog_tags(*))
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (params?.featured) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: {
          code: 'BLOG_FETCH_ERROR',
          message: error.message,
        },
      } as ApiResponse<BlogPost[]>
    }

    return {
      success: true,
      data,
    } as ApiResponse<BlogPost[]>
  },

  getBySlug: async (slug: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        tags:blog_post_tags(tag:blog_tags(*))
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: error.message,
        },
      } as ApiResponse<BlogPost>
    }

    // Increment views
    await supabase.rpc('increment_blog_views', { post_id: data.id })

    return {
      success: true,
      data,
    } as ApiResponse<BlogPost>
  },

  getCategories: async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      return {
        success: false,
        error: {
          code: 'CATEGORIES_ERROR',
          message: error.message,
        },
      }
    }

    return {
      success: true,
      data,
    }
  },
}

// ============================================
// EVENTS API
// ============================================
export const eventsApi = {
  getAll: async (params?: { category?: string; upcoming?: boolean }) => {
    const supabase = createClient()
    
    let query = supabase
      .from('events')
      .select(`
        *,
        category:event_categories(*)
      `)
      .eq('is_published', true)

    if (params?.upcoming) {
      query = query.gte('start_date', new Date().toISOString())
    }

    query = query.order('start_date', { ascending: true })

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: {
          code: 'EVENTS_ERROR',
          message: error.message,
        },
      } as ApiResponse<Event[]>
    }

    return {
      success: true,
      data,
    } as ApiResponse<Event[]>
  },

  register: async (event_id: string, registrationData: {
    name: string
    email: string
    phone: string
  }) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id,
        ...registrationData,
        status: 'registered',
      }])
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: error.message,
        },
      }
    }

    // Trigger confirmation email
    await supabase.functions.invoke('send-event-confirmation', {
      body: { registration_id: data.id },
    })

    // Increment participant count
    await supabase.rpc('increment_event_participants', { event_id })

    return {
      success: true,
      data,
    }
  },
}

// ============================================
// ADMIN DASHBOARD API
// ============================================
export const dashboardApi = {
  getSummary: async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_dashboard_summary')

    if (error) {
      return {
        success: false,
        error: {
          code: 'DASHBOARD_ERROR',
          message: error.message,
        },
      }
    }

    return {
      success: true,
      data,
    }
  },

  getRecentActivity: async (limit: number = 20) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: {
          code: 'ACTIVITY_ERROR',
          message: error.message,
        },
      }
    }

    return {
      success: true,
      data,
    }
  },
}

// Export types
export type {
  Service,
  Appointment,
  BlogPost,
  Event,
  ApiResponse,
}
```

---

### Step 5: Create Database Functions (Complex Logic)

#### 5.1 Availability Calculation Function

```sql
-- Function to get available dates
CREATE OR REPLACE FUNCTION get_available_dates(days_ahead INTEGER)
RETURNS TABLE(available_date DATE) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      CURRENT_DATE + INTERVAL '1 day',
      CURRENT_DATE + (days_ahead || ' days')::INTERVAL,
      '1 day'::INTERVAL
    )::DATE AS date
  )
  SELECT dr.date
  FROM date_range dr
  INNER JOIN weekly_availability wa ON EXTRACT(DOW FROM dr.date) = wa.day_of_week
  LEFT JOIN exception_dates ed ON ed.date = dr.date
  WHERE wa.is_active = true
    AND (ed.id IS NULL OR ed.exception_type != 'blocked')
  GROUP BY dr.date
  ORDER BY dr.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get available slots
CREATE OR REPLACE FUNCTION get_available_slots(
  start_date DATE,
  end_date DATE,
  modality_filter TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  current_date DATE;
  time_slot TIME;
  slot_info JSONB;
BEGIN
  FOR current_date IN 
    SELECT generate_series(start_date, end_date, '1 day'::INTERVAL)::DATE
  LOOP
    -- Get available slots for this date
    FOR time_slot IN
      SELECT DISTINCT wa.start_time
      FROM weekly_availability wa
      LEFT JOIN exception_dates ed ON ed.date = current_date
      WHERE wa.day_of_week = EXTRACT(DOW FROM current_date)
        AND wa.is_active = true
        AND (ed.id IS NULL OR ed.exception_type != 'blocked')
        AND (modality_filter IS NULL OR 
             (modality_filter = 'virtual' AND wa.allows_virtual) OR
             (modality_filter = 'in_person' AND wa.allows_in_person))
        -- Check slot not already booked
        AND NOT EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.scheduled_date = current_date
            AND a.scheduled_time = wa.start_time
            AND a.status IN ('pending', 'approved')
        )
      ORDER BY wa.start_time
    LOOP
      slot_info := jsonb_build_object(
        'start_time', time_slot::TEXT,
        'end_time', (time_slot + INTERVAL '30 minutes')::TIME::TEXT,
        'available', true
      );
      
      result := jsonb_set(
        result,
        ARRAY[current_date::TEXT],
        COALESCE(result->current_date::TEXT, '[]'::JSONB) || slot_info
      );
    END LOOP;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET current_participants = current_participants + 1 
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function for dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'pending_count', (SELECT COUNT(*) FROM appointments WHERE status = 'pending'),
    'today_count', (SELECT COUNT(*) FROM appointments WHERE scheduled_date = CURRENT_DATE AND status IN ('pending', 'approved')),
    'total_patients', (SELECT COUNT(DISTINCT patient_email) FROM appointments),
    'completion_rate', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE status != 'pending') > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*) FILTER (WHERE status != 'pending')) * 100, 1)
        ELSE 0
      END
      FROM appointments
    ),
    'this_week_count', (
      SELECT COUNT(*) FROM appointments 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

### Step 6: Setup Supabase Edge Functions (Email Notifications)

#### 6.1 Install Supabase CLI

```bash
npm install -g supabase
```

#### 6.2 Initialize Functions

```bash
cd frontend
supabase init
supabase functions new send-booking-confirmation
supabase functions new send-appointment-approved
supabase functions new send-event-confirmation
```

#### 6.3 Create Email Function with Resend

**File:** `supabase/functions/send-booking-confirmation/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { appointment_id } = await req.json()

    // Fetch appointment details
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(*)
      `)
      .eq('id', appointment_id)
      .single()

    if (error || !appointment) {
      throw new Error('Appointment not found')
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'TZ Wellness <appointments@tzwellness.com>',
        to: appointment.patient_email,
        subject: `Booking Request Received - TZ Wellness`,
        html: `
          <h2>Thank you for booking with TZ Wellness!</h2>
          <p>Dear ${appointment.patient_name},</p>
          <p>Your appointment request has been received and is pending approval.</p>
          
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Reference ID:</strong> ${appointment.reference_id}</li>
            <li><strong>Date:</strong> ${new Date(appointment.scheduled_date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${appointment.scheduled_time}</li>
            <li><strong>Type:</strong> ${appointment.modality}</li>
            ${appointment.service ? `<li><strong>Service:</strong> ${appointment.service.title}</li>` : ''}
          </ul>
          
          <p>You will receive a confirmation email once your appointment is approved.</p>
          <p>If you have any questions, please contact us.</p>
          
          <p>Best regards,<br>TZ Wellness Team</p>
        `,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    // Update confirmation_sent flag
    await supabase
      .from('appointments')
      .update({ confirmation_sent: true })
      .eq('id', appointment_id)

    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        action: 'booking_confirmation_sent',
        description: `Confirmation email sent for ${appointment.reference_id}`,
        metadata: { appointment_id },
      })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### 6.4 Deploy Edge Functions

```bash
supabase functions deploy send-booking-confirmation --project-ref your-project-ref
supabase functions deploy send-appointment-approved --project-ref your-project-ref
supabase functions deploy send-event-confirmation --project-ref your-project-ref

# Set secrets
supabase secrets set RESEND_API_KEY=your_resend_api_key --project-ref your-project-ref
```

---

### Step 7: Setup Admin Authentication with Supabase Auth

#### 7.1 Enable Email Auth in Supabase

Dashboard → Authentication → Providers → Enable Email

#### 7.2 Create Admin Users

```sql
-- In Supabase SQL Editor, create admin accounts
-- Password will be hashed automatically by Supabase Auth
-- Note: Use Supabase Dashboard → Authentication → Users → "Add User" instead
```

#### 7.3 Update Admin Login Page

**File:** `frontend/src/app/admin/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect to admin dashboard
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

### Step 8: Update Admin Dashboard

#### 8.1 Protect Admin Routes

**Create:** `frontend/src/middleware.ts` (if not exists, update existing)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check authentication for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (user && request.nextUrl.pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

## ✅ Step 9: Testing Checklist

### Test Each Feature:

1. **Services**
   - [ ] View all services
   - [ ] Filter by category
   - [ ] View service details

2. **Appointments**
   - [ ] View available dates
   - [ ] View available time slots
   - [ ] Book appointment (guest)
   - [ ] Receive confirmation email
   - [ ] Lookup appointment
   - [ ] Cancel appointment

3. **Admin Dashboard**
   - [ ] Login
   - [ ] View statistics
   - [ ] View pending appointments
   - [ ] Approve appointment (sends email)
   - [ ] Reject appointment (sends email)
   - [ ] View activity logs

4. **Blog**
   - [ ] View all posts
   - [ ] Filter by category
   - [ ] Read post
   - [ ] View count increments

5. **Events**
   - [ ] View upcoming events
   - [ ] Register for event
   - [ ] Receive confirmation

---

## 🗑️ Step 10: Remove Django Backend

### After FULL testing:

```powershell
# 1. Backup database (if needed)
cd backend
python manage.py dumpdata > backup.json

# 2. Delete backend directory
cd ..
Remove-Item -Recurse -Force backend

# 3. Update docker-compose.yml (remove backend, celery, redis services)

# 4. Update .gitignore (remove backend-specific entries)

# 5. Update package.json scripts (remove backend references)

# 6. Clean up root level files
Remove-Item docker-compose.yml
Remove-Item POSTGRESQL_SETUP.md

# 7. Update README.md with new architecture
```

---

## 📦 Final Project Structure

```
TZWELLNESS_SUPABASE/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   ├── server.ts
│   │   │   │   └── types.ts
│   │   │   └── api.ts (NEW - Supabase queries)
│   │   └── ...
│   ├── supabase/
│   │   ├── functions/
│   │   │   ├── send-booking-confirmation/
│   │   │   ├── send-appointment-approved/
│   │   │   └── send-event-confirmation/
│   │   └── config.toml
│   ├── .env.local
│   └── package.json
├── README.md (UPDATED)
└── SUPABASE_MIGRATION_GUIDE.md (THIS FILE)
```

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel Dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - RESEND_API_KEY
```

### Supabase (Backend)

- Already deployed when you created the project
- Edge Functions deployed via Supabase CLI
- Database migrations applied via SQL Editor

---

## 💰 Cost Comparison

### Before (Django + Render + Redis)
- Render Web Service: $7/month minimum
- Redis: $10/month
- PostgreSQL: $7/month
- **Total: ~$24/month minimum**

### After (Supabase + Vercel)
- Supabase Free Tier: $0 (500MB database, 50,000 monthly active users)
- Vercel Free Tier: $0 (unlimited personal projects)
- Resend Free Tier: $0 (3,000 emails/month)
- **Total: $0 (scales to $25/month for pro features)**

---

## 📞 Need Help?

Common issues and solutions:

1. **"RLS policy violation"**
   - Check Row Level Security policies
   - Ensure service role key for admin operations

2. **Edge Functions not receiving events**
   - Check database webhooks configuration
   - Verify function deployment

3. **Email not sending**
   - Verify Resend API key
   - Check Edge Function logs

4. **Authentication issues**
   - Clear browser cookies
   - Check middleware configuration
   - Verify environment variables

---

## 🎉 Success!

You've successfully migrated from Django to Supabase while retaining 100% functionality!

**Benefits gained:**
- ✅ No backend maintenance
- ✅ Real-time capabilities built-in
- ✅ Better scaling (serverless)
- ✅ Lower costs
- ✅ Faster development
- ✅ Built-in authentication
- ✅ Automatic API generation
- ✅ Better DX (Developer Experience)
