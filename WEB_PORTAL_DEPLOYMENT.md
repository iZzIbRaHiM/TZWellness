# 🌐 TZ Wellness - Web Portal Deployment Guide
**Deploy using web dashboards only (minimal CLI)**

Time Required: 45 minutes  
Goal: Get your app live using web portals

---

## ✅ STEP 1: Supabase Setup (15 minutes)

### 1.1 Create Supabase Project (5 min)

1. **Visit:** https://supabase.com
2. **Click:** "Start your project" (green button)
3. **Sign up:** Choose GitHub (recommended) or email
4. **After login:** Click "New project"
5. **Fill in:**
   - **Organization:** Create "TZ Wellness" (or select existing)
   - **Name:** `tzwellness`
   - **Database Password:** Create strong password
     - Example: `TZW3lln3ss2024!Secure`
     - ⚠️ **SAVE THIS PASSWORD** in Notepad!
   - **Region:** Choose closest to your users
     - US East (N. Virginia)
     - Europe (Frankfurt)
     - Asia Pacific (Singapore)
   - **Plan:** Free
6. **Click:** "Create new project"
7. **Wait:** 2-3 minutes for initialization ☕

### 1.2 Run Database Schema (5 min)

1. **In Supabase Dashboard:**
   - Left sidebar → **SQL Editor**
   - Click **"New query"** button

2. **Open your local file:** `supabase-schema.sql`
   - Location: `C:\Users\HP\Downloads\TZWELLNESS_SUPABASE\supabase-schema.sql`
   - Open with Notepad
   - **Select All** (Ctrl+A) → **Copy** (Ctrl+C)

3. **In Supabase SQL Editor:**
   - **Paste** (Ctrl+V)
   - Click **"Run"** button (or Ctrl+Enter)
   - Wait 5-10 seconds
   - ✅ **Success:** "Success. No rows returned" or row counts

### 1.3 Verify Tables (2 min)

1. **Left sidebar:** Click **"Table Editor"**
2. **Verify 15 tables exist:**
   - `service_categories` (3 rows)
   - `services` (1 row)
   - `weekly_availability` (5 rows)
   - `blog_categories` (3 rows)
   - `blog_posts` (1 row)
   - `event_categories` (2 rows)
   - `events` (1 row)
   - `appointments` (0 rows - empty ✅)
   - `exception_dates`
   - `blog_tags`
   - `blog_post_tags`
   - `event_registrations`
   - `activity_logs`
   - `resource_categories`
   - `resources`

### 1.4 Get API Credentials (2 min)

1. **Left sidebar:** ⚙️ **Settings**
2. **Click:** "API" (under Project Settings)
3. **Copy these 3 values** (click copy icon):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Also get Project Reference ID:**
   - Same page, scroll up
   - **Reference ID:** `xxxxxxxxxxxxx`
   - OR look at browser URL: `https://supabase.com/dashboard/project/xxxxxxxxxxxxx`

📋 **Save in Notepad:**
```
SUPABASE PROJECT URL: https://xxxxxxxxxxxxx.supabase.co
SUPABASE ANON KEY: eyJhbGci...
SUPABASE SERVICE ROLE KEY: eyJhbGci...
PROJECT REFERENCE ID: xxxxxxxxxxxxx
DATABASE PASSWORD: TZW3lln3ss2024!Secure
```

### 1.5 Create Admin User (2 min)

⚠️ **IMPORTANT:** Do NOT use SQL to create users. Use Supabase Dashboard instead.

1. **In Supabase Dashboard:**
   - Left sidebar → **"Authentication"**
   - Click **"Users"** tab

2. **Click:** "Add user" → "Create new user"

3. **Fill in the form:**
   - **Email:** `tzwellnesshealth@gmail.com` (or your email)
   - **Password:** `Admin123!` (or your secure password)
   - ✅ **IMPORTANT:** Check **"Auto Confirm User"** checkbox
   - Leave other fields as default

4. **Click:** "Create user"

5. **Verify:**
   - User appears in the users list
   - Status shows: **Confirmed** (green checkmark)

📋 **Save admin credentials:**
```
ADMIN EMAIL: tzwellnesshealth@gmail.com
ADMIN PASSWORD: Admin123!
```

💡 **Why not SQL?** Supabase Auth uses special encryption and metadata that cannot be replicated with direct SQL inserts. Always use the Dashboard or Auth API for user creation.

---

## ✅ STEP 2: Deploy Frontend to Vercel (10 minutes)

### 2.1 Connect GitHub to Vercel (3 min)

1. **Visit:** https://vercel.com
2. **Click:** "Sign Up" or "Log In"
3. **Choose:** "Continue with GitHub"
4. **Authorize** Vercel to access your GitHub
5. **You'll be redirected** to Vercel Dashboard

### 2.2 Import Your GitHub Repository (2 min)

1. **Click:** "Add New..." → "Project"
2. **Find repository:** Search for `TZWellness` or `iZzIbRaHiM/TZWellness`
3. **Click:** "Import" button next to it
4. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected ✅)
   - **Root Directory:** Click "Edit" → Select `frontend` folder
   - **Build Command:** `npm run build` (pre-filled ✅)
   - **Output Directory:** `.next` (pre-filled ✅)

### 2.3 Add Environment Variables (3 min)

**Before deploying, add these environment variables:**

1. **In Import screen, expand "Environment Variables" section**

2. **Add each variable:**

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
```
(Your Project URL from Step 1.4)

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGci...
```
(Your anon public key from Step 1.4)

**Variable 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGci...
```
(Your service_role key from Step 1.4)

**Variable 4:**
```
Name: RESEND_API_KEY
Value: re_placeholder
```
(We'll update this later in Step 3)

**Variable 5:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://tzwellness.vercel.app
```
(We'll update this after deploy with actual URL)

3. **Click:** "Deploy"
4. **Wait:** 2-3 minutes for build ☕

### 2.4 Get Your Live URL (1 min)

1. **After successful deployment:**
   - ✅ Confetti animation 🎉
   - You'll see: **"Congratulations!"**
   
2. **Copy your URL:**
   - Example: `https://tzwellness-xxxxx.vercel.app`
   - OR: `https://tz-wellness-iZzIbRaHiM.vercel.app`

📋 **Save to Notepad:**
```
VERCEL URL: https://tzwellness-xxxxx.vercel.app
```

### 2.5 Update Site URL Environment Variable (1 min)

1. **In Vercel Dashboard:**
   - Click your "tzwellness" project
   - Click **"Settings"** tab
   - Click **"Environment Variables"** (left sidebar)

2. **Find:** `NEXT_PUBLIC_SITE_URL`
   - Click **"Edit"** (three dots → Edit)
   - **Update value** to your actual Vercel URL
   - Example: `https://tzwellness-xxxxx.vercel.app`
   - Click **"Save"**

3. **Redeploy:**
   - Click **"Deployments"** tab (top)
   - Click three dots on latest deployment → **"Redeploy"**
   - Wait 2 minutes

✅ **Frontend is live!** Visit your URL to verify.

---

## ✅ STEP 3: Setup Email Service (5 minutes)

### 3.1 Create Resend Account (2 min)

1. **Visit:** https://resend.com
2. **Click:** "Sign Up" (free - 3,000 emails/month)
3. **Sign up with:** GitHub or Email
4. **Verify email** if prompted

### 3.2 Get Resend API Key (1 min)

1. **In Resend Dashboard:**
   - Left sidebar → **"API Keys"**
   - Click **"Create API Key"** button

2. **Configure:**
   - **Name:** `TZ Wellness Production`
   - **Permission:** "Sending access"
   - **Domain:** All domains (default)

3. **Click:** "Add"

4. **Copy the key:**
   - Shows once: `re_xxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Save immediately to Notepad!**

📋 **Save to Notepad:**
```
RESEND API KEY: re_xxxxxxxxxxxxxxxxxxxxx
```

### 3.3 Update Resend Key in Vercel (2 min)

1. **Back to Vercel Dashboard:**
   - Your project → **"Settings"** → **"Environment Variables"**

2. **Find:** `RESEND_API_KEY`
   - Click **"Edit"** (three dots → Edit)
   - **Replace** `re_placeholder` with your real key
   - Example: `re_xxxxxxxxxxxxxxxxxxxxx`
   - Click **"Save"**

3. **Redeploy:**
   - **"Deployments"** tab → Latest deployment
   - Three dots → **"Redeploy"**
   - Wait 2 minutes

---

## ✅ STEP 4: Deploy Edge Functions (10 minutes)
**⚠️ This step requires CLI (only necessary step)**

### 4.1 Enable Edge Functions in Supabase (1 min)

**⚠️ IMPORTANT: Do this FIRST before CLI deployment**

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project:** Click on your `tzwellness` project
3. **Left sidebar → Edge Functions**
4. **If you see "Enable Edge Functions" button:**
   - Click **"Enable Edge Functions"**
   - Wait 10-20 seconds for activation
5. **Status should change to Active/Ready**

### 4.2 Setup Supabase CLI (3 min)

**Open PowerShell in your project root folder (NOT frontend):**

```powershell
cd C:\Users\HP\Downloads\TZWELLNESS_SUPABASE
```

**Login to Supabase:**

```powershell
npx supabase login
```

- Browser opens → Click **"Authorize"**
- Return to PowerShell

**Link your project:**

```powershell
npx supabase link --project-ref xxxxxxxxxxxxx
```

Replace `xxxxxxxxxxxxx` with your **Project Reference ID** from Step 1.4

- **Enter database password** when prompted (from Step 1.4)

### 4.3 Add Resend API Key to Supabase (1 min)

```powershell
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

Replace with your actual Resend API key from Step 3.2

### 4.4 Deploy Edge Functions (4 min)

**Deploy all 4 functions (from project root, NOT frontend folder):**

```powershell
npx supabase functions deploy send-pending-notification
```
⏱️ Wait 10-20 seconds... ✅

```powershell
npx supabase functions deploy send-booking-confirmation
```
⏱️ Wait 10-20 seconds... ✅

```powershell
npx supabase functions deploy send-rejection-email
```
⏱️ Wait 10-20 seconds... ✅

```powershell
npx supabase functions deploy send-event-confirmation
```
⏱️ Wait 10-20 seconds... ✅

### 4.5 Verify Edge Functions (2 min)

1. **Back to Supabase Dashboard:**
   - Left sidebar → **"Edge Functions"**

2. **Verify 4 functions are active:**
   - ✅ `send-booking-confirmation`
   - ✅ `send-pending-notification`
   - ✅ `send-rejection-email`
   - ✅ `send-event-confirmation`

3. **Each should show:**
   - Status: **Active**
   - Last deployed: Just now
   - Invocations: 0 (normal for new deployment)

---

## ✅ STEP 5: Add More Content (15 minutes)
**All via Supabase SQL Editor web portal**

### 5.1 Add More Services (3 min)

1. **Supabase Dashboard → SQL Editor → New Query**
2. **Paste and run:**

```sql
-- Add 3 more services
INSERT INTO services (category_id, title, slug, short_description, description, duration_minutes, price, is_published) VALUES
-- Nutrition Consultation
(
  (SELECT id FROM service_categories WHERE name = 'Nutrition Therapy' LIMIT 1),
  'Nutrition Consultation',
  'nutrition-consultation',
  'Personalized nutritional assessment and meal planning.',
  'Comprehensive nutritional assessment and personalized meal planning for optimal health. Our registered dietitians work with you to develop sustainable eating habits.',
  60,
  120.00,
  true
),
-- Group Therapy
(
  (SELECT id FROM service_categories WHERE name = 'Mental Health Services' LIMIT 1),
  'Group Therapy Session',
  'group-therapy-session',
  'Supportive group therapy environment.',
  'Supportive group environment to share experiences and develop coping strategies. Connect with others facing similar challenges in a safe space.',
  90,
  60.00,
  true
),
-- Diabetes Education
(
  (SELECT id FROM service_categories WHERE name = 'Diabetes Care' LIMIT 1),
  'Diabetes Education Workshop',
  'diabetes-education-workshop',
  'Learn comprehensive diabetes management.',
  'Learn about diabetes management, medication, diet, and lifestyle modifications. Empowering education for better health outcomes.',
  120,
  150.00,
  true
);
```

3. **Click "Run"** → ✅ "3 rows inserted"

### 5.2 Add More Blog Posts (4 min)

1. **New Query → Paste and run:**

```sql
-- Add 3 more blog posts
INSERT INTO blog_posts (
  category_id,
  title,
  slug,
  excerpt,
  content,
  featured_image,
  is_published,
  is_featured,
  author_name,
  published_at
) VALUES
-- Mental Health post
(
  (SELECT id FROM blog_categories WHERE name = 'Mental Health' LIMIT 1),
  'Managing Anxiety in Everyday Life',
  'managing-anxiety-everyday-life',
  'Practical strategies to cope with anxiety and reduce stress in your daily routine.',
  '# Managing Anxiety in Everyday Life\n\nAnxiety affects millions of people worldwide. Learn practical, evidence-based strategies to manage anxiety symptoms and improve your quality of life through mindfulness, breathing exercises, and lifestyle changes.',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
  true,
  true,
  'Dr. Sarah Johnson',
  NOW()
),
-- Nutrition post
(
  (SELECT id FROM blog_categories WHERE name = 'Nutrition' LIMIT 1),
  'The Mediterranean Diet: A Complete Guide',
  'mediterranean-diet-complete-guide',
  'Discover the health benefits of the Mediterranean diet and how to implement it.',
  '# The Mediterranean Diet\n\nThe Mediterranean diet is consistently ranked as one of the healthiest eating patterns. Learn about its heart-healthy benefits, key components, and practical tips for incorporating Mediterranean-style eating into your daily life.',
  'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800',
  true,
  false,
  'Maria Rodriguez, RD',
  NOW()
),
-- Wellness post
(
  (SELECT id FROM blog_categories WHERE name = 'Wellness' LIMIT 1),
  '10 Habits of Highly Healthy People',
  '10-habits-highly-healthy-people',
  'Learn the daily habits that contribute to long-term health and wellbeing.',
  '# 10 Habits of Highly Healthy People\n\n1. They prioritize sleep\n2. Stay hydrated throughout the day\n3. Practice regular physical activity\n4. Eat mindfully and nutritiously\n5. Manage stress effectively\n6. Build strong social connections\n7. Practice gratitude daily\n8. Set boundaries\n9. Schedule regular health checkups\n10. Make time for hobbies and joy',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  true,
  false,
  'Dr. Michael Chen',
  NOW()
);
```

2. **Click "Run"** → ✅ "3 rows inserted"

### 5.3 Add More Events (3 min)

1. **New Query → Paste and run:**

```sql
-- Add 2 more events
INSERT INTO events (
  category_id,
  title,
  slug,
  description,
  start_date,
  end_date,
  max_participants,
  location_name,
  image,
  is_published,
  is_featured
) VALUES
-- Mental Health Workshop
(
  (SELECT id FROM event_categories WHERE name = 'Workshops' LIMIT 1),
  'Stress Management Workshop',
  'stress-management-workshop',
  'Learn evidence-based techniques to manage stress and improve mental wellbeing. This interactive workshop covers mindfulness practices, breathing exercises, and practical strategies for daily stress reduction.',
  (CURRENT_DATE + INTERVAL '21 days')::timestamp,
  (CURRENT_DATE + INTERVAL '21 days' + INTERVAL '3 hours')::timestamp,
  25,
  'TZ Wellness Center, Room B',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
  true,
  true
),
-- Community Event
(
  (SELECT id FROM event_categories WHERE name = 'Community Events' LIMIT 1),
  'Healthy Living Expo',
  'healthy-living-expo',
  'Join us for a day of health screenings, fitness demos, and nutrition consultations. Free event open to the community with local health vendors, cooking demonstrations, and wellness activities for all ages.',
  (CURRENT_DATE + INTERVAL '35 days' + INTERVAL '9 hours')::timestamp,
  (CURRENT_DATE + INTERVAL '35 days' + INTERVAL '15 hours')::timestamp,
  100,
  'City Convention Center',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
  true,
  false
);
```

2. **Click "Run"** → ✅ "2 rows inserted"

### 5.4 Verify Data in Table Editor (5 min)

1. **Left sidebar → Table Editor**

2. **Check each table:**
   - **services:** 4 rows ✅
   - **blog_posts:** 4 rows ✅
   - **events:** 3 rows ✅

3. **Test on your live site:**

**Visit:** `https://your-vercel-url.vercel.app/services`
- ✅ Should show 4 services

**Visit:** `https://your-vercel-url.vercel.app/blog`
- ✅ Should show 4 blog posts

**Visit:** `https://your-vercel-url.vercel.app/events`
- ✅ Should show 3 events

---

## ✅ STEP 6: Test Everything (5 minutes)

### 6.1 Test Homepage (30 sec)

**Visit:** `https://your-vercel-url.vercel.app`

✅ **Check:**
- Homepage loads
- Services section visible
- Blog posts displayed
- Navigation works
- Images load

### 6.2 Test Booking Flow (2 min)

1. **Click "Book Appointment"** or visit `/appointments`

2. **Complete booking:**
   - **Step 1:** Select service (e.g., "Individual Therapy")
   - **Step 2:** Choose patient type (New Patient)
   - **Step 3:** Select modality (Virtual or In-Person)
   - **Step 4:** Pick date and time
   - **Step 5:** Fill details:
     - Name: Test User
     - Email: **your-real-email@gmail.com** (to receive emails)
     - Phone: 555-1234
     - Reason: Test booking
   - **Submit**

3. **Verify:**
   - ✅ Success page with reference ID (e.g., `APT-ABC123XYZ`)
   - ✅ **Check your email** - "Pending Approval" email

### 6.3 Test Admin Dashboard (2 min)

1. **Visit:** `https://your-vercel-url.vercel.app/admin/login`

2. **Login:**
   - Email: `admin@tzwellness.com`
   - Password: `Admin123!` (from Step 1.5)

3. **Verify:**
   - ✅ Admin Dashboard loads
   - ✅ Click "Appointments" tab
   - ✅ See your test booking with "Pending" status
   - ✅ Click "Approve" button
   - ✅ Status changes to "Approved"
   - ✅ **Check your email** - "Appointment Confirmed" email

### 6.4 Test All Pages (30 sec)

Quick click-through:

- ✅ `/services` - Services page loads
- ✅ `/services/individual-therapy` - Detail page
- ✅ `/blog` - Blog page loads
- ✅ `/blog/understanding-blood-sugar-complete-guide` - Blog detail
- ✅ `/events` - Events page loads
- ✅ `/events/diabetes-workshop-new-patients` - Event detail
- ✅ `/appointments/lookup` - Appointment lookup works

---

## 🎉 CONGRATULATIONS! YOU'RE LIVE!

### ✅ What You've Accomplished:

- ✅ **Database:** 15 tables with sample data in Supabase
- ✅ **Backend:** Serverless Edge Functions for emails
- ✅ **Frontend:** Deployed on Vercel
- ✅ **Authentication:** Admin user working
- ✅ **Booking System:** End-to-end flow tested
- ✅ **Email Notifications:** Automated emails working
- ✅ **Content:** Services, blog, events live

---

## 📋 Your Live URLs (Save These!)

```
LIVE SITE: https://your-vercel-url.vercel.app
ADMIN PANEL: https://your-vercel-url.vercel.app/admin
SUPABASE DASHBOARD: https://supabase.com/dashboard/project/xxxxxxxxxxxxx
VERCEL DASHBOARD: https://vercel.com/dashboard
RESEND DASHBOARD: https://resend.com/dashboard
```

---

## 🎯 Production Ready Checklist

- ✅ Database deployed
- ✅ Edge Functions working
- ✅ Frontend deployed
- ✅ Email notifications tested
- ✅ Admin access working
- ✅ Booking flow tested
- ✅ Sample content added
- ⬜ Custom domain (optional - see below)
- ⬜ Analytics setup (optional)
- ✅ SSL certificate (automatic with Vercel)

---

## 🚀 Next Steps (Optional)

### Add Custom Domain (5 min via web)

**In Vercel Dashboard:**
1. Your project → **"Settings"** → **"Domains"**
2. Enter your domain: `tzwellness.com`
3. Click **"Add"**
4. Follow DNS instructions provided
5. Wait 24-48 hours for propagation

### Setup Analytics (3 min via web)

**Vercel Analytics (built-in):**
1. Your project → **"Analytics"** tab
2. Click **"Enable"**
3. Free for 100k events/month

**OR Google Analytics:**
1. Visit: https://analytics.google.com
2. Create property
3. Get Tracking ID
4. Add to Vercel Environment Variables:
   - `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

### Monitor Usage (web dashboards)

**Supabase:**
- Dashboard → **"Project Settings"** → **"Usage"**
- Check database size, bandwidth, API calls

**Vercel:**
- Dashboard → **"Analytics"**
- Monitor visitors, page views, performance

**Resend:**
- Dashboard → **"Logs"**
- Track emails sent, bounces, opens

---

## 💡 Management Tips (All via Web)

### Database Management

**Supabase Dashboard:**
- **Table Editor:** Add/edit data visually
- **SQL Editor:** Run queries
- **Database → Backups:** Setup automated backups

### Content Management

**Add Services:**
1. SQL Editor → New Query
2. Use INSERT statement (see Step 5.1 examples)

**Add Blog Posts:**
1. SQL Editor → New Query
2. Use INSERT statement (see Step 5.2 examples)

**Add Events:**
1. SQL Editor → New Query
2. Use INSERT statement (see Step 5.3 examples)

### Email Management

**Resend Dashboard:**
- **Emails:** View all sent emails
- **Logs:** Check delivery status
- **API Keys:** Rotate keys if needed

### Deployment Management

**Vercel Dashboard:**
- **Deployments:** View all deployments
- **Settings → Environment Variables:** Update config
- **Settings → Git:** Auto-deploy on GitHub push

### Edge Function Logs

**Supabase Dashboard:**
- **Edge Functions:** Click function name
- **Logs:** View execution logs
- **Invocations:** Monitor usage

---

## 🔒 Security Checklist (Web Portal Management)

### Supabase Security

**Dashboard → Settings → API:**
- ✅ Never share `service_role` key publicly
- ✅ Only use `anon` key in frontend code
- ✅ Rotate keys every 6 months

**Dashboard → Authentication → Policies:**
- ✅ Review Row Level Security policies
- ✅ Ensure guests can only view public data

### Vercel Security

**Dashboard → Settings → Environment Variables:**
- ✅ Sensitive keys hidden by default
- ✅ Never commit `.env.local` to GitHub
- ✅ Use different keys for development/production

### Resend Security

**Dashboard → API Keys:**
- ✅ Use separate keys for dev/prod
- ✅ Monitor for unusual sending patterns
- ✅ Delete unused API keys

---

## 🐛 Troubleshooting (Web Portal Solutions)

### "Invalid API key" errors

**Vercel Dashboard:**
1. Settings → Environment Variables
2. Verify all keys match Supabase Dashboard
3. Redeploy after any changes

### Emails not sending

**Supabase Dashboard:**
1. Edge Functions → Click function
2. Check logs for errors
3. Verify `RESEND_API_KEY` in Secrets

**Resend Dashboard:**
1. Check sending limits (3,000/month free)
2. Verify domain not blocked

### Database connection issues

**Supabase Dashboard:**
1. Project Settings → General
2. Pause/Resume project
3. Check project status (should be green)

### Frontend build errors

**Vercel Dashboard:**
1. Deployments → Click failed deployment
2. Click "View Build Logs"
3. Look for error messages
4. Fix in GitHub → Auto-redeploys

---

## 📞 Support Resources

### Official Documentation
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Next.js:** https://nextjs.org/docs
- **Resend:** https://resend.com/docs

### Community Help
- **Supabase Discord:** https://discord.supabase.com
- **Vercel Discord:** https://vercel.com/discord
- **GitHub Issues:** https://github.com/iZzIbRaHiM/TZWellness/issues

### Your GitHub Repository
- **URL:** https://github.com/iZzIbRaHiM/TZWellness
- Create issues for bugs
- View code and documentation

---

## 🎊 Your Platform is LIVE!

**Everything managed via web portals:**
- ✅ No CLI needed for daily operations
- ✅ Update content via Supabase SQL Editor
- ✅ Monitor usage via dashboards
- ✅ Deploy updates via GitHub push → Vercel auto-deploy
- ✅ Manage emails via Resend Dashboard

**Ready to serve patients!** 🚀

---

## 📝 Quick Reference

### Essential Credentials (from your Notepad)

```
=== SUPABASE ===
URL: https://xxxxxxxxxxxxx.supabase.co
Anon Key: eyJhbGci...
Service Role Key: eyJhbGci...
Project Ref: xxxxxxxxxxxxx
Database Password: TZW3lln3ss2024!Secure

=== ADMIN ===
Email: admin@tzwellness.com
Password: Admin123!

=== RESEND ===
API Key: re_xxxxxxxxxxxxxxxxxxxxx

=== VERCEL ===
Site URL: https://tzwellness-xxxxx.vercel.app
Dashboard: https://vercel.com/dashboard
```

### Dashboard URLs

```
Supabase: https://supabase.com/dashboard/project/xxxxxxxxxxxxx
Vercel: https://vercel.com/dashboard
Resend: https://resend.com/dashboard
GitHub: https://github.com/iZzIbRaHiM/TZWellness
```

### Common Tasks

**Add Service:**
```
Supabase → SQL Editor → New Query → INSERT INTO services...
```

**Update Environment Variable:**
```
Vercel → Settings → Environment Variables → Edit → Save → Redeploy
```

**Check Email Logs:**
```
Resend → Logs OR Supabase → Edge Functions → Logs
```

**View Appointments:**
```
Supabase → Table Editor → appointments
```

---

**All done via web browsers - no CLI required except for initial Edge Function deployment!** 🌐
