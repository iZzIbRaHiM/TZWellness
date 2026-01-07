# 🚀 TZ Wellness - Quick Deployment Guide

**Complete migration from Django to Supabase** ✅

---

## ⚡ 5-Minute Quick Start

### 1️⃣ Supabase Setup (2 minutes)

1. Create account at [supabase.com](https://supabase.com)
2. New Project → Name: `tzwellness`
3. **SQL Editor** → New Query → Paste `supabase-schema.sql` → Run
4. **Settings** → **API** → Copy these:
   - Project URL
   - anon public key
   - service_role key

### 2️⃣ Edge Functions (2 minutes)

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase functions deploy send-pending-notification
supabase functions deploy send-booking-confirmation
supabase functions deploy send-rejection-email
supabase functions deploy send-event-confirmation
```

### 3️⃣ Frontend Deploy (1 minute)

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Visit: `http://localhost:3000` 🎉

---

## 🌐 Production Deploy

### Vercel (Recommended)

1. Push to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repo
3. **Root Directory**: `frontend`
4. **Environment Variables**: Add all from `.env.local`
5. **Deploy**

Your app is live! 🚀

---

## 🔑 Essential URLs

### Development
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

### Supabase Dashboard
- **SQL Editor**: Database → SQL Editor
- **Table Editor**: Database → Tables
- **Edge Functions**: Edge Functions → Logs
- **Authentication**: Authentication → Users
- **API Keys**: Settings → API

### Production
- **Frontend**: https://your-app.vercel.app
- **Admin**: https://your-app.vercel.app/admin

---

## 📋 Post-Deploy Checklist

- [ ] ✅ Database schema executed successfully
- [ ] ✅ 15 tables visible in Table Editor
- [ ] ✅ 4 Edge Functions deployed and active
- [ ] ✅ Frontend deployed to Vercel
- [ ] ✅ Environment variables configured
- [ ] ✅ Admin user created (see below)
- [ ] ✅ Test guest booking flow
- [ ] ✅ Test admin approval flow
- [ ] ✅ Verify emails received

---

## 👤 Create Admin User

Run in **Supabase SQL Editor**:

```sql
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

Login at: `/admin` with your credentials

---

## 🧪 Test Your Deployment

### 1. Test Guest Booking
1. Visit `/appointments`
2. Select service
3. Choose date/time
4. Fill guest details
5. Submit booking
6. ✅ Check email for pending notification

### 2. Test Admin Approval
1. Login to `/admin`
2. View pending appointments
3. Click "Approve"
4. ✅ Check email for confirmation

### 3. Test Event Registration
1. Visit `/events`
2. Select an event
3. Register
4. ✅ Check email for confirmation

---

## 🐛 Quick Troubleshooting

### "Invalid API key"
```bash
# Check environment variables
vercel env ls

# Re-add if needed
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### Emails not sending
```bash
# Check Edge Function logs
supabase functions logs send-pending-notification

# Verify secret
supabase secrets list
```

### RLS blocking queries
```sql
-- Check policies in SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'appointments';

-- Temporarily disable RLS for testing
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
```

### Frontend build errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Key Features

✅ **Guest Booking** - No login required  
✅ **Email Notifications** - Automated via Edge Functions  
✅ **Admin Dashboard** - Full appointment management  
✅ **Blog System** - Categories, tags, featured posts  
✅ **Events** - Workshop registration with capacity  
✅ **Resources** - Downloadable content library  
✅ **Smart Availability** - Auto-calculated time slots  
✅ **Row Level Security** - Database-enforced access control  

---

## 📚 Documentation

- **Full Deployment Guide**: [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)
- **Migration Details**: [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)
- **Project README**: [README.md](./README.md)

---

## 🎯 Architecture Overview

```
┌─────────────────┐
│   Next.js 14    │──────┐
│   (Frontend)    │      │
└─────────────────┘      │
                         ▼
                  ┌──────────────┐
                  │   Supabase   │
                  ├──────────────┤
                  │ PostgreSQL   │◄── 15 Tables
                  │ Auth         │◄── Row Level Security
                  │ Edge Funcs   │◄── Email notifications
                  │ Real-time    │◄── Optional WebSockets
                  └──────────────┘
```

**Zero backend maintenance required!** 🎉

---

## 💰 Costs

### Free Tier (Perfect for testing)
- ✅ Supabase: 500MB database, 2GB bandwidth
- ✅ Vercel: 100GB bandwidth
- ✅ Resend: 3,000 emails/month
- **Total: $0/month**

### Paid Tier (When you scale)
- Supabase Pro: $25/month
- Vercel Pro: $20/month (optional)
- Resend Pro: $20/month (50,000 emails)
- **Total: $45-65/month**

---

## 🔒 Security Features

✅ **Row Level Security** - Database-enforced access  
✅ **Guest Checkout** - No auth for patients  
✅ **Admin Auth** - Supabase Authentication  
✅ **API Key Safety** - Service role key server-only  
✅ **CORS Protection** - Configured in Supabase  
✅ **SQL Injection** - Prevented by Supabase SDK  

---

## 📞 Need Help?

1. Check [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) troubleshooting
2. Review Supabase Dashboard logs
3. Test RLS policies in SQL Editor
4. Create GitHub issue

---

## 🎊 You're All Set!

Your TZ Wellness platform is now:

✅ Fully migrated from Django to Supabase  
✅ Ready for production deployment  
✅ Auto-scaling and zero maintenance  
✅ Cost-effective with generous free tier  
✅ Secure with database-level access control  

**Deploy with confidence!** 🚀

---

**Next Steps**: 
1. Deploy to production
2. Add your content (services, blog posts, events)
3. Configure email templates
4. Test thoroughly
5. Go live! 🎉
