# 🎯 Migration Checklist - Django to Supabase

## Phase 1: Preparation (Day 1 - Morning)

- [ ] **Read full migration guide** (`SUPABASE_MIGRATION_GUIDE.md`)
- [ ] **Backup current Django database**
  ```bash
  cd backend
  python manage.py dumpdata > backup_$(date +%Y%m%d).json
  ```
- [ ] **Export environment variables**
  ```bash
  cp backend/.env backend/.env.backup
  ```
- [ ] **Create Supabase account** at [supabase.com](https://supabase.com)
- [ ] **Create new Supabase project**
  - Project name: `tz-wellness`
  - Region: Choose closest to users
  - Database password: Save securely!

## Phase 2: Database Setup (Day 1 - Afternoon)

- [ ] **Copy Supabase credentials**
  - [ ] Project URL: `https://xxxxx.supabase.co`
  - [ ] Anon public key: `eyJxxx...`
  - [ ] Service role key: `eyJxxx...` (KEEP SECRET)
  
- [ ] **Run database schema migration**
  - [ ] Open Supabase Dashboard → SQL Editor
  - [ ] Copy schema from migration guide (Section 2.1)
  - [ ] Execute schema creation
  - [ ] Verify all tables created (should see 15 tables)

- [ ] **Run database functions**
  - [ ] Copy all functions from migration guide (Section 5.1)
  - [ ] Execute function creation
  - [ ] Test functions: `SELECT get_available_dates(30);`

- [ ] **Seed initial data**
  - [ ] Run seed script (Section 2.2)
  - [ ] Verify: `SELECT * FROM service_categories;`
  - [ ] Add weekly availability (Mon-Fri 9-5)

## Phase 3: Frontend Setup (Day 2 - Morning)

- [ ] **Install Supabase dependencies**
  ```bash
  cd frontend
  npm install @supabase/supabase-js @supabase/ssr
  ```

- [ ] **Create Supabase client files**
  - [ ] Create `src/lib/supabase/client.ts`
  - [ ] Create `src/lib/supabase/server.ts`
  - [ ] Copy code from migration guide (Section 3)

- [ ] **Update environment variables**
  - [ ] Create `frontend/.env.local`
  - [ ] Add Supabase credentials
  - [ ] Add Resend API key (sign up at resend.com)
  
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
  SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
  RESEND_API_KEY=re_xxx
  ```

- [ ] **Generate TypeScript types**
  ```bash
  npx supabase gen types typescript --project-id xxxxx > src/lib/supabase/types.ts
  ```

## Phase 4: Replace API Client (Day 2 - Afternoon)

- [ ] **Backup current api.ts**
  ```bash
  cp frontend/src/lib/api.ts frontend/src/lib/api.ts.django-backup
  ```

- [ ] **Replace api.ts with Supabase version**
  - [ ] Copy new API client from migration guide (Section 4.1)
  - [ ] Update imports throughout project
  - [ ] No changes needed to components (API interface stays same!)

- [ ] **Test API calls**
  - [ ] `npm run dev`
  - [ ] Open homepage
  - [ ] Check browser console for errors
  - [ ] Verify services load
  - [ ] Verify blog posts load

## Phase 5: Email Setup (Day 2 - Evening)

- [ ] **Sign up for Resend** at [resend.com](https://resend.com)
  - [ ] Verify domain (or use testing email)
  - [ ] Get API key
  
- [ ] **Install Supabase CLI**
  ```bash
  npm install -g supabase
  ```

- [ ] **Initialize Supabase functions**
  ```bash
  cd frontend
  supabase init
  supabase functions new send-booking-confirmation
  supabase functions new send-appointment-approved
  supabase functions new send-event-confirmation
  ```

- [ ] **Copy function code**
  - [ ] Copy from migration guide (Section 6.3)
  - [ ] Update email templates
  - [ ] Update clinic info

- [ ] **Deploy Edge Functions**
  ```bash
  supabase login
  supabase link --project-ref your-project-ref
  supabase functions deploy send-booking-confirmation
  supabase functions deploy send-appointment-approved
  supabase functions deploy send-event-confirmation
  ```

- [ ] **Set secrets**
  ```bash
  supabase secrets set RESEND_API_KEY=your_key
  ```

## Phase 6: Admin Authentication (Day 3 - Morning)

- [ ] **Enable Email Auth in Supabase**
  - [ ] Dashboard → Authentication → Providers
  - [ ] Enable Email provider
  - [ ] Disable email confirmations (for faster admin login)

- [ ] **Create admin users**
  - [ ] Dashboard → Authentication → Users
  - [ ] Click "Add User"
  - [ ] Email: `admin@tzwellness.com`
  - [ ] Auto-generate password
  - [ ] Save credentials securely

- [ ] **Update admin login page**
  - [ ] Copy code from migration guide (Section 7.3)
  - [ ] Update `frontend/src/app/admin/login/page.tsx`

- [ ] **Update middleware**
  - [ ] Copy code from migration guide (Section 8.1)
  - [ ] Update `frontend/src/middleware.ts`

- [ ] **Test admin login**
  - [ ] Navigate to `/admin/login`
  - [ ] Login with admin credentials
  - [ ] Verify redirect to dashboard

## Phase 7: Testing (Day 3 - Afternoon)

### Public Features
- [ ] **Homepage**
  - [ ] Services section loads
  - [ ] Blog section loads
  - [ ] All links work

- [ ] **Services Page**
  - [ ] All services display
  - [ ] Categories filter works
  - [ ] Service details page works

- [ ] **Booking Flow**
  - [ ] Service selection works
  - [ ] Calendar shows available dates
  - [ ] Time slots load correctly
  - [ ] Can select date + time
  - [ ] Patient form submits
  - [ ] Receives confirmation email
  - [ ] Shows success message with reference ID

- [ ] **Appointment Lookup**
  - [ ] Can find appointment by reference ID
  - [ ] Shows correct details
  - [ ] Can cancel appointment

- [ ] **Blog**
  - [ ] Blog posts load
  - [ ] Can read full post
  - [ ] View count increments
  - [ ] Category filter works

- [ ] **Events**
  - [ ] Events display
  - [ ] Can register for event
  - [ ] Receives confirmation email

### Admin Features
- [ ] **Login**
  - [ ] Can login
  - [ ] Invalid credentials rejected
  - [ ] Protected routes redirect

- [ ] **Dashboard**
  - [ ] Statistics display correctly
  - [ ] Pending count accurate
  - [ ] Today's appointments show
  - [ ] Charts render

- [ ] **Appointments Management**
  - [ ] Can view all appointments
  - [ ] Can approve appointment
    - [ ] Status changes to "approved"
    - [ ] Patient receives approval email
    - [ ] Activity log created
  - [ ] Can reject appointment
    - [ ] Status changes to "rejected"
    - [ ] Patient receives rejection email
  - [ ] Can filter by status
  - [ ] Can search

- [ ] **Activity Logs**
  - [ ] Recent activities display
  - [ ] Timestamps correct

## Phase 8: Data Migration (Day 3 - Evening)

### If you have existing data to migrate:

- [ ] **Export Django data**
  ```bash
  cd backend
  python manage.py dumpdata appointments.Appointment > appointments.json
  python manage.py dumpdata services.Service > services.json
  python manage.py dumpdata blog.BlogPost > blog.json
  python manage.py dumpdata events.Event > events.json
  ```

- [ ] **Convert to Supabase format**
  - [ ] Create migration script (Python or Node.js)
  - [ ] Transform Django JSON to Supabase INSERT statements
  - [ ] Handle foreign key relationships

- [ ] **Import to Supabase**
  - [ ] Run INSERT statements in SQL Editor
  - [ ] Verify data integrity
  - [ ] Check record counts

## Phase 9: Final Verification (Day 4 - Morning)

- [ ] **Complete end-to-end tests**
  - [ ] Book appointment as guest
  - [ ] Login as admin
  - [ ] Approve appointment
  - [ ] Check email received
  - [ ] Cancel appointment
  - [ ] Check cancellation works

- [ ] **Performance check**
  - [ ] Pages load fast (< 2s)
  - [ ] No console errors
  - [ ] API calls respond quickly
  - [ ] Images load properly

- [ ] **Mobile testing**
  - [ ] Responsive design works
  - [ ] Booking flow on mobile
  - [ ] Admin panel on tablet

## Phase 10: Remove Django Backend (Day 4 - Afternoon)

⚠️ **ONLY after ALL tests pass!**

- [ ] **Final backup**
  ```bash
  # Backup entire backend directory
  Compress-Archive -Path backend -DestinationPath backend-backup-$(Get-Date -Format 'yyyyMMdd').zip
  ```

- [ ] **Remove Django**
  ```bash
  # Delete backend directory
  Remove-Item -Recurse -Force backend
  ```

- [ ] **Clean up project**
  - [ ] Delete `docker-compose.yml`
  - [ ] Delete `POSTGRESQL_SETUP.md`
  - [ ] Delete `backend-*.md` files
  - [ ] Update `.gitignore` (remove backend entries)

- [ ] **Update documentation**
  - [ ] Update `README.md`
  - [ ] Remove Django setup instructions
  - [ ] Add Supabase setup instructions
  - [ ] Update architecture diagram

## Phase 11: Deployment (Day 4 - Evening)

### Vercel Deployment

- [ ] **Install Vercel CLI**
  ```bash
  npm i -g vercel
  ```

- [ ] **Deploy**
  ```bash
  cd frontend
  vercel
  ```

- [ ] **Set environment variables in Vercel**
  - [ ] Dashboard → Project → Settings → Environment Variables
  - [ ] Add all variables from `.env.local`
  - [ ] Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive

- [ ] **Test production deployment**
  - [ ] Visit Vercel URL
  - [ ] Test booking flow
  - [ ] Test admin login
  - [ ] Verify emails sending

### Custom Domain (Optional)

- [ ] **Add custom domain in Vercel**
  - [ ] Dashboard → Project → Settings → Domains
  - [ ] Add your domain
  - [ ] Update DNS records

- [ ] **Update Supabase redirect URLs**
  - [ ] Dashboard → Authentication → URL Configuration
  - [ ] Add production URL

## Phase 12: Monitoring & Maintenance

- [ ] **Setup monitoring**
  - [ ] Supabase: Check Database Health
  - [ ] Vercel: Enable Web Analytics
  - [ ] Setup uptime monitoring (e.g., UptimeRobot)

- [ ] **Configure backups**
  - [ ] Supabase Pro: Automatic daily backups
  - [ ] Free: Manual SQL dumps weekly

- [ ] **Document new architecture**
  - [ ] Update team documentation
  - [ ] Create admin user guide
  - [ ] Document common tasks

## 🎉 Migration Complete!

Congratulations! You've successfully migrated from Django to Supabase.

### Post-Migration Checklist

- [ ] Notify team of new architecture
- [ ] Update development setup docs
- [ ] Archive old backend repository
- [ ] Celebrate! 🎊

---

## 📊 Success Metrics

After migration, you should see:

- ✅ **Faster page loads** (no Django middleware overhead)
- ✅ **Lower hosting costs** ($0 vs $24+/month)
- ✅ **Easier deployments** (no backend to manage)
- ✅ **Better developer experience** (TypeScript types from database)
- ✅ **Real-time capabilities** (if you need them in future)

---

## 🆘 Troubleshooting

### Common Issues

**1. "relation does not exist" error**
- Solution: Run schema migration SQL again
- Check table names match exactly

**2. RLS policy violation**
- Solution: Check Row Level Security policies
- Use service role key for admin operations

**3. Edge Functions timing out**
- Solution: Check function logs in Supabase Dashboard
- Verify secrets are set correctly

**4. No emails received**
- Solution: Check Resend dashboard for delivery status
- Verify API key is correct
- Check spam folder

**5. Admin can't login**
- Solution: Verify user exists in Supabase Auth
- Check middleware is configured
- Clear browser cookies

### Getting Help

- 📖 Supabase Docs: https://supabase.com/docs
- 💬 Supabase Discord: https://discord.supabase.com
- 📖 Resend Docs: https://resend.com/docs
- 💬 Next.js Discord: https://nextjs.org/discord

---

## 📞 Need Assistance?

If stuck at any step:

1. **Check the detailed guide**: `SUPABASE_MIGRATION_GUIDE.md`
2. **Review error messages** in browser console and terminal
3. **Check Supabase logs**: Dashboard → Logs
4. **Ask in Discord** communities (Supabase or Next.js)
