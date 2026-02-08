-- ============================================
-- SETUP BOOKING AVAILABILITY
-- Run this ONCE to configure your booking system
-- ============================================

-- Insert Weekly Availability (Mon-Fri, 9 AM - 5 PM)
-- Uses ISO day format: 0=Monday, 1=Tuesday, ... 6=Sunday
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person) VALUES
(0, '09:00', '17:00', true, true, true), -- Monday
(1, '09:00', '17:00', true, true, true), -- Tuesday
(2, '09:00', '17:00', true, true, true), -- Wednesday
(3, '09:00', '17:00', true, true, true), -- Thursday
(4, '09:00', '17:00', true, true, true)  -- Friday
ON CONFLICT DO NOTHING;

-- Verify Setup
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

-- Expected Result:
-- 0  Monday     09:00  17:00  true  true  true
-- 1  Tuesday    09:00  17:00  true  true  true
-- 2  Wednesday  09:00  17:00  true  true  true
-- 3  Thursday   09:00  17:00  true  true  true
-- 4  Friday     09:00  17:00  true  true  true

-- NOTE: The get_available_slots() function will automatically generate
-- 30-minute slots between start_time and end_time when called.
-- Each day will show 16 slots: 9:00, 9:30, 10:00, ..., 16:00, 16:30
