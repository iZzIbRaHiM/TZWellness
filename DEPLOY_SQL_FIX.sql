-- ============================================
-- TZ WELLNESS - QUICK FIX DEPLOYMENT SCRIPT
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- DROP EXISTING FUNCTIONS (Clean Slate)
-- ============================================
DROP FUNCTION IF EXISTS get_available_dates(INTEGER);
DROP FUNCTION IF EXISTS get_available_dates;
DROP FUNCTION IF EXISTS get_available_slots(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_available_slots(DATE, DATE, TEXT);
DROP FUNCTION IF EXISTS get_available_slots;
DROP FUNCTION IF EXISTS check_slot_available(DATE, TIME, TEXT);
DROP FUNCTION IF EXISTS check_slot_available;
DROP FUNCTION IF EXISTS get_day_name(INTEGER);
DROP FUNCTION IF EXISTS get_day_name;
DROP FUNCTION IF EXISTS debug_day_mapping();
DROP FUNCTION IF EXISTS debug_day_mapping;

-- ============================================
-- FUNCTION 1: GET AVAILABLE DATES
-- Returns list of dates with available appointment slots
-- ============================================
CREATE OR REPLACE FUNCTION get_available_dates(days_ahead INTEGER DEFAULT 60)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Return array of date strings
  SELECT jsonb_agg(available_date::TEXT ORDER BY available_date)
  INTO result
  FROM (
    WITH date_range AS (
      SELECT generate_series(
        CURRENT_DATE,  -- Include today
        CURRENT_DATE + (days_ahead || ' days')::INTERVAL,
        '1 day'::INTERVAL
      )::DATE AS check_date
    )
    SELECT DISTINCT dr.check_date AS available_date
    FROM date_range dr
    -- Join with weekly availability using correct day mapping
    INNER JOIN weekly_availability wa 
      ON ((EXTRACT(DOW FROM dr.check_date)::INTEGER + 6) % 7) = wa.day_of_week
      AND wa.is_active = true
    -- Exclude exception dates that are blocked
    LEFT JOIN exception_dates ed 
      ON ed.date = dr.check_date 
      AND ed.exception_type = 'blocked'
    WHERE ed.id IS NULL  -- No blocking exceptions
    ORDER BY dr.check_date
  ) available_dates;

  -- Return empty array if no dates found
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_available_dates(INTEGER) IS 
'Returns JSONB array of available appointment dates as strings (YYYY-MM-DD format). 
Includes today and excludes blocked exception dates. Uses ISO week day mapping.';

-- ============================================
-- FUNCTION 2: GET AVAILABLE SLOTS
-- Returns available time slots for date range grouped by date
-- ============================================
CREATE OR REPLACE FUNCTION get_available_slots(
  start_date TEXT,
  end_date TEXT,
  modality_filter TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  date_to_check DATE;
  time_slot RECORD;
  iso_day INTEGER;
  slots_array JSONB;
BEGIN
  -- Loop through each date in range
  FOR date_to_check IN 
    SELECT generate_series(
      start_date::DATE, 
      end_date::DATE, 
      '1 day'::INTERVAL
    )::DATE
  LOOP
    -- Convert PostgreSQL DOW to ISO day (0=Monday to 6=Sunday)
    iso_day := ((EXTRACT(DOW FROM date_to_check)::INTEGER + 6) % 7);
    
    -- Initialize slots array for this date
    slots_array := '[]'::JSONB;
    
    -- Get all available time slots for this date
    FOR time_slot IN
      SELECT DISTINCT 
        wa.start_time,
        wa.end_time,
        wa.allows_virtual,
        wa.allows_in_person
      FROM weekly_availability wa
      -- Check this day is configured and active
      WHERE wa.day_of_week = iso_day
        AND wa.is_active = true
        -- Check modality filter
        AND (
          modality_filter IS NULL 
          OR (modality_filter = 'virtual' AND wa.allows_virtual = true)
          OR (modality_filter = 'in_person' AND wa.allows_in_person = true)
        )
        -- Exclude if date has blocking exception
        AND NOT EXISTS (
          SELECT 1 
          FROM exception_dates ed
          WHERE ed.date = date_to_check
            AND ed.exception_type = 'blocked'
        )
        -- Exclude if slot is already booked
        AND NOT EXISTS (
          SELECT 1 
          FROM appointments a
          WHERE a.scheduled_date = date_to_check
            AND a.scheduled_time = wa.start_time
            AND a.status IN ('pending', 'approved', 'completed')
        )
      ORDER BY wa.start_time
    LOOP
      -- Build slot object
      slots_array := slots_array || jsonb_build_object(
        'start_time', time_slot.start_time::TEXT,
        'end_time', COALESCE(
          time_slot.end_time::TEXT, 
          (time_slot.start_time + INTERVAL '30 minutes')::TIME::TEXT
        ),
        'available', true,
        'allows_virtual', time_slot.allows_virtual,
        'allows_in_person', time_slot.allows_in_person
      );
    END LOOP;
    
    -- Only add date to result if it has slots
    IF jsonb_array_length(slots_array) > 0 THEN
      result := jsonb_set(
        result,
        ARRAY[date_to_check::TEXT],
        slots_array,
        true
      );
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_available_slots(TEXT, TEXT, TEXT) IS 
'Returns JSONB object with available time slots grouped by date.
Parameters:
  - start_date: Start date in YYYY-MM-DD format
  - end_date: End date in YYYY-MM-DD format  
  - modality_filter: Optional filter ("virtual" or "in_person")
Returns: {"2026-01-10": [{start_time, end_time, available}], ...}';

-- ============================================
-- FUNCTION 3: CHECK SLOT AVAILABILITY
-- Quick check if a specific slot is available
-- ============================================
CREATE OR REPLACE FUNCTION check_slot_available(
  check_date DATE,
  check_time TIME,
  check_modality TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  iso_day INTEGER;
  is_available BOOLEAN;
BEGIN
  -- Convert to ISO day
  iso_day := ((EXTRACT(DOW FROM check_date)::INTEGER + 6) % 7);
  
  -- Check if slot is available
  SELECT EXISTS (
    SELECT 1
    FROM weekly_availability wa
    WHERE wa.day_of_week = iso_day
      AND wa.start_time = check_time
      AND wa.is_active = true
      -- Check modality
      AND (
        check_modality IS NULL
        OR (check_modality = 'virtual' AND wa.allows_virtual = true)
        OR (check_modality = 'in_person' AND wa.allows_in_person = true)
      )
      -- Not blocked
      AND NOT EXISTS (
        SELECT 1 FROM exception_dates ed
        WHERE ed.date = check_date AND ed.exception_type = 'blocked'
      )
      -- Not booked
      AND NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.scheduled_date = check_date
          AND a.scheduled_time = check_time
          AND a.status IN ('pending', 'approved', 'completed')
      )
  ) INTO is_available;
  
  RETURN COALESCE(is_available, false);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_slot_available(DATE, TIME, TEXT) IS
'Quick boolean check if a specific date/time slot is available for booking.';

-- ============================================
-- HELPER FUNCTION: Get Day Name
-- ============================================
CREATE OR REPLACE FUNCTION get_day_name(iso_day INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE iso_day
    WHEN 0 THEN 'Monday'
    WHEN 1 THEN 'Tuesday'
    WHEN 2 THEN 'Wednesday'
    WHEN 3 THEN 'Thursday'
    WHEN 4 THEN 'Friday'
    WHEN 5 THEN 'Saturday'
    WHEN 6 THEN 'Sunday'
    ELSE 'Unknown'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- DEBUGGING FUNCTION: Show Day Mapping
-- ============================================
CREATE OR REPLACE FUNCTION debug_day_mapping()
RETURNS TABLE(
  calendar_date DATE,
  pg_dow INTEGER,
  iso_day INTEGER,
  day_name TEXT,
  has_availability BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date::DATE AS calendar_date,
    EXTRACT(DOW FROM d.date)::INTEGER AS pg_dow,
    ((EXTRACT(DOW FROM d.date)::INTEGER + 6) % 7) AS iso_day,
    get_day_name(((EXTRACT(DOW FROM d.date)::INTEGER + 6) % 7)) AS day_name,
    EXISTS(
      SELECT 1 FROM weekly_availability wa 
      WHERE wa.day_of_week = ((EXTRACT(DOW FROM d.date)::INTEGER + 6) % 7)
        AND wa.is_active = true
    ) AS has_availability
  FROM generate_series(
    CURRENT_DATE::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '14 days')::TIMESTAMP,
    '1 day'::INTERVAL
  ) AS d(date)
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION debug_day_mapping() IS
'Shows next 14 days with day-of-week mapping for debugging availability issues.';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test 1: Check day mapping for next 2 weeks
SELECT * FROM debug_day_mapping();

-- Test 2: Get available dates for next 30 days
SELECT get_available_dates(30);

-- Test 3: Get available slots for today
SELECT get_available_slots(
  CURRENT_DATE::TEXT,
  CURRENT_DATE::TEXT,
  NULL
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ ALL FUNCTIONS UPDATED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '1. Check the query results above to verify functions work';
  RAISE NOTICE '2. If no dates/slots appear, add weekly_availability data';
  RAISE NOTICE '3. Update frontend/.env.local with Supabase credentials';
  RAISE NOTICE '4. Restart your Next.js dev server';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Your booking system is now fixed!';
END $$;
