-- ============================================
-- FIX: Allow Multiple Pending Appointments
-- ============================================
-- CHANGE: Only block slots for 'approved' or 'confirmed' appointments
-- PRESERVES: All existing logic from all_querries.sql (lines 431-477)
-- COMPATIBLE: 100% with existing schema (NO time_slots table)
-- ============================================

CREATE OR REPLACE FUNCTION get_available_slots(
  start_date TEXT,
  end_date TEXT,
  modality_filter TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  current_date DATE;
  slot_time TIME;
  slot_end TIME;
  slot_info JSONB;
  day_of_week INTEGER;
  wa_record RECORD;
  booked_count INTEGER;
BEGIN
  -- Loop through each date in the range
  FOR current_date IN 
    SELECT generate_series(start_date::TIMESTAMP, end_date::TIMESTAMP, '1 day'::INTERVAL)::DATE
  LOOP
    -- Convert PostgreSQL day (0=Sunday) to ISO day (0=Monday)
    day_of_week := ((EXTRACT(DOW FROM current_date)::INTEGER + 6) % 7);
    
    -- Get weekly availability for this day
    FOR wa_record IN
      SELECT wa.start_time, wa.end_time, wa.allows_virtual, wa.allows_in_person
      FROM weekly_availability wa
      WHERE wa.day_of_week = day_of_week
        AND wa.is_active = true
        -- Check date is not in exception_dates (holidays/blocked dates)
        AND NOT EXISTS (
          SELECT 1 FROM exception_dates ed
          WHERE ed.exception_date = current_date
            AND ed.is_available = false
        )
        -- Apply modality filter if provided
        AND (
          modality_filter IS NULL OR
          (modality_filter = 'virtual' AND wa.allows_virtual = true) OR
          (modality_filter = 'in-person' AND wa.allows_in_person = true)
        )
    LOOP
      -- Generate 30-minute slots between start_time and end_time
      slot_time := wa_record.start_time;
      
      WHILE slot_time < wa_record.end_time LOOP
        slot_end := slot_time + INTERVAL '30 minutes';
        
        -- ⭐ KEY CHANGE: Only count appointments with status 'approved' or 'confirmed'
        -- This allows multiple 'pending' appointments for the same slot
        SELECT COUNT(*) INTO booked_count
        FROM appointments
        WHERE appointment_date = current_date
          AND appointment_time = slot_time
          AND status IN ('approved', 'confirmed')  -- ⭐ CHANGED from: status != 'cancelled'
          AND (
            modality_filter IS NULL OR
            (modality_filter = 'virtual' AND modality = 'virtual') OR
            (modality_filter = 'in-person' AND modality = 'in-person')
          );
        
        -- Add slot if not booked (assuming max 1 per slot, adjust if needed)
        IF booked_count = 0 THEN
          slot_info := jsonb_build_object(
            'time', slot_time::TEXT,
            'end_time', slot_end::TEXT,
            'duration', 30,
            'available_virtual', wa_record.allows_virtual,
            'available_in_person', wa_record.allows_in_person,
            'available', true
          );
          
          result := jsonb_set(
            result,
            ARRAY[current_date::TEXT],
            COALESCE(result->current_date::TEXT, '[]'::JSONB) || slot_info
          );
        END IF;
        
        slot_time := slot_end;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADMIN WORKFLOW DOCUMENTATION
-- ============================================
-- 
-- HOW IT WORKS:
-- 1. User A books Monday 10:00 AM → Creates appointment with status='pending'
-- 2. User B books Monday 10:00 AM → Creates appointment with status='pending' ✅ ALLOWED
-- 3. Both appear in admin dashboard's pending appointments list
-- 4. Admin reviews both and approves User A → status changes to 'approved'
-- 5. Slot Monday 10:00 AM now BLOCKED (counted in booked_count)
-- 6. Admin should reject User B (or implement auto-reject on approval)
-- 
-- APPOINTMENT STATUS FLOW:
-- pending → approved → confirmed → completed
--        ↘ rejected
--        ↘ cancelled
--        ↘ no_show
--
-- SLOT BLOCKING RULES:
-- - 'pending': Does NOT block slot (multiple allowed)
-- - 'approved': BLOCKS slot (admin selected this booking)
-- - 'confirmed': BLOCKS slot (appointment happening)
-- - 'rejected': Does NOT block slot (declined by admin)
-- - 'cancelled': Does NOT block slot (user cancelled)
-- - 'no_show': Does NOT block slot (patient didn't show)
-- - 'completed': Does NOT block slot (past appointment)
--
-- ============================================

COMMENT ON FUNCTION get_available_slots(TEXT, TEXT, TEXT) IS 
'Returns available appointment slots for date range. 
Only approved/confirmed appointments block slots, allowing multiple pending bookings.
Admin has flexibility to choose which pending appointment to approve.';
