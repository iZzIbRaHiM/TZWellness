# 🚀 QUICK START - Fix Deployment Guide

## ⚡ Fastest Path to Working System

### Prerequisites
- Supabase account with project created
- Node.js installed (v18 or later)

---

## 📋 3-Step Deployment

### **STEP 1: Configure Supabase Credentials** (2 minutes)

1. Open your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to: **Settings** → **API**
4. Copy these two values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Open: `frontend/.env.local`
6. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # Paste your URL here
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...           # Paste your key here
```

7. Save the file

---

### **STEP 2: Deploy SQL Functions** (3 minutes)

1. Open: `DEPLOY_SQL_FIX.sql` (in this folder)
2. Select all text (Ctrl+A) and copy (Ctrl+C)
3. Go to Supabase Dashboard → **SQL Editor**
4. Click **"New Query"**
5. Paste the SQL (Ctrl+V)
6. Click **"Run"** button (or Ctrl+Enter)
7. Wait for completion (should see "✅ ALL FUNCTIONS UPDATED SUCCESSFULLY!")

**Verify it worked:**
- You should see test results in the output panel
- Look for date arrays and slot objects

---

### **STEP 3: Start Application** (1 minute)

**Option A: Automated (Recommended)**
```powershell
.\deploy.ps1
```

**Option B: Manual**
```powershell
cd frontend
npm install
npm run dev
```

Open browser: http://localhost:3000

---

## ✅ Testing Checklist

After deployment, verify:

1. **Home Page Loads** ✓
   - No errors in browser console
   - No 404 errors for Supabase

2. **Navigate to Booking** ✓
   - Click "Book Appointment" button
   - Select any service

3. **Calendar Shows Available Dates** ✓
   - Green dates should appear
   - Today should be included (if you have availability configured)

4. **Time Slots Load** ✓
   - Click a green date
   - Time slots should appear on the right
   - No "API Unavailable" error

5. **Complete Booking** ✓
   - Select a time slot
   - Fill out patient information
   - Submit booking
   - Should see confirmation page with reference ID

---

## ❌ Troubleshooting

### Problem: No available dates showing

**Cause:** No weekly availability configured in database

**Quick Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Add sample business hours (Monday-Friday 9 AM-5 PM)
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
VALUES 
  -- Monday
  (0, '09:00', '09:30', true, true, true),
  (0, '09:30', '10:00', true, true, true),
  (0, '10:00', '10:30', true, true, true),
  (0, '10:30', '11:00', true, true, true),
  (0, '11:00', '11:30', true, true, true),
  (0, '11:30', '12:00', true, true, true),
  (0, '14:00', '14:30', true, true, true),
  (0, '14:30', '15:00', true, true, true),
  (0, '15:00', '15:30', true, true, true),
  (0, '15:30', '16:00', true, true, true),
  (0, '16:00', '16:30', true, true, true),
  (0, '16:30', '17:00', true, true, true);
  
-- Repeat for Tuesday (1), Wednesday (2), Thursday (3), Friday (4)
-- Adjust times to match your business hours
```

3. Refresh your booking page

---

### Problem: Still seeing 404 errors

**Cause:** Server not restarted after .env change

**Fix:**
1. Stop dev server (Ctrl+C in terminal)
2. Start again: `npm run dev`
3. Hard refresh browser: Ctrl+Shift+R

---

### Problem: "Invalid project URL" or "Invalid API key"

**Cause:** Wrong credentials in .env.local

**Fix:**
1. Double-check Supabase Dashboard → Settings → API
2. Copy values exactly (no extra spaces)
3. Make sure file is saved
4. Restart dev server

---

## 🎯 What Got Fixed

The deployment includes these critical fixes:

1. ✅ **Day-of-week mapping** - Calendar now shows correct days
2. ✅ **Today's date included** - Can book same-day appointments
3. ✅ **SQL function signatures** - TEXT parameters instead of DATE
4. ✅ **Completed appointments** - Won't allow double-booking
5. ✅ **Modality flags** - Proper virtual/in-person filtering

---

## 📞 Need Help?

Check the browser console (F12) for error messages and refer to:
- `BOOKING_SYSTEM_FIX.md` - Detailed technical explanation
- `SUPABASE_FUNCTIONS_FIX.sql` - Complete SQL with comments

---

**Estimated Total Time: 6 minutes**

🎉 You're done! The booking system should now work correctly.
