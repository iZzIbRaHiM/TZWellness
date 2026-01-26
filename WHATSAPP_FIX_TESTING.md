# WhatsApp Number Fix - Testing Guide

## What Was Fixed

### Problem:
1. WhatsApp numbers were cached and didn't update when admin changed settings
2. Phone number formatting was inconsistent across devices
3. Different devices showed random/wrong numbers

### Solution:
1. **Real-time Updates**: Added Supabase real-time subscription to `useSiteSettings` hook
2. **Better Phone Formatting**: Improved `formatPhoneForWhatsApp()` to handle various formats:
   - `+923325858314` → `923325858314` ✅
   - `03325858314` → `923325858314` ✅
   - `(332) 585-8314` → `923325858314` ✅
3. **Cache Invalidation**: Settings refetch every 5 seconds if database updated
4. **Manual Refetch**: Added `refetch()` method for force refresh

## Testing Checklist

### Test 1: Update Phone Number in Admin Panel
1. ✅ Login to admin panel at `/admin`
2. ✅ Go to Settings → Clinic Info tab
3. ✅ Change `clinic_phone` to: `+923325858314`
4. ✅ Click "Save Changes"
5. ✅ Verify success toast appears

### Test 2: Check Real-time Update (Same Device)
1. ✅ Open homepage in another browser tab (keep admin panel open)
2. ✅ Scroll to footer - note current phone number
3. ✅ In admin panel, change phone to: `03001234567`
4. ✅ Save changes
5. ✅ Wait 5 seconds
6. ✅ Homepage footer should auto-update to new number (no page reload needed)

### Test 3: Check WhatsApp Links on Different Devices
1. ✅ **Your Laptop** (where you set up):
   - Open homepage
   - Click "Book a Free Consultation" → WhatsApp button
   - Should open: `https://wa.me/923325858314`
   
2. ✅ **Different Device** (phone/tablet):
   - Open your website
   - Click any WhatsApp button (footer, services page, booking wizard)
   - Should open: `https://wa.me/923325858314` (same number)
   
3. ✅ **Incognito Mode**:
   - Open site in incognito
   - Click WhatsApp buttons
   - Should use correct number

### Test 4: Check All WhatsApp Button Locations
Test these pages and verify correct number:
- ✅ Homepage: "Book a Free Consultation" button
- ✅ Footer: WhatsApp icon
- ✅ Services page: "Contact via WhatsApp" buttons
- ✅ Service detail page: "Inquire via WhatsApp" button
- ✅ Resources page: "WhatsApp Billing" button
- ✅ Resources page: "WhatsApp Support" button
- ✅ Booking wizard: Help section WhatsApp link
- ✅ Appointment lookup: "Contact Support" WhatsApp button

### Test 5: Phone Format Variations
Test that admin can save phone in different formats and it still works:

1. ✅ Save as: `+923325858314` → WhatsApp opens: `923325858314`
2. ✅ Save as: `03325858314` → WhatsApp opens: `923325858314`
3. ✅ Save as: `(332) 585-8314` → WhatsApp opens: `923325858314`
4. ✅ Save as: `923325858314` → WhatsApp opens: `923325858314`

All formats should convert to same WhatsApp number.

## Debug Information

### Check Current Phone Format in Database
Run this SQL in Supabase:
```sql
SELECT clinic_phone, updated_at 
FROM admin_settings 
ORDER BY updated_at DESC 
LIMIT 1;
```

### Check Console Logs
Open browser DevTools → Console, look for:
```
[useSiteSettings] Loaded settings: {
  phone: "+923325858314",
  formatted: "923325858314",
  href: "tel:+923325858314"
}
```

### Check Real-time Subscription
After admin saves, console should show:
```
[useSiteSettings] Settings updated in database, refetching...
```

## Expected Behavior

✅ **Before Fix**: 
- Phone number cached on first load
- Admin updates don't reflect on frontend until hard refresh
- Different devices show different numbers

✅ **After Fix**:
- Phone number updates in real-time (5 seconds)
- All devices see same correct number
- Various phone formats all work correctly

## If Still Not Working

1. **Clear Browser Cache**:
   - Press Ctrl+Shift+Delete
   - Clear "Cached images and files"
   - Hard reload (Ctrl+Shift+R)

2. **Check Supabase Realtime**:
   - Ensure Realtime is enabled in Supabase dashboard
   - Settings → API → Realtime → Enabled

3. **Verify Database**:
   - Run `CHECK_PHONE_FORMAT.sql` in Supabase
   - Ensure `clinic_phone` column has correct value

4. **Check Console Errors**:
   - Open DevTools → Console
   - Look for any red errors related to Supabase or settings

## Files Changed

1. `frontend/src/hooks/use-site-settings.ts` - Added real-time updates
2. `frontend/src/lib/whatsapp.ts` - Improved phone formatting
3. `GET_AVAILABLE_SLOTS_CORRECT.sql` - Fixed booking slots function
4. `FINAL_SLOTS_FIX.sql` - Alternative slots function

## Next Deployment

After testing locally, deploy to Vercel/production:
```bash
git push origin main
vercel --prod  # or automatic deployment
```

Changes will be live immediately!
