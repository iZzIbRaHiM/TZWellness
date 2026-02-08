-- Test the MIN/MAX aggregation behavior for weekly_availability
-- This checks if the SELECT query is returning unexpected results

-- Test for Monday (day_of_week = 0 in ISO format)
SELECT 
  wa.day_of_week,
  MIN(wa.start_time) as day_start,
  MAX(wa.end_time) as day_end,
  bool_or(wa.allows_virtual) as allows_virtual,
  bool_or(wa.allows_in_person) as allows_in_person,
  COUNT(*) as row_count
FROM weekly_availability wa
WHERE wa.day_of_week = 0 AND wa.is_active = true
GROUP BY wa.day_of_week;

-- Expected result: 
-- day_of_week | day_start | day_end | allows_virtual | allows_in_person | row_count
-- 0           | 09:00:00  | 17:00:00| t              | t                | 1

-- If row_count > 1, there are hidden duplicates
-- If this returns no rows, day_of_week might be wrong

-- Also test without the WHERE clause to see all days:
SELECT 
  wa.day_of_week,
  MIN(wa.start_time) as day_start,
  MAX(wa.end_time) as day_end,
  COUNT(*) as row_count
FROM weekly_availability wa
WHERE wa.is_active = true
GROUP BY wa.day_of_week
ORDER BY wa.day_of_week;

-- Expected: 5 rows (0-4 for Mon-Fri), each with row_count=1
