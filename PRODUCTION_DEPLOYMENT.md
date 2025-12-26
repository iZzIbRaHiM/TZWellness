# 🚀 TF Welfare Platform - Production Deployment Guide

## 🎯 The Golden Path Test Protocol

This document ensures ZERO bugs and ZERO mock data in production.

## 📋 Pre-Deployment Checklist

### Backend Verification

- [ ] All environment variables configured in `.env`
- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] PostgreSQL database configured
- [ ] Redis configured for Celery
- [ ] Email SMTP configured and tested
- [ ] Static files collected: `python manage.py collectstatic`
- [ ] Migrations applied: `python manage.py migrate`
- [ ] Superuser created: `python manage.py createsuperuser`

### Frontend Verification

- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] Build successful: `npm run build`
- [ ] No console errors in production build
- [ ] Theme colors match design (Emerald, Terracotta, Sand)

### Infrastructure

- [ ] PostgreSQL 14+ running
- [ ] Redis running
- [ ] Celery worker running
- [ ] Celery beat running (for scheduled tasks)
- [ ] Reverse proxy configured (Nginx/Caddy)
- [ ] SSL certificates installed
- [ ] Firewall configured

---

## 🧪 The Golden Path Test (MANDATORY)

Execute this test EXACTLY as written before marking deployment complete.

### Step 0: Flush All Dummy Data

```bash
cd backend
python manage.py flush_data --confirm
```

**Expected Output:**
```
✓ Deleted X appointments
✓ Deleted X availability schedules
✓ Deleted X blog posts
✓ Deleted X events
✓ Deleted X activity logs
✓ Deleted X non-admin users
✅ Database flush complete!
```

### Step 1: Access Public Booking Page

1. Open browser: `https://your-domain.com/book`
2. Verify the form loads without errors
3. Check that NO mock data is visible (no fake names, dates, etc.)

### Step 2: Create Test Booking

**Test Patient Details:**
- Name: `John Smith`
- Email: `john.smith.test@example.com`
- Phone: `555-0100`
- Service: `Diabetes Consultation`
- Modality: `Virtual`
- Date: Tomorrow's date
- Time: Any available slot

**Submit the booking.**

**Expected Behavior:**
- ✅ Success message appears
- ✅ Reference ID generated (e.g., `APT-ABC123XYZ`)
- ✅ "Pending Approval" status shown
- ✅ Email sent to `john.smith.test@example.com` with booking confirmation

### Step 3: Verify Backend Processing

```bash
# Check Celery logs
# Should see: "Confirmation email sent for appointment APT-ABC123XYZ"

# Check database
python manage.py dbshell
SELECT reference_id, patient_details->>'name', status FROM appointments_appointment;
\q
```

**Expected Result:**
```
 reference_id | name       | status
--------------+------------+--------
 APT-ABC123XYZ| John Smith | pending
```

### Step 4: Access Admin Panel

1. Navigate to: `https://your-domain.com/admin`
2. Login with superuser credentials

**Expected Behavior:**
- ✅ Dashboard loads instantly (no loader stuck)
- ✅ "Pending Appointments" card shows: **1**
- ✅ "Total Patients" card shows: **1**
- ✅ "Completion Rate" shows: **0%** (no completed appointments yet)

### Step 5: Verify Pending Appointments Widget

**Check the Center Panel:**

**Expected Display:**
```
┌─────────────────────────────────────────────┐
│ John Smith                   [Virtual] 🎥   │
│ Diabetes Consultation                       │
│ Dec 26, 2025 at 2:00 PM                     │
│                        [Approve] [Reject]   │
└─────────────────────────────────────────────┘
```

**Verify:**
- ✅ Patient name is correct: `John Smith`
- ✅ Service name is correct: `Diabetes Consultation`
- ✅ Modality badge shows: `Virtual`
- ✅ Date and time match what was booked
- ✅ Both buttons are clickable (not greyed out)

### Step 6: Approve the Appointment

1. Click **[Approve]** button
2. Wait for confirmation toast

**Expected Behavior:**
- ✅ Toast message: "Appointment Approved"
- ✅ "The patient will receive a confirmation email"
- ✅ John Smith row **disappears** from the list
- ✅ "Pending Appointments" count decreases to: **0**
- ✅ "Total Patients" count remains: **1**

**Check Celery logs again:**
```
Should see: "Approval email sent for appointment APT-ABC123XYZ"
```

### Step 7: Verify Email Sent

**Check `john.smith.test@example.com` inbox:**

**Expected Email:**
```
Subject: Appointment Confirmed - TF Wellfare Medical Clinic

Dear John Smith,

Great news! Your appointment has been confirmed.

Appointment Details:
- Reference ID: APT-ABC123XYZ
- Date: December 26, 2025
- Time: 2:00 PM
- Duration: 30 minutes
- Type: Virtual

[Attachment: appointment.ics]
```

**Verify:**
- ✅ Email received (check spam folder too)
- ✅ ICS calendar file attached
- ✅ All details are correct
- ✅ Meeting link included (if virtual)

### Step 8: Verify Recent Activity Feed

**Check Right Panel (Recent Activity):**

**Expected Entry:**
```
✓ Appointment Approved
  Appointment confirmed for John Smith
  Just now
```

**Verify:**
- ✅ Activity log updated in real-time
- ✅ Description matches action taken
- ✅ Timestamp is recent

### Step 9: Verify Database State

```bash
python manage.py dbshell

-- Check appointment status changed
SELECT reference_id, status, confirmation_sent FROM appointments_appointment;

-- Check activity log created
SELECT action_type, description FROM core_activitylog ORDER BY created_at DESC LIMIT 1;

\q
```

**Expected Results:**
```
Appointment status: approved
Confirmation sent: true
Activity log: "Appointment confirmed for John Smith"
```

### Step 10: Test Rejection Flow

1. Create another test booking (different email)
2. Go to Admin Panel
3. Click **[Reject]** on the new pending appointment
4. Enter reason: `Fully booked on this day`
5. Submit

**Expected Behavior:**
- ✅ Prompt appears asking for reason
- ✅ Toast: "Appointment Rejected"
- ✅ Row disappears
- ✅ Rejection email sent to patient
- ✅ Activity log updated

### Step 11: Verify Stats Accuracy

**Dashboard should now show:**
- Pending Appointments: **0**
- Total Patients: **2** (John + Test Patient 2)
- Completion Rate: **0%** (none completed yet)

**If numbers don't match, DEPLOYMENT FAILS.**

---

## 🚨 Failure Conditions (DO NOT DEPLOY IF ANY OCCUR)

### Critical Failures

1. **Button Does Nothing**
   - Clicking Approve/Reject has no effect
   - **FIX:** Check API endpoint connectivity, CORS settings

2. **Stats Don't Update**
   - Numbers remain static after actions
   - **FIX:** Check dashboard API, React Query cache

3. **No Email Sent**
   - Celery task not firing
   - **FIX:** Verify Redis connection, Celery worker running

4. **Activity Log Empty**
   - Actions not logged
   - **FIX:** Check ActivityLog.log() calls in views

5. **Mock Data Visible**
   - Seeing `const DATA = [...]` values
   - **FIX:** Run `flush_data` command, check API calls

### Warning Conditions (Fix Before Production)

- Slow API response (>2 seconds)
- Console errors in browser
- Email delivery delayed (>1 minute)
- UI layout doesn't match reference image

---

## 🎨 Theme Verification

### Color Palette Check

Open Chrome DevTools > Elements > Computed Styles

**Primary (Sidebar):**
```css
background-color: rgb(6, 78, 59);  /* emerald-950 */
```

**Action Buttons:**
```css
background-color: rgb(224, 122, 95);  /* terracotta-400 */
```

**Background:**
```css
background-color: rgb(249, 249, 247);  /* sand-100 */
```

**If colors don't match, check `tailwind.config.ts`**

---

## 📊 Performance Benchmarks

### API Response Times (Production)

- Dashboard Summary: < 500ms
- Pending Appointments: < 300ms
- Approve Action: < 800ms
- Activity Feed: < 200ms

**Test with:**
```bash
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com/api/v1/dashboard/summary/"
```

---

## 🔒 Security Checklist

- [ ] `DEBUG=False`
- [ ] Strong `SECRET_KEY` (64+ characters)
- [ ] Database password is strong (16+ characters)
- [ ] HTTPS enabled (SSL certificate valid)
- [ ] CORS limited to your domain only
- [ ] Admin panel requires authentication
- [ ] Rate limiting enabled (10 bookings/hour/email)
- [ ] SQL injection protection (Django ORM used)
- [ ] XSS protection (React escaping enabled)

---

## 🎯 Success Criteria

✅ **Deployment is APPROVED if:**

1. Golden Path Test passes 100%
2. All emails deliver within 60 seconds
3. Stats update in real-time
4. No console errors
5. Theme colors match reference image
6. Zero mock data visible
7. Activity log tracks all actions
8. Database persistence verified

---

## 📞 Support

If Golden Path Test fails:

1. Check Celery logs: `celery -A config worker -l debug`
2. Check Django logs: `backend/logs/django.log`
3. Check browser console: F12 > Console tab
4. Verify Redis: `redis-cli ping` (should return PONG)

---

## 🎉 Post-Deployment

After successful Golden Path Test:

1. **Delete test bookings:**
   ```bash
   python manage.py dbshell
   DELETE FROM appointments_appointment WHERE patient_details->>'email' LIKE '%test@example.com';
   ```

2. **Monitor for 24 hours:**
   - Check Sentry for errors (if configured)
   - Monitor Celery task queue
   - Review email delivery logs

3. **Backup database:**
   ```bash
   pg_dump -U postgres tf_wellfare > backup_$(date +%Y%m%d).sql
   ```

---

## 🚢 You're Ready for Production!

If this document is checked ✅ end-to-end, your platform is **bug-free and production-ready**.

**Remember:** The Golden Path Test is your single source of truth. If it passes, ship it. If it fails, fix before deploying.
