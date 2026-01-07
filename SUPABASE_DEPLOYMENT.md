# 🚀 TZ Wellness - Complete Supabase Deployment Guide

**MIGRATION COMPLETE** ✅ - Django backend has been fully removed and replaced with Supabase.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Setup](#database-setup)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have:

- ✅ **Supabase Account**: [Sign up here](https://supabase.com)
- ✅ **Vercel Account**: [Sign up here](https://vercel.com)
- ✅ **Resend API Key**: [Get it here](https://resend.com) (for email notifications)
- ✅ **Node.js**: Version 18 or higher
- ✅ **Supabase CLI**: Install with `npm install -g supabase`

---

## 🎯 Supabase Setup

### Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `tzwellness` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier works for development

4. Wait 2-3 minutes for project creation

### Step 2: Get Your API Keys

Once project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbG...`)
   - **service_role key** (starts with `eyJhbG...`) - **Keep this secret!**

---

## 💾 Database Setup

### Step 1: Run Database Schema

1. Open **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy entire contents of `supabase-schema.sql`
4. Paste into SQL Editor
5. Click **Run** (or press F5)
6. Wait for success message: **"Success. No rows returned"**

### Step 2: Verify Tables Created

1. Go to **Table Editor**
2. You should see these tables:
   - ✅ `services`
   - ✅ `service_categories`
   - ✅ `appointments`
   - ✅ `weekly_availability`
   - ✅ `exception_dates`
   - ✅ `blog_posts`
   - ✅ `blog_categories`
   - ✅ `blog_tags`
   - ✅ `events`
   - ✅ `event_categories`
   - ✅ `event_registrations`
   - ✅ `resources`
   - ✅ `resource_categories`
   - ✅ `activity_logs`

### Step 3: Test Database Functions

Run these queries in SQL Editor to verify:

```sql
-- Test available dates function
SELECT * FROM get_available_dates(30);

-- Test dashboard summary
SELECT * FROM get_dashboard_summary();

-- Test available slots function
SELECT get_available_slots(
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '7 days',
  'virtual'
);
```

---

## 📧 Edge Functions Deployment

### Step 1: Login to Supabase CLI

```bash
supabase login
```

### Step 2: Link Your Project

```bash
cd c:\Users\HP\Downloads\TZWELLNESS_SUPABASE
supabase link --project-ref YOUR_PROJECT_REF
```

**Replace `YOUR_PROJECT_REF`** with your project reference (found in Project Settings → General).

### Step 3: Set Resend API Key

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Step 4: Deploy All Edge Functions

```bash
# Deploy pending notification (sent immediately after booking)
supabase functions deploy send-pending-notification

# Deploy confirmation email (sent when appointment approved)
supabase functions deploy send-booking-confirmation

# Deploy rejection email (sent when appointment rejected)
supabase functions deploy send-rejection-email

# Deploy event confirmation (sent when user registers for event)
supabase functions deploy send-event-confirmation
```

### Step 5: Verify Deployment

1. Go to **Edge Functions** in Supabase Dashboard
2. You should see all 4 functions listed as **Active**
3. Test a function:
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-pending-notification \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"appointment": {"reference_id": "TEST-123", "patient_name": "Test User", "patient_email": "test@example.com", "scheduled_date": "2024-01-20", "scheduled_time": "10:00", "duration_minutes": 30, "modality": "virtual"}}'
   ```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install the new Supabase packages:
- `@supabase/ssr`
- `@supabase/supabase-js`

### Step 2: Configure Environment Variables

Create `frontend/.env.local` for local testing:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key

# Resend Email (for Edge Functions)
RESEND_API_KEY=re_...your-resend-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Homepage loads
- ✅ Services page displays
- ✅ Appointment booking works
- ✅ Blog posts visible
- ✅ Events page functional

### Step 4: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set up production deployment
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   RESEND_API_KEY
   NEXT_PUBLIC_SITE_URL
   ```

6. Click **Deploy**

### Step 5: Update Supabase Auth Settings

After deployment:

1. Go to **Authentication** → **URL Configuration** in Supabase
2. Add your production URL:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/**`
     - `http://localhost:3000/**` (for local dev)

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret!) | Supabase Dashboard → Settings → API |
| `RESEND_API_KEY` | Resend API key for emails | [Resend Dashboard](https://resend.com/api-keys) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL | Your Vercel deployment URL |

### Security Notes

- ⚠️ **Never commit** `.env.local` to Git
- ⚠️ **Service role key** should only be in Vercel (not in browser code)
- ✅ **Anon key** is safe to expose publicly
- ✅ Use Vercel's environment variable encryption

---

## ✅ Post-Deployment

### 1. Create Admin User

```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@tzwellness.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User","role":"admin"}',
  NOW(),
  NOW()
);
```

Then login at: `https://your-app.vercel.app/admin`

### 2. Add Sample Data (Optional)

Uncomment the seed data section in `supabase-schema.sql` and re-run to populate with sample:
- Service categories
- Services
- Weekly availability (Mon-Fri, 9 AM - 5 PM)

### 3. Configure Email Templates

Customize email templates in Edge Functions:
- Update sender email: `from: 'TZ Wellness <noreply@tzwellness.com>'`
- Modify branding colors
- Add your logo URLs

### 4. Test Complete Flow

1. **Guest Booking Flow**:
   - Visit `/appointments`
   - Book an appointment
   - Check email for pending notification
   - Verify in Supabase Table Editor

2. **Admin Approval Flow**:
   - Login to `/admin`
   - Approve the appointment
   - Check email for confirmation

3. **Event Registration**:
   - Visit `/events`
   - Register for an event
   - Check confirmation email

### 5. Set Up Monitoring

1. **Vercel Analytics**:
   - Enable in Vercel Dashboard → Analytics

2. **Supabase Monitoring**:
   - Go to Dashboard → Database → Query Performance
   - Set up alerts for slow queries

3. **Edge Function Logs**:
   - Dashboard → Edge Functions → Select function → Logs

---

## 🔧 Troubleshooting

### Database Issues

**Problem**: Tables not created
```bash
# Solution: Check for errors in SQL output
# Re-run schema.sql line by line to find issue
```

**Problem**: RLS blocking queries
```sql
-- Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing policies
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Edge Functions Issues

**Problem**: Email not sending
```bash
# Check logs
supabase functions logs send-booking-confirmation

# Verify Resend API key
supabase secrets list
```

**Problem**: Function timeout
```typescript
// Increase timeout in function (default 10s)
// Add to function code:
Deno.serve({ timeout: 30 }, handler)
```

### Frontend Issues

**Problem**: "Invalid API key" error
```bash
# Verify environment variables
vercel env ls

# Re-add if missing
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

**Problem**: Auth not working
- Check Supabase Auth → URL Configuration
- Ensure production URL is in redirect URLs
- Clear browser cookies/cache

### Performance Issues

**Problem**: Slow database queries
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_custom ON table_name(column_name);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM appointments WHERE status = 'pending';
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Resend Documentation](https://resend.com/docs)

---

## 🆘 Support

Need help? Reach out:

- 📧 **Email**: support@tzwellness.com
- 💬 **GitHub Issues**: [Create an issue](https://github.com/yourusername/tzwellness/issues)
- 📖 **Documentation**: This README

---

## 🎉 Migration Complete!

Your TZ Wellness platform is now fully running on Supabase with:

- ✅ PostgreSQL database with 15 tables
- ✅ Row Level Security for data protection
- ✅ Edge Functions for email notifications
- ✅ Guest booking system (no auth required)
- ✅ Admin dashboard for management
- ✅ Automated availability calculation
- ✅ Event registration system
- ✅ Blog with categories and tags
- ✅ Resource library

**Next steps**: Add your content, test thoroughly, and go live! 🚀
