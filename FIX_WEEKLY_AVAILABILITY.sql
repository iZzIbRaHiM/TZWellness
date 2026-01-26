-- ============================================
-- FIX: Remove duplicate 30-minute slot entries
-- Keep only full-day availability entries
-- ============================================

-- Delete the 30-minute slot entries (where end_time is 30 minutes after start_time)
DELETE FROM weekly_availability
WHERE end_time = start_time + INTERVAL '30 minutes';

-- Verify: Should only show 5-6 rows (full days)
SELECT 
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
  is_active
FROM weekly_availability
WHERE is_active = true
ORDER BY day_of_week;

-- Expected Result (only full-day entries):
-- 0  Monday     09:00:00  17:00:00  true  true  true
-- 1  Tuesday    09:00:00  17:00:00  true  true  true
-- 2  Wednesday  09:00:00  17:00:00  true  true  true
-- 3  Thursday   09:00:00  17:00:00  true  true  true
-- 4  Friday     09:00:00  17:00:00  true  true  true
-- 5  Saturday   10:00:00  14:00:00  true  true  true (if exists)
