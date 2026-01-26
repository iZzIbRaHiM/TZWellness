-- ============================================
-- SETUP BOOKING AVAILABILITY
-- Run this ONCE to configure your booking system
-- ============================================

-- Step 1: Insert Weekly Availability (Mon-Fri, 9 AM - 5 PM)
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person, max_appointments_per_slot) VALUES
(0, '09:00', '17:00', true, true, true, 3), -- Monday
(1, '09:00', '17:00', true, true, true, 3), -- Tuesday
(2, '09:00', '17:00', true, true, true, 3), -- Wednesday
(3, '09:00', '17:00', true, true, true, 3), -- Thursday
(4, '09:00', '17:00', true, true, true, 3)  -- Friday
ON CONFLICT DO NOTHING;

-- Step 2: Generate Time Slots (30-minute intervals from 9 AM to 5 PM)
-- This creates slots for each day of the week
DO $$
DECLARE
  wa_record RECORD;
  slot_time TIME;
BEGIN
  FOR wa_record IN SELECT id, start_time, end_time FROM weekly_availability WHERE is_active = true
  LOOP
    slot_time := wa_record.start_time;
    
    -- Generate 30-minute slots
    WHILE slot_time < wa_record.end_time LOOP
      INSERT INTO time_slots (weekly_availability_id, time_slot, duration_minutes)
      VALUES (wa_record.id, slot_time, 30)
      ON CONFLICT (weekly_availability_id, time_slot) DO NOTHING;
      
      slot_time := slot_time + INTERVAL '30 minutes';
    END LOOP;
  END LOOP;
END $$;

-- Step 3: Verify Setup
SELECT 
  wa.day_of_week,
  CASE wa.day_of_week
    WHEN 0 THEN 'Monday'
    WHEN 1 THEN 'Tuesday'
    WHEN 2 THEN 'Wednesday'
    WHEN 3 THEN 'Thursday'
    WHEN 4 THEN 'Friday'
    WHEN 5 THEN 'Saturday'
    WHEN 6 THEN 'Sunday'
  END as day_name,
  wa.start_time,
  wa.end_time,
  COUNT(ts.id) as total_slots
FROM weekly_availability wa
LEFT JOIN time_slots ts ON ts.weekly_availability_id = wa.id
WHERE wa.is_active = true
GROUP BY wa.id, wa.day_of_week, wa.start_time, wa.end_time
ORDER BY wa.day_of_week;

-- Expected Result:
-- Monday    09:00  17:00  16 slots
-- Tuesday   09:00  17:00  16 slots
-- Wednesday 09:00  17:00  16 slots
-- Thursday  09:00  17:00  16 slots
-- Friday    09:00  17:00  16 slots
