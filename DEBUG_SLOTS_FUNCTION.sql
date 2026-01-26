-- DEBUG VERSION with logging to identify duplication issue
-- This will show exactly what's happening in the loop

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
  day_start_time TIME;
  day_end_time TIME;
  allows_virtual_flag BOOLEAN;
  allows_in_person_flag BOOLEAN;
  iteration_count INTEGER := 0;
  slot_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Starting get_available_slots ===';
  RAISE NOTICE 'Parameters: start_date=%, end_date=%, modality_filter=%', start_date, end_date, modality_filter;
  
  -- Generate series of dates
  FOR current_date IN 
    SELECT generate_series(start_date::TIMESTAMP, end_date::TIMESTAMP, '1 day'::INTERVAL)::DATE
  LOOP
    iteration_count := iteration_count + 1;
    RAISE NOTICE '--- Iteration %: Processing date % ---', iteration_count, current_date;
    
    -- Get day of week and convert to ISO format
    current_day_of_week := ((EXTRACT(DOW FROM current_date)::INTEGER + 6) % 7);
    RAISE NOTICE 'Day of week: % (ISO format)', current_day_of_week;
    
    -- Check if this day is blocked by exception_dates
    IF EXISTS (
      SELECT 1 FROM exception_dates ed
      WHERE ed.date = current_date
        AND ed.exception_type = 'blocked'
    ) THEN
      RAISE NOTICE 'Date % is blocked by exception_dates, skipping', current_date;
      CONTINUE;
    END IF;
    
    -- Get weekly availability for this day
    SELECT MIN(wa.start_time), MAX(wa.end_time), bool_or(wa.allows_virtual), bool_or(wa.allows_in_person)
    INTO day_start_time, day_end_time, allows_virtual_flag, allows_in_person_flag
    FROM weekly_availability wa
    WHERE wa.day_of_week = current_day_of_week
      AND wa.is_active = true
      AND (modality_filter IS NULL OR 
           (modality_filter = 'virtual' AND wa.allows_virtual) OR
           (modality_filter = 'in_person' AND wa.allows_in_person));
    
    RAISE NOTICE 'Weekly availability: start=%, end=%', day_start_time, day_end_time;
    
    -- Skip if no availability for this day
    IF day_start_time IS NULL THEN
      RAISE NOTICE 'No availability for this day, skipping';
      CONTINUE;
    END IF;
    
    -- Generate 30-minute time slots for this day
    time_slot := day_start_time;
    slot_count := 0;
    WHILE time_slot < day_end_time LOOP
      slot_count := slot_count + 1;
      
      -- Check if slot is already booked
      IF NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.scheduled_date = current_date
          AND a.scheduled_time = time_slot
          AND a.status IN ('approved', 'confirmed')
      ) THEN
        -- Build slot info object
        slot_info := jsonb_build_object(
          'start_time', time_slot::TEXT,
          'end_time', (time_slot + INTERVAL '30 minutes')::TIME::TEXT,
          'available', true
        );
        
        RAISE NOTICE 'Adding slot %: % - %', slot_count, time_slot, (time_slot + INTERVAL '30 minutes')::TIME;
        
        -- Add slot to result for this date
        result := jsonb_set(
          result,
          ARRAY[current_date::TEXT],
          COALESCE(result->current_date::TEXT, '[]'::JSONB) || slot_info
        );
      ELSE
        RAISE NOTICE 'Slot % blocked: %', slot_count, time_slot;
      END IF;
      
      -- Move to next 30-minute slot
      time_slot := time_slot + INTERVAL '30 minutes';
    END LOOP;
    
    RAISE NOTICE 'Generated % slots for date %', slot_count, current_date;
  END LOOP;

  RAISE NOTICE '=== Total iterations: % ===', iteration_count;
  RAISE NOTICE '=== Final result keys: % ===', jsonb_object_keys(result);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test with single date
SELECT get_available_slots('2026-01-27', '2026-01-27', NULL);
