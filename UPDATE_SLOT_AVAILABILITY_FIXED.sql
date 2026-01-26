-- ============================================
-- FIX: Allow Multiple Pending Appointments
-- ============================================
-- CHANGE: Only block slots for 'approved' or 'confirmed' appointments
-- PRESERVES: All existing logic from all_querries.sql (lines 431-477)
-- COMPATIBLE: 100% with existing schema and function signature
-- ============================================

CREATE OR REPLACE FUNCTION get_available_slots(
  start_date TEXT,          -- ✅ CORRECT: TEXT type (not date)
  end_date TEXT,            -- ✅ CORRECT: TEXT type (not date)
  modality_filter TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  iter_date DATE;
  day_slots JSONB;
  slot_record RECORD;
  booked_count INTEGER;
BEGIN
  -- Convert text dates to date type for iteration
  iter_date := start_date::DATE;
  
  WHILE iter_date <= end_date::DATE LOOP
    day_slots := '[]'::JSONB;
    
    -- Get available time slots for this day
    -- ✅ PRESERVED: ISO day conversion from all_querries.sql
    -- ✅ PRESERVED: weekly_availability table join
    -- ✅ PRESERVED: exception_dates handling
    -- ✅ PRESERVED: modality filtering (allows_virtual/allows_in_person)
    FOR slot_record IN
      SELECT 
        ts.time_slot,
        ts.duration_minutes,
        wa.allows_virtual,
        wa.allows_in_person,
        wa.max_appointments_per_slot
      FROM time_slots ts
      JOIN weekly_availability wa ON wa.id = ts.weekly_availability_id
      WHERE 
        -- Check day of week matches (ISO day conversion)
        wa.day_of_week = ((EXTRACT(DOW FROM iter_date)::INTEGER + 6) % 7)
        AND wa.is_active = true
        
        -- Check date is not in exception_dates (holidays/blocked dates)
        AND NOT EXISTS (
          SELECT 1 FROM exception_dates ed
          WHERE ed.exception_date = iter_date
            AND ed.is_available = false
        )
        
        -- Apply modality filter if provided
        AND (
          modality_filter IS NULL OR
          (modality_filter = 'virtual' AND wa.allows_virtual = true) OR
          (modality_filter = 'in-person' AND wa.allows_in_person = true)
        )
      ORDER BY ts.time_slot
    LOOP
      -- ⭐ KEY CHANGE: Only count appointments with status 'approved' or 'confirmed'
      -- This allows multiple 'pending' appointments for the same slot
      -- Admin can then choose which one to approve
      SELECT COUNT(*) INTO booked_count
      FROM appointments
      WHERE appointment_date = iter_date
        AND appointment_time = slot_record.time_slot
        AND status IN ('approved', 'confirmed')  -- ⭐ CHANGED from: status != 'cancelled'
        AND (
          modality_filter IS NULL OR
          (modality_filter = 'virtual' AND modality = 'virtual') OR
          (modality_filter = 'in-person' AND modality = 'in-person')
        );
      
      -- Add slot if not fully booked
      IF booked_count < slot_record.max_appointments_per_slot THEN
        day_slots := day_slots || jsonb_build_object(
          'time', slot_record.time_slot::TEXT,
          'duration', slot_record.duration_minutes,
          'available_virtual', slot_record.allows_virtual,
          'available_in_person', slot_record.allows_in_person,
          'spots_left', slot_record.max_appointments_per_slot - booked_count
        );
      END IF;
    END LOOP;
    
    -- Add day's slots to result if any available
    IF jsonb_array_length(day_slots) > 0 THEN
      result := result || jsonb_build_object(iter_date::TEXT, day_slots);
    END IF;
    
    iter_date := iter_date + 1;
  END LOOP;
  
  RETURN result;
END;
$$;

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
