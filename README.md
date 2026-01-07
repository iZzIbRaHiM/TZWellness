# 🏥 TZ Wellness Platform

A comprehensive mental health and wellness platform powered by **Supabase** and **Next.js**.

> **🔄 MIGRATION COMPLETE**: Django backend has been fully removed and replaced with Supabase. See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for deployment instructions.

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### For Patients (Public)
- 📅 **Guest Booking System** - No login required for appointments
- 🕐 **Smart Availability** - Automatic slot calculation with exceptions
- 📧 **Email Notifications** - Automated confirmation and reminder emails
- 📱 **Multi-Modality** - Virtual, In-Person, or Phone appointments
- 🔍 **Appointment Lookup** - Track by reference ID (APT-XXXXXX)

### For Admins
- 📊 **Analytics Dashboard** - Track bookings and engagement
- ✅ **Appointment Management** - Approve/reject with one click
- 📝 **Content Management** - Blog posts, events, resources
- 🎉 **Event Registration** - Workshops and webinars
- 📚 **Resource Library** - Guides, videos, and downloadables
- 🕐 **Availability Control** - Configure recurring schedules and exceptions

### Technical Excellence
- 🔒 **Row Level Security** - Database-level access control
- ⚡ **Edge Functions** - Serverless email notifications (Deno runtime)
- 🔐 **Type Safety** - Full TypeScript coverage
- 🚫 **Guest Booking** - No authentication required for patients
- 📈 **Real-time Updates** - Optional WebSocket subscriptions
- 🎯 **Server Components** - Optimal performance with Next.js 14

---

## 🚀 Tech Stack

### Backend (Supabase)
- **PostgreSQL Database** - 15 tables with full-text search
- **Authentication** - Email/password with Row Level Security
- **Edge Functions** - Serverless functions for emails (Deno runtime)
- **Row Level Security** - Granular access control
- **Real-time subscriptions** - WebSocket support (optional)

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management
- **@supabase/ssr** - Server-side Supabase client
- **Lucide Icons** - Modern icon library

---

## 🎯 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account ([sign up free](https://supabase.com))
- Resend API key ([get one free](https://resend.com))

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/tzwellness.git
cd tzwellness
```

### 2. Supabase Setup

1. Create new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy contents of `supabase-schema.sql` and run it
4. Get your API keys from **Settings** → **API**

### 3. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set Resend API key
supabase secrets set RESEND_API_KEY=your_key

# Deploy functions
supabase functions deploy send-pending-notification
supabase functions deploy send-booking-confirmation
supabase functions deploy send-rejection-email
supabase functions deploy send-event-confirmation
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start development server:

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📦 Project Structure

```
TZWELLNESS_SUPABASE/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/
│   │   │   ├── supabase/    # Supabase clients
│   │   │   │   ├── client.ts      # Browser client
│   │   │   │   ├── server.ts      # Server client
│   │   │   │   └── middleware.ts  # Auth middleware
│   │   │   └── api.ts        # API client (Supabase queries)
│   │   └── hooks/            # Custom React hooks
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── functions/            # Edge Functions (Deno)
│       ├── send-pending-notification/
│       ├── send-booking-confirmation/
│       ├── send-rejection-email/
│       └── send-event-confirmation/
│
├── supabase-schema.sql       # Complete database schema
├── SUPABASE_DEPLOYMENT.md    # Detailed deployment guide
└── README.md                 # This file
```

---

## 🗄️ Database Schema

### Core Tables

- **services** - Therapy services and offerings
- **service_categories** - Service organization
- **appointments** - Guest booking system (no auth required)
- **weekly_availability** - Recurring schedule slots
- **exception_dates** - Holidays and custom schedules
- **blog_posts** - Content management
- **blog_categories** - Blog organization
- **events** - Workshops and webinars
- **event_registrations** - Event attendance tracking
- **resources** - Downloadable content library

### Key Functions

- `get_available_dates(days_ahead)` - Returns available booking dates
- `get_available_slots(start_date, end_date, modality)` - Returns open time slots
- `get_dashboard_summary()` - Admin dashboard stats
- `increment_blog_views(post_id)` - Track content engagement

---

## 🔐 Security Features

- **Row Level Security (RLS)** - Enforced on all tables
- **Guest Booking** - Public can create appointments without auth
- **Admin Only** - Full CRUD requires authentication
- **API Key Management** - Service role key never exposed to client
- **CORS Protection** - Configured in Supabase dashboard
- **SQL Injection Prevention** - Parameterized queries via Supabase SDK

---

## 📧 Email Notifications

Automated emails powered by Supabase Edge Functions + Resend:

1. **Pending Notification** - Sent immediately after booking
2. **Confirmation Email** - Sent when admin approves appointment
3. **Rejection Email** - Sent if appointment can't be fulfilled
4. **Event Confirmation** - Sent when registering for events

All emails are fully branded with:
- Professional HTML templates
- Inline CSS for email client compatibility
- Calendar integration links (Google, Outlook)
- Actionable buttons (join meeting, cancel, reschedule)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy!

**See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for complete guide.**

### Alternative Platforms

- **Netlify** - Similar setup to Vercel
- **Railway** - Full-stack deployment
- **Render** - Free tier available

---

## 🧪 Testing

```bash
cd frontend

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📊 Admin Dashboard

Access admin panel at `/admin` after creating admin user:

```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@tzwellness.com',
  crypt('YourPassword123!', gen_salt('bf')),
  NOW()
);
```

Dashboard features:
- 📈 Real-time booking statistics
- ✅ Approve/reject appointments
- 📝 Manage blog posts and events
- 👥 View patient history
- 🕐 Configure availability
- 📧 Resend notification emails

---

## 🛠️ Development

### API Client Usage

The `lib/api.ts` file provides a clean interface:

```typescript
import { servicesApi, appointmentsApi } from '@/lib/api'

// Fetch services
const services = await servicesApi.getAll()

// Book appointment (guest - no auth needed)
const appointment = await appointmentsApi.book({
  patient_name: 'John Doe',
  patient_email: 'john@example.com',
  patient_phone: '+1234567890',
  service_id: 'uuid',
  modality: 'virtual',
  scheduled_date: '2024-01-20',
  scheduled_time: '10:00',
  reason: 'Initial consultation'
})

// Lookup appointment by reference
const appt = await appointmentsApi.lookup('APT-ABC123')
```

### Adding New Tables

1. Add table definition to `supabase-schema.sql`
2. Create RLS policies
3. Add queries to `lib/api.ts`
4. Update TypeScript types

---

## 🐛 Troubleshooting

### Common Issues

**"Invalid API key"**
- Check `.env.local` has correct Supabase URL and keys
- Restart dev server after changing env vars

**"Row Level Security" blocking query**
- Verify RLS policies in Supabase Dashboard
- Check if user is authenticated for admin operations

**Emails not sending**
- Verify `RESEND_API_KEY` is set in Edge Functions secrets
- Check Edge Function logs in Supabase Dashboard

**"Module not found" errors**
- Run `npm install` in frontend directory
- Delete `node_modules` and reinstall if persists

See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md#troubleshooting) for more.

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- 📧 **Email**: support@tzwellness.com
- 💬 **Issues**: [GitHub Issues](https://github.com/yourusername/tzwellness/issues)
- 📖 **Docs**: [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Vercel** - Frontend hosting
- **Resend** - Email delivery
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework

---

**Built with ❤️ for mental health and wellness**
