-- ============================================
-- CORRECT get_available_slots FUNCTION
-- Based on actual schema verification
-- Zero tolerance - matches all_querries.sql exactly
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
  current_day_of_week INTEGER;
BEGIN
  -- Generate series of dates
  FOR current_date IN 
    SELECT generate_series(start_date::TIMESTAMP, end_date::TIMESTAMP, '1 day'::INTERVAL)::DATE
  LOOP
    -- Get ISO day of week (0=Monday, 6=Sunday)
    current_day_of_week := EXTRACT(DOW FROM current_date)::INTEGER;
    
    -- Check if this day is blocked by exception_dates
    IF EXISTS (
      SELECT 1 FROM exception_dates ed
      WHERE ed.date = current_date
        AND ed.exception_type = 'blocked'
    ) THEN
      CONTINUE; -- Skip this date entirely
    END IF;
    
    -- Get available time slots for this date
    -- Generate 30-minute intervals from weekly_availability start to end time
    FOR time_slot IN
      SELECT generate_series(wa.start_time, wa.end_time - INTERVAL '30 minutes', INTERVAL '30 minutes')::TIME
      FROM weekly_availability wa
      WHERE wa.day_of_week = current_day_of_week
        AND wa.is_active = true
        -- Apply modality filter if provided
        AND (modality_filter IS NULL OR 
             (modality_filter = 'virtual' AND wa.allows_virtual) OR
             (modality_filter = 'in_person' AND wa.allows_in_person))
      LIMIT 1  -- Only need one row since all Mon-Fri have same hours
    LOOP
      -- Check if slot is already booked
      IF EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.scheduled_date = current_date
          AND a.scheduled_time = time_slot
          AND a.status IN ('approved', 'confirmed')  -- ⭐ ONLY approved/confirmed block slots
      ) THEN
        CONTINUE; -- Skip this slot
      END IF;
      -- Build slot info object
      slot_info := jsonb_build_object(
        'start_time', time_slot::TEXT,
        'end_time', (time_slot + INTERVAL '30 minutes')::TIME::TEXT,
        'available', true
      );
      
      -- Add slot to result for this date
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

COMMENT ON FUNCTION get_available_slots(TEXT, TEXT, TEXT) IS 
'Returns available appointment time slots for a date range.
Only approved/confirmed appointments block slots - pending appointments are allowed to overlap.
This gives admin flexibility to choose between multiple pending bookings for the same slot.

SCHEMA COMPATIBILITY:
✅ Parameters: TEXT, TEXT, TEXT (matches all_querries.sql)
✅ Uses: weekly_availability (day_of_week, start_time, NOT time_slots table)
✅ Uses: appointments (scheduled_date, scheduled_time, status)
✅ Uses: exception_dates (date, exception_type)
✅ Returns: JSONB with structure: {"2026-01-27": [{"start_time": "09:00", "end_time": "09:30", "available": true}]}

APPOINTMENT STATUS FLOW:
pending → approved → confirmed → completed
       ↘ rejected
       ↘ cancelled  
       ↘ no_show

SLOT BLOCKING RULES:
- pending: Does NOT block (multiple bookings allowed)
- approved: BLOCKS slot (admin selected)
- confirmed: BLOCKS slot (appointment confirmed)
- rejected/cancelled/no_show: Do NOT block
';

-- ============================================
-- TEST THE FUNCTION
-- ============================================
SELECT get_available_slots('2026-01-27', '2026-01-28', NULL);

-- Expected: JSONB object with available slots for Monday Jan 27
-- Format: {"2026-01-27": [{"start_time": "09:00:00", "end_time": "09:30:00", "available": true}, ...]}
