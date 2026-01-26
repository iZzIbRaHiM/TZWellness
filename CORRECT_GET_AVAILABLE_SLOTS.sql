-- ============================================
-- CORRECT: Allow Multiple Pending Appointments
-- ============================================
-- Based on actual schema from all_querries.sql lines 431-477
-- CHANGE: Only block slots for 'approved' or 'confirmed' appointments
-- PRESERVES: All existing logic - NO time_slots table
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
  time_slot TIME;
  slot_info JSONB;
  day_of_week INTEGER;
BEGIN
  FOR current_date IN 
    SELECT generate_series(start_date::TIMESTAMP, end_date::TIMESTAMP, '1 day'::INTERVAL)::DATE
  LOOP
    day_of_week := EXTRACT(DOW FROM current_date)::INTEGER;
    
    -- Get available slots for this date
    FOR time_slot IN
      SELECT DISTINCT wa.start_time
      FROM weekly_availability wa
      LEFT JOIN exception_dates ed ON ed.date = current_date
      WHERE wa.day_of_week = day_of_week
        AND wa.is_active = true
        AND (ed.id IS NULL OR ed.exception_type != 'blocked')
        AND (modality_filter IS NULL OR 
             (modality_filter = 'virtual' AND wa.allows_virtual) OR
             (modality_filter = 'in_person' AND wa.allows_in_person))
        -- ⭐ KEY CHANGE: Only check 'approved' or 'confirmed' appointments
        -- This allows multiple 'pending' appointments for the same slot
        AND NOT EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.scheduled_date = current_date
            AND a.scheduled_time = wa.start_time
            AND a.status IN ('approved', 'confirmed')  -- ⭐ CHANGED from: ('pending', 'approved')
        )
      ORDER BY wa.start_time
    LOOP
      slot_info := jsonb_build_object(
        'start_time', time_slot::TEXT,
        'end_time', (time_slot + INTERVAL '30 minutes')::TIME::TEXT,
        'available', true
      );
      
      result := jsonb_set(
        result,
        ARRAY[current_date::TEXT],
        COALESCE(result->current_date::TEXT, '[]'::JSONB) || slot_info
      );
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
-- 5. Slot Monday 10:00 AM now BLOCKED (counted by function)
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
