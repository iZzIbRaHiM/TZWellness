-- ============================================
-- DIAGNOSTIC QUERIES - RUN THESE IN ORDER
-- ============================================

-- QUERY 1: Check weekly_availability table structure and data
-- Expected: Rows with full-day entries (09:00-17:00), NO 30-minute slots
SELECT 
  id,
  day_of_week,
  CASE day_of_week
    WHEN 0 THEN 'Monday'
    WHEN 1 THEN 'Tuesday'
    WHEN 2 THEN 'Wednesday'
    WHEN 3 THEN 'Thursday'
    WHEN 4 THEN 'Friday'
    WHEN 5 THEN 'Saturday'
    WHEN 6 THEN 'Sunday'
  END as day_name,
  start_time,
  end_time,
  allows_virtual,
  allows_in_person,
  is_active,
  (end_time - start_time) as duration
FROM weekly_availability
ORDER BY day_of_week, start_time;

-- RESULT INTERPRETATION:
-- ✅ CORRECT: 5-7 rows with 8-hour durations (09:00-17:00)
-- ❌ WRONG: Many rows with 30-minute durations (09:00-09:30, 09:30-10:00, etc.)


-- QUERY 2: Check if time_slots table exists (IT SHOULD NOT!)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'time_slots'
) as time_slots_table_exists;

-- RESULT INTERPRETATION:
-- ✅ CORRECT: false (table does not exist)
-- ❌ WRONG: true (table exists - this breaks the function)


-- QUERY 3: Check appointments table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('scheduled_date', 'scheduled_time', 'appointment_date', 'appointment_time', 'status')
ORDER BY ordinal_position;

-- RESULT INTERPRETATION:
-- ✅ CORRECT: scheduled_date (date), scheduled_time (time without time zone)
-- ❌ WRONG: appointment_date/appointment_time (different column names)


-- QUERY 4: Check exception_dates table structure
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'exception_dates'
  AND column_name IN ('date', 'exception_date', 'is_available', 'exception_type')
ORDER BY ordinal_position;

-- RESULT INTERPRETATION:
-- ✅ CORRECT: date (date), exception_type (text)
-- ❌ WRONG: exception_date, is_available (different schema)


-- QUERY 5: Test get_available_slots function signature
SELECT 
  routine_name,
  data_type as return_type,
  type_udt_name
FROM information_schema.routines
WHERE routine_name = 'get_available_slots'
  AND routine_schema = 'public';

-- RESULT INTERPRETATION:
-- Should show: routine_name='get_available_slots', return_type='jsonb'


-- QUERY 6: Check function parameters
SELECT 
  parameter_name,
  data_type,
  parameter_mode
FROM information_schema.parameters
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'get_available_slots'
)
ORDER BY ordinal_position;

-- RESULT INTERPRETATION:
-- ✅ CORRECT: start_date (text), end_date (text), modality_filter (text)
-- ❌ WRONG: Different parameter types or names


-- ============================================
-- SUMMARY QUESTIONS TO ANSWER:
-- ============================================
-- 1. Does weekly_availability have full-day entries or 30-minute slots?
-- 2. Does time_slots table exist? (should be NO)
-- 3. Are appointment columns scheduled_date/scheduled_time or appointment_date/appointment_time?
-- 4. Are exception_dates columns date/exception_type or exception_date/is_available?
-- 5. What are the exact function parameter types?

-- Run all 6 queries and paste the results back to me
