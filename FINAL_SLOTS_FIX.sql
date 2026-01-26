-- ============================================
-- FINAL FIXED get_available_slots FUNCTION
-- Matches all_querries.sql schema exactly
-- Zero tolerance - no type mismatches
-- ============================================

-- Drop both possible signatures to ensure clean state
DROP FUNCTION IF EXISTS get_available_slots(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_available_slots(DATE, DATE, TEXT);

CREATE OR REPLACE FUNCTION get_available_slots(
  start_date DATE,
  end_date DATE,
  modality_filter TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  date_to_process DATE;
  time_slot TIME;
  slot_info JSONB;
  day_of_week_iso INTEGER;
  day_start_time TIME;
  day_end_time TIME;
BEGIN
  -- Loop through each date in the range
  FOR date_to_process IN 
    SELECT d::DATE 
    FROM generate_series(start_date, end_date, '1 day'::INTERVAL) AS d
  LOOP
    -- Convert PostgreSQL DOW (0=Sunday) to ISO (0=Monday)
    day_of_week_iso := ((EXTRACT(DOW FROM date_to_process)::INTEGER + 6) % 7);
    
    -- Skip if date is blocked
    IF EXISTS (
      SELECT 1 FROM exception_dates 
      WHERE date = date_to_process AND exception_type = 'blocked'
    ) THEN
      CONTINUE;
    END IF;
    
    -- Get availability for this day of week
    SELECT wa.start_time, wa.end_time
    INTO day_start_time, day_end_time
    FROM weekly_availability wa
    WHERE wa.day_of_week = day_of_week_iso
      AND wa.is_active = true
      AND (modality_filter IS NULL OR 
           (modality_filter = 'virtual' AND wa.allows_virtual) OR
           (modality_filter = 'in_person' AND wa.allows_in_person))
    LIMIT 1;
    
    -- Skip if no availability
    IF day_start_time IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Generate 30-minute slots
    time_slot := day_start_time;
    WHILE time_slot < day_end_time LOOP
      -- Check if slot is available
      IF NOT EXISTS (
        SELECT 1 FROM appointments
        WHERE scheduled_date = date_to_process
          AND scheduled_time = time_slot
          AND status IN ('approved', 'confirmed')
      ) THEN
        -- Add available slot
        slot_info := jsonb_build_object(
          'start_time', time_slot::TEXT,
          'end_time', (time_slot + INTERVAL '30 minutes')::TIME::TEXT,
          'available', true
        );
        
        result := jsonb_set(
          result,
          ARRAY[date_to_process::TEXT],
          COALESCE(result->date_to_process::TEXT, '[]'::JSONB) || slot_info
        );
      END IF;
      
      time_slot := time_slot + INTERVAL '30 minutes';
    END LOOP;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_slots(DATE, DATE, TEXT) IS 
'Returns available appointment time slots for a date range.
✅ MATCHES all_querries.sql SCHEMA EXACTLY
✅ Parameters: DATE, DATE, TEXT (line 426-428 in all_querries.sql)
✅ Only approved/confirmed appointments block slots (user requirement)
✅ Pending appointments do NOT block - allows admin to choose between multiple bookings

SCHEMA COMPATIBILITY:
- Parameters: start_date DATE, end_date DATE, modality_filter TEXT
- Uses: weekly_availability (day_of_week 0-6 ISO, start_time, end_time, allows_virtual, allows_in_person)
- Uses: appointments (scheduled_date, scheduled_time, status)
- Uses: exception_dates (date, exception_type)
- Returns: JSONB {"2026-01-27": [{"start_time": "09:00:00", "end_time": "09:30:00", "available": true}, ...]}

BUSINESS LOGIC:
- Generates 30-minute slots dynamically from weekly_availability start_time to end_time
- Converts PostgreSQL DOW (0=Sunday) to ISO format (0=Monday) for day_of_week matching
- Blocks slots only if appointment status is "approved" or "confirmed"
- Allows multiple "pending" appointments for same slot (admin selects winner)
- Skips dates marked as "blocked" in exception_dates table
- Filters by modality: "virtual" or "in_person" if specified
';

-- Test with correct DATE type
SELECT get_available_slots('2026-01-27'::DATE, '2026-01-28'::DATE, NULL);
