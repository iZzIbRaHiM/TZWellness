-- ============================================
-- UPDATE get_available_slots FUNCTION
-- ============================================
-- Purpose: Allow multiple pending appointments for same slot
--          Only block slots that are CONFIRMED/APPROVED
--          This lets admin choose between competing bookings
-- ============================================

CREATE OR REPLACE FUNCTION get_available_slots(
  start_date date,
  end_date date,
  modality_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result jsonb := '{}';
  current_date date;
  day_slots jsonb;
  slot_start time;
  slot_end time;
  booked_slots jsonb;
BEGIN
  -- Loop through each date in range
  current_date := start_date;
  WHILE current_date <= end_date LOOP
    day_slots := '[]'::jsonb;
    
    -- Generate time slots (9 AM to 5 PM, 30-minute intervals)
    slot_start := '09:00:00';
    WHILE slot_start < '17:00:00' LOOP
      slot_end := slot_start + interval '30 minutes';
      
      -- Check if slot is available
      -- IMPORTANT: Only check for CONFIRMED/APPROVED appointments
      -- Allow PENDING appointments to book same slot (admin will choose)
      IF NOT EXISTS (
        SELECT 1 
        FROM appointments
        WHERE scheduled_date = current_date
          AND scheduled_time = slot_start::text
          AND status IN ('approved', 'confirmed')  -- ONLY block confirmed slots
          AND (modality_filter IS NULL OR modality = modality_filter)
      ) THEN
        -- Add available slot
        day_slots := day_slots || jsonb_build_object(
          'start_time', slot_start::text,
          'end_time', slot_end::text
        );
      END IF;
      
      slot_start := slot_end;
    END LOOP;
    
    -- Add day's slots to result
    result := result || jsonb_build_object(current_date::text, day_slots);
    
    current_date := current_date + 1;
  END LOOP;
  
  RETURN result;
END;
$$;

-- ============================================
-- IMPORTANT NOTES FOR ADMIN:
-- ============================================
-- 1. Multiple users CAN book the same time slot
-- 2. All bookings start as "pending" status
-- 3. Admin sees all pending appointments in dashboard
-- 4. Admin approves ONE booking → slot becomes unavailable
-- 5. Other pending bookings for same slot should be rejected
-- 6. This gives admin flexibility to choose best patient/case

-- Example workflow:
-- - User A books Monday 10:00 AM (status: pending)
-- - User B books Monday 10:00 AM (status: pending) ← ALLOWED
-- - Admin sees both in pending list
-- - Admin approves User A → slot blocked
-- - Admin should reject User B (or auto-reject on approval)
