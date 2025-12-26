# 🧪 Golden Path Test Script - Step-by-Step

## ⚠️ CRITICAL: Run This Before Production Deployment

This test verifies that the ENTIRE system works end-to-end with ZERO bugs.

---

## 🎬 Prerequisites

### Services Running
- [ ] PostgreSQL running on port 5432
- [ ] Redis running on port 6379
- [ ] Backend running on http://localhost:8000
- [ ] Celery worker running (Terminal 2)
- [ ] Frontend running on http://localhost:3000

### Test Email Setup
Use a real email you can access (e.g., Gmail) for testing.

---

## 🚀 Test Execution

### STEP 0: Clean Slate

```powershell
cd backend

# Flush ALL data
python manage.py flush_data --confirm
```

**Expected Output:**
```
✓ Deleted X appointments
✓ Deleted X availability schedules
✓ Deleted X exception dates
✓ Deleted X blog posts
✓ Deleted X events
✓ Deleted X activity logs
✓ Deleted X non-admin users
✅ Database flush complete!
```

**Verify in Database:**
```powershell
python manage.py dbshell
```
```sql
SELECT COUNT(*) FROM appointments_appointment;
-- Should return: 0

SELECT COUNT(*) FROM core_activitylog;
-- Should return: 0

\q
```

---

### STEP 1: Public Booking

1. **Open browser:** http://localhost:3000/book

2. **Fill the form:**
   - Service: `Diabetes Consultation`
   - Modality: `Virtual`
   - Date: `December 26, 2025` (or tomorrow)
   - Time: Any available slot (e.g., `2:00 PM`)
   - Name: `John Smith`
   - Email: `your-test-email@gmail.com`
   - Phone: `555-0100`
   - Reason: `Follow-up appointment`

3. **Click "Book Appointment"**

**Expected Behavior:**
- ✅ Form submits successfully
- ✅ Success page shows
- ✅ Reference ID displayed (e.g., `APT-ABC123XYZ`)
- ✅ Status shows: "Pending Approval"
- ✅ Message: "You will receive a confirmation email once approved"

**Check Celery Terminal (Terminal 2):**
```
[INFO] Confirmation email sent for appointment APT-ABC123XYZ
```

**If email backend is console:**
You'll see the email content in Terminal 2:
```
Dear John Smith,

Thank you for booking with TF Wellfare Medical Clinic.

Your appointment request has been received and is pending approval.
```

---

### STEP 2: Check Database State

```powershell
python manage.py dbshell
```
```sql
-- Should have 1 appointment
SELECT 
    reference_id, 
    patient_details->>'name' as name,
    patient_details->>'email' as email,
    status,
    scheduled_date,
    scheduled_time
FROM appointments_appointment;
```

**Expected Output:**
```
 reference_id  |    name    |         email          | status  | scheduled_date | scheduled_time
---------------+------------+------------------------+---------+----------------+----------------
 APT-ABC123XYZ | John Smith | your-test-email@...    | pending | 2025-12-26     | 14:00:00
```

```sql
-- Should have 1 activity log (appointment created)
SELECT action_type, description FROM core_activitylog;
```

**Expected Output:**
```
    action_type     |           description
--------------------+----------------------------------
 appointment_created | New appointment created: John Smith
```

```sql
\q
```

---

### STEP 3: Access Admin Panel

1. **Navigate to:** http://localhost:3000/admin

2. **Login:**
   - Email: `admin@tfwellfare.com`
   - Password: (your superuser password)

**Expected Behavior:**
- ✅ Login successful
- ✅ Dashboard loads within 2 seconds
- ✅ No loader stuck spinning

---

### STEP 4: Verify Dashboard Stats

**Top Row Cards:**

| Stat | Expected Value |
|------|----------------|
| **Pending Appointments** | 1 |
| **Today's Appointments** | 0 (or 1 if you booked for today) |
| **Total Patients** | 1 |
| **Completion Rate** | 0% |

**If any number is wrong, STOP and debug.**

---

### STEP 5: Verify Pending Appointments Widget

**Center Panel should show:**

```
┌─────────────────────────────────────────────────┐
│ Pending Appointments                     View All│
│ 1 appointments awaiting confirmation            │
├─────────────────────────────────────────────────┤
│ John Smith                      [Virtual] 🎥    │
│ Diabetes Consultation                           │
│ Dec 26, 2025 at 2:00 PM                         │
│                          [Approve]  [Reject]    │
└─────────────────────────────────────────────────┘
```

**Verify:**
- ✅ Name: "John Smith"
- ✅ Service: "Diabetes Consultation"
- ✅ Badge: "Virtual" with video icon
- ✅ Date matches booking
- ✅ Both buttons are enabled (not greyed out)

---

### STEP 6: Approve Appointment

1. **Click [Approve]** button

2. **Wait for confirmation toast**

**Expected Behavior:**
- ✅ Toast appears: "Appointment Approved"
- ✅ Message: "The patient will receive a confirmation email"
- ✅ John Smith row **DISAPPEARS IMMEDIATELY** (optimistic UI)
- ✅ "Pending Appointments" card updates to: **0**
- ✅ "Total Patients" remains: **1**

**Check Celery Terminal:**
```
[INFO] Approval email sent for appointment APT-ABC123XYZ
```

**If email backend is SMTP:**
Check `your-test-email@gmail.com` inbox.

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

Attachments: appointment.ics
```

**Download the .ics file and open it:**
- ✅ Event title: "Medical Appointment - TF Wellfare Medical Clinic"
- ✅ Date/time matches
- ✅ Location shows meeting link or clinic address

---

### STEP 7: Verify Activity Log Updated

**Right Panel (Recent Activity):**

**Should show NEW entry at top:**
```
✓ Appointment Approved
  Appointment confirmed for John Smith
  Just now
```

**Expected Behavior:**
- ✅ Activity appeared WITHOUT page refresh
- ✅ Green checkmark icon
- ✅ Correct description
- ✅ Timestamp is "Just now" or "X seconds ago"

---

### STEP 8: Verify Database Changes

```powershell
python manage.py dbshell
```
```sql
-- Status should be 'approved'
SELECT reference_id, status, confirmation_sent FROM appointments_appointment;
```

**Expected Output:**
```
 reference_id  |  status  | confirmation_sent
---------------+----------+-------------------
 APT-ABC123XYZ | approved | t (true)
```

```sql
-- Should have 2 activity logs now
SELECT action_type, description, created_at 
FROM core_activitylog 
ORDER BY created_at DESC;
```

**Expected Output:**
```
     action_type      |               description                |       created_at
----------------------+------------------------------------------+------------------------
 appointment_approved | Appointment confirmed for John Smith    | 2025-12-25 ...
 appointment_created  | New appointment created: John Smith      | 2025-12-25 ...
```

```sql
\q
```

---

### STEP 9: Test Rejection Flow

1. **Go back to:** http://localhost:3000/book

2. **Create another booking:**
   - Name: `Jane Doe`
   - Email: `jane.doe.test@example.com`
   - (Use different email from Step 1)
   - Same other details

3. **Submit booking**

4. **Return to Admin Panel**

**Verify:**
- ✅ "Pending Appointments" shows: **1**
- ✅ Jane Doe appears in list
- ✅ "Total Patients" shows: **2**

5. **Click [Reject]** on Jane Doe's appointment

6. **Enter reason:** `Fully booked on this day`

7. **Submit**

**Expected Behavior:**
- ✅ Prompt appears for reason
- ✅ Toast: "Appointment Rejected"
- ✅ Message: "The patient will be notified to reschedule"
- ✅ Jane Doe row disappears
- ✅ "Pending Appointments" back to: **0**
- ✅ "Total Patients" remains: **2**

**Check Celery Terminal:**
```
[INFO] Rejection email sent for appointment APT-XYZ789
```

**Expected Email to jane.doe.test@example.com:**
```
Subject: Appointment Reschedule Request - TF Wellfare Medical Clinic

Dear Jane Doe,

We regret to inform you that your appointment request could not be confirmed.

Reason: Fully booked on this day

Please visit our website to book a new appointment at a different time.
```

---

### STEP 10: Final Stats Verification

**Dashboard should now show:**

| Stat | Final Value |
|------|-------------|
| Pending Appointments | 0 |
| Total Patients | 2 (John + Jane) |
| Completion Rate | 0% (none completed yet) |

**Activity Log should show (top to bottom):**
1. Appointment rejected for Jane Doe
2. Appointment confirmed for John Smith  
3. New appointment created: Jane Doe
4. New appointment created: John Smith

---

### STEP 11: Database Final Verification

```powershell
python manage.py dbshell
```
```sql
-- Should have 2 appointments with different statuses
SELECT 
    reference_id,
    patient_details->>'name' as name,
    status
FROM appointments_appointment
ORDER BY created_at;
```

**Expected Output:**
```
 reference_id  |    name    |  status
---------------+------------+----------
 APT-ABC123XYZ | John Smith | approved
 APT-DEF456GHI | Jane Doe   | rejected
```

```sql
-- Should have 4 activity logs
SELECT COUNT(*) FROM core_activitylog;
-- Should return: 4

\q
```

---

## ✅ PASS/FAIL Criteria

### ✅ TEST PASSES IF:

- [x] All steps completed without errors
- [x] Numbers match expected values EXACTLY
- [x] Emails sent successfully
- [x] Activity log populated correctly
- [x] Database reflects all changes
- [x] No console errors in browser F12
- [x] No errors in Celery terminal
- [x] UI updates happened in real-time
- [x] Calendar .ics file generated
- [x] All buttons worked on first click

### ❌ TEST FAILS IF:

- [ ] Any stat card shows wrong number
- [ ] Approve/Reject button does nothing
- [ ] Page needs manual refresh to see changes
- [ ] Email not sent within 60 seconds
- [ ] Activity log doesn't update
- [ ] Console shows errors
- [ ] Database state doesn't match UI
- [ ] Any "loading..." stuck spinning

---

## 🚨 If Test Fails

### Debug Steps:

1. **Check all services running:**
   ```powershell
   # PostgreSQL
   pg_isready
   
   # Redis
   redis-cli ping
   
   # Backend
   curl http://localhost:8000/health/
   
   # Celery
   # Check Terminal 2 for errors
   ```

2. **Check API endpoints:**
   ```powershell
   curl http://localhost:8000/api/v1/dashboard/summary/
   # Should return JSON with stats
   ```

3. **Check browser console:**
   - Press F12
   - Look for red errors
   - Check Network tab for failed requests

4. **Check Celery logs:**
   - Look for exceptions in Terminal 2
   - Verify tasks are being picked up

5. **Check database connection:**
   ```powershell
   python manage.py dbshell
   \conninfo
   \q
   ```

---

## 🎉 Success!

If all steps pass, your system is **PRODUCTION READY**.

**Next Steps:**
1. Clean up test data (if desired)
2. Deploy to production
3. Run Golden Path Test again on production
4. Monitor for 24 hours

---

## 📝 Test Results Log

**Date:** _______________  
**Tester:** _______________  
**Result:** [ ] PASS  [ ] FAIL  

**Notes:**
- Step 1: ______________________
- Step 6 (Approve): ____________
- Step 9 (Reject): _____________
- Final Stats: _________________

**Sign-off:** _______________
