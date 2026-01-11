# EDGE FUNCTIONS DEPLOYMENT GUIDE

## Critical: Must Deploy Edge Functions for Email Notifications to Work

All Edge Functions are now properly configured with CORS headers and error handling. Follow these steps to deploy them to Supabase:

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   # Windows (PowerShell)
   scoop install supabase
   
   # Or download from: https://github.com/supabase/cli/releases
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

## Step 1: Configure Environment Variables

Before deploying, add the RESEND_API_KEY to your Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `TZWellness`
3. Navigate to: **Settings** → **Edge Functions** → **Environment Variables**
4. Click **"Add new secret"**
5. Add:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key from https://resend.com/api-keys

## Step 2: Link Your Project

```bash
# Link to your Supabase project
supabase link --project-ref uumyosdplibjlutchwdd
```

## Step 3: Deploy All Edge Functions

Run these commands from the project root directory:

```bash
# Deploy all functions at once
supabase functions deploy send-appointment-approved
supabase functions deploy send-pending-notification
supabase functions deploy send-booking-confirmation
supabase functions deploy send-rejection-email
supabase functions deploy send-event-confirmation
```

Or deploy them one at a time:

```bash
# 1. Appointment Approved Email (NEW - CRITICAL)
cd supabase/functions/send-appointment-approved
supabase functions deploy send-appointment-approved

# 2. Pending Notification Email
cd ../send-pending-notification
supabase functions deploy send-pending-notification

# 3. Booking Confirmation Email
cd ../send-booking-confirmation
supabase functions deploy send-booking-confirmation

# 4. Rejection Email
cd ../send-rejection-email
supabase functions deploy send-rejection-email

# 5. Event Confirmation Email
cd ../send-event-confirmation
supabase functions deploy send-event-confirmation
```

## Step 4: Verify Deployment

After deployment, verify all functions are active:

1. Go to: **Supabase Dashboard** → **Edge Functions**
2. You should see all 5 functions listed with status "Active"
3. Each function should have:
   - **URL:** `https://uumyosdplibjlutchwdd.supabase.co/functions/v1/[function-name]`
   - **Updated:** Recent timestamp
   - **Deployments:** 5 (or more)

## Step 5: Test Edge Functions

Test each function to ensure it works:

### Test Appointment Approval Email
```bash
curl -X POST \
  'https://uumyosdplibjlutchwdd.supabase.co/functions/v1/send-appointment-approved' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"appointment_id": "test-id"}'
```

### Expected Responses:
- **Success (200):** `{"success":true,"email_id":"..."}`
- **Missing API Key (500):** Means RESEND_API_KEY not configured
- **NOT_FOUND (404):** Means function not deployed
- **401 Unauthorized:** Means authorization header missing (fixed in code)

## What's Fixed

### ✅ All Edge Functions Now Have:

1. **Proper CORS Headers:**
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
   }
   ```

2. **OPTIONS Request Handling:**
   ```typescript
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders })
   }
   ```

3. **Error Responses with CORS:**
   ```typescript
   return new Response(
     JSON.stringify({ error: 'message' }),
     { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
   )
   ```

4. **Proper Authorization:**
   - No longer requires custom authorization headers
   - Uses Supabase service role key internally
   - Frontend can call with anon key

## Function URLs (After Deployment)

All functions will be accessible at:
- `https://uumyosdplibjlutchwdd.supabase.co/functions/v1/send-appointment-approved`
- `https://uumyosdplibjlutchwdd.supabase.co/functions/v1/send-pending-notification`
- `https://uumyosdplibjlutchwdd.supabase.co/functions/v1/send-booking-confirmation`
- `https://uumyosdplibjlutchwdd.supabase.co/functions/v1/send-rejection-email`
- `https://uumyosdplibjlutchwdd.supabase.co/functions/v1/send-event-confirmation`

## Troubleshooting

### Issue: "Function not found (404)"
**Solution:** Deploy the function using the commands above

### Issue: "Missing authorization header (401)"
**Solution:** Already fixed in the code. Redeploy the functions.

### Issue: "CORS policy blocked"
**Solution:** Already fixed with proper CORS headers. Redeploy the functions.

### Issue: "Failed to send email"
**Solution:** 
1. Check if RESEND_API_KEY is added to Supabase environment variables
2. Verify your Resend account is active and has email sending enabled
3. Check Resend dashboard for failed email logs

### Issue: Email not received
**Solution:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Resend dashboard for delivery status
4. Verify `from` email domain is verified in Resend

## Next Steps After Deployment

1. ✅ All Edge Functions deployed
2. ✅ RESEND_API_KEY configured
3. ✅ Test appointment booking → approval flow
4. ✅ Verify emails are received
5. ✅ Check admin dashboard appointments display correctly
6. ✅ Test rejection email flow

## Production Checklist

- [ ] All 5 Edge Functions deployed
- [ ] RESEND_API_KEY added to Supabase
- [ ] All functions return 200 status (not 404)
- [ ] CORS errors resolved (no preflight failures)
- [ ] Test email sent and received
- [ ] Appointment approval sends email
- [ ] Appointment rejection sends email with reason
- [ ] New appointment booking sends pending notification

---

**After deployment, all console errors related to Edge Functions will be resolved!**
