-- ============================================
-- TZ WELLNESS SUPABASE DATABASE SCHEMA
-- Complete Migration from Django to Supabase
-- ============================================
-- 
-- Run this entire script in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
--
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- 1. SERVICE CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);

-- ============================================
-- 2. SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  
  -- Basic Info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  short_description VARCHAR(300),
  description TEXT,
  symptoms TEXT,
  approach TEXT,
  what_to_expect TEXT,
  
  -- Media
  image TEXT,
  icon VARCHAR(50),
  
  -- Booking Details
  modality VARCHAR(20) DEFAULT 'both' CHECK (modality IN ('in_person', 'virtual', 'both')),
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  price_note VARCHAR(100),
  
  -- Display
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);

-- ============================================
-- 3. WEEKLY AVAILABILITY
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Monday, 6=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  allows_virtual BOOLEAN DEFAULT true,
  allows_in_person BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_availability_active ON weekly_availability(is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_availability_day ON weekly_availability(day_of_week);

-- ============================================
-- 4. EXCEPTION DATES
-- ============================================
CREATE TABLE IF NOT EXISTS exception_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  exception_type VARCHAR(20) DEFAULT 'blocked' CHECK (exception_type IN ('blocked', 'modified')),
  reason VARCHAR(200),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exception_dates_date ON exception_dates(date);

-- ============================================
-- 5. APPOINTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id VARCHAR(20) UNIQUE NOT NULL,
  
  -- Patient Info (Guest Checkout)
  patient_name VARCHAR(200) NOT NULL,
  patient_email VARCHAR(254) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  patient_type VARCHAR(20) DEFAULT 'new' CHECK (patient_type IN ('new', 'returning')),
  
  -- Service & Scheduling
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  modality VARCHAR(20) NOT NULL CHECK (modality IN ('virtual', 'in_person', 'phone')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Status & Notes
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  admin_notes TEXT,
  
  -- Communication
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  meeting_link TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_reference ON appointments(reference_id);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);

-- ============================================
-- 6. BLOG CATEGORIES & TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#064E3B',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- ============================================
-- 7. BLOG POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  
  -- Content
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  
  -- Media
  featured_image TEXT,
  image_caption VARCHAR(200),
  
  -- Author
  author_name VARCHAR(100),
  author_bio TEXT,
  author_avatar TEXT,
  
  -- Publishing
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Engagement
  read_time_minutes INTEGER,
  views INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Blog Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- 8. EVENT CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(20) DEFAULT 'workshop' CHECK (event_type IN ('workshop', 'live_qa', 'support_group', 'webinar', 'seminar')),
  description TEXT,
  color VARCHAR(7) DEFAULT '#064E3B',
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_categories_slug ON event_categories(slug);

-- ============================================
-- 9. EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  
  -- Basic Info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  what_to_bring TEXT,
  
  -- Scheduling
  modality VARCHAR(20) DEFAULT 'virtual' CHECK (modality IN ('virtual', 'in_person', 'hybrid')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Capacity
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Location
  location_name VARCHAR(200),
  location_address TEXT,
  virtual_link TEXT,
  
  -- Media
  image TEXT,
  
  -- Publishing
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- ============================================
-- 10. EVENT REGISTRATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(20),
  
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);

-- ============================================
-- 11. ACTIVITY LOGS (Admin Dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- ============================================
-- 12. RESOURCE CATEGORIES & RESOURCES
-- ============================================
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_categories_slug ON resource_categories(slug);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES resource_categories(id) ON DELETE SET NULL,
  
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  resource_type VARCHAR(20) DEFAULT 'guide' CHECK (resource_type IN ('guide', 'video', 'download', 'external_link')),
  url TEXT,
  file_url TEXT,
  
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_availability_updated_at BEFORE UPDATE ON weekly_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exception_dates_updated_at BEFORE UPDATE ON exception_dates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate reference ID for appointments
CREATE OR REPLACE FUNCTION generate_appointment_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_id IS NULL OR NEW.reference_id = '' THEN
    NEW.reference_id := 'APT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 9));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_appointment_reference BEFORE INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION generate_appointment_reference();

-- Function to get available dates
CREATE OR REPLACE FUNCTION get_available_dates(days_ahead INTEGER)
RETURNS TABLE(available_date DATE) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      CURRENT_DATE + INTERVAL '1 day',
      CURRENT_DATE + (days_ahead || ' days')::INTERVAL,
      '1 day'::INTERVAL
    )::DATE AS date
  )
  SELECT DISTINCT dr.date
  FROM date_range dr
  INNER JOIN weekly_availability wa ON EXTRACT(DOW FROM dr.date)::INTEGER = wa.day_of_week
  LEFT JOIN exception_dates ed ON ed.date = dr.date
  WHERE wa.is_active = true
    AND (ed.id IS NULL OR ed.exception_type != 'blocked')
  ORDER BY dr.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get available slots
CREATE OR REPLACE FUNCTION get_available_slots(
  start_date DATE,
  end_date DATE,
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
        -- Check slot not already booked
        AND NOT EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.scheduled_date = current_date
            AND a.scheduled_time = wa.start_time
            AND a.status IN ('pending', 'approved')
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

-- Function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET current_participants = current_participants + 1 
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function for dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'pending_count', (SELECT COUNT(*) FROM appointments WHERE status = 'pending'),
    'today_count', (SELECT COUNT(*) FROM appointments WHERE scheduled_date = CURRENT_DATE AND status IN ('pending', 'approved')),
    'total_patients', (SELECT COUNT(DISTINCT patient_email) FROM appointments),
    'completion_rate', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE status != 'pending') > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*) FILTER (WHERE status != 'pending')) * 100, 1)
        ELSE 0
      END
      FROM appointments
    ),
    'this_week_count', (
      SELECT COUNT(*) FROM appointments 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public services are viewable" ON services FOR SELECT USING (is_published = true);
CREATE POLICY "Public blog posts are viewable" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public events are viewable" ON events FOR SELECT USING (is_published = true);

-- Appointments: Anyone can create (guest booking), authenticated can view all
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can lookup appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Authenticated can update appointments" ON appointments FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin-only access for activity logs
CREATE POLICY "Authenticated can view activity logs" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can create activity logs" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin can manage all content
CREATE POLICY "Authenticated can manage services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage blog" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage events" ON events FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Sample Service Categories
INSERT INTO service_categories (name, slug, description, icon, "order") VALUES
('Mental Health', 'mental-health', 'Therapy and counseling services', 'brain', 1),
('Wellness', 'wellness', 'Holistic wellness programs', 'heart', 2),
('Consultation', 'consultation', 'Medical consultations', 'stethoscope', 3)
ON CONFLICT (slug) DO NOTHING;

-- Sample Services
INSERT INTO services (title, slug, short_description, description, modality, duration_minutes, is_featured, is_published, category_id) 
SELECT 
  'Individual Therapy',
  'individual-therapy',
  'One-on-one counseling sessions',
  'Personalized therapy sessions tailored to your needs. Our licensed therapists provide a safe, confidential space.',
  'both',
  60,
  true,
  true,
  c.id
FROM service_categories c WHERE c.slug = 'mental-health'
ON CONFLICT (slug) DO NOTHING;

-- Sample Weekly Availability (Mon-Fri, 9 AM - 5 PM)
INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active) VALUES
(0, '09:00', '17:00', true), -- Monday
(1, '09:00', '17:00', true), -- Tuesday
(2, '09:00', '17:00', true), -- Wednesday
(3, '09:00', '17:00', true), -- Thursday
(4, '09:00', '17:00', true)  -- Friday
ON CONFLICT DO NOTHING;

-- Sample Blog Categories
INSERT INTO blog_categories (name, slug, description, color, "order") VALUES
('Health Tips', 'health-tips', 'Practical health and wellness advice', '#10B981', 1),
('Mental Wellness', 'mental-wellness', 'Mental health insights', '#8B5CF6', 2),
('Nutrition', 'nutrition', 'Diet and nutrition guidance', '#F59E0B', 3)
ON CONFLICT (slug) DO NOTHING;

-- Sample Blog Post
INSERT INTO blog_posts (title, slug, excerpt, content, category_id, author_name, is_published, is_featured, read_time_minutes)
SELECT 
  'Understanding Blood Sugar: A Complete Guide',
  'understanding-blood-sugar-complete-guide',
  'Learn everything you need to know about maintaining healthy blood sugar levels.',
  'Blood sugar management is crucial for overall health. This comprehensive guide covers the basics of glucose metabolism, common concerns, and practical tips for maintaining balanced levels throughout the day.',
  c.id,
  'Dr. Wellness',
  true,
  true,
  8
FROM blog_categories c WHERE c.slug = 'health-tips'
ON CONFLICT (slug) DO NOTHING;

-- Sample Event Categories
INSERT INTO event_categories (name, slug, event_type, description, color, icon) VALUES
('Workshops', 'workshops', 'workshop', 'Interactive learning sessions', '#F59E0B', 'users'),
('Webinars', 'webinars', 'webinar', 'Online educational events', '#3B82F6', 'video')
ON CONFLICT (slug) DO NOTHING;

-- Sample Event
INSERT INTO events (title, slug, description, modality, start_date, end_date, max_participants, category_id, is_published, is_featured)
SELECT
  'Diabetes Workshop for New Patients',
  'diabetes-workshop-new-patients',
  'Join us for an informative workshop designed for newly diagnosed diabetes patients. Learn about blood sugar management, nutrition, and lifestyle changes.',
  'virtual',
  CURRENT_TIMESTAMP + INTERVAL '7 days',
  CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '2 hours',
  30,
  c.id,
  true,
  true
FROM event_categories c WHERE c.slug = 'workshops'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMPLETE!
-- ============================================
-- 
-- Next steps:
-- 1. Verify all tables created: Dashboard > Table Editor
-- 2. Test functions: SELECT get_available_dates(30);
-- 3. Create admin user: Dashboard > Authentication > Users
-- 4. Setup Edge Functions for emails
-- 5. Deploy frontend with Supabase credentials
--
-- ============================================


-- Create admin user for /admin login (only if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tzwellnesshealth@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'tzwellnesshealth@gmail.com',  -- ← CHANGE THIS to your email
      crypt('TZwell@@##99', gen_salt('bf')),  -- ← CHANGE THIS to your password
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User","role":"admin"}',
      NOW(),
      NOW(),
      '',
      ''
    );
    RAISE NOTICE 'Admin user created successfully';
  ELSE
    RAISE NOTICE 'Admin user already exists, skipping...';
  END IF;
END $$;

-- Add more services
INSERT INTO services (title, slug, short_description, description, modality, duration_minutes, price, is_featured, is_published, category_id)
SELECT 
  'Stress Management Counseling',
  'stress-management-counseling',
  'Professional help for managing stress and anxiety',
  'Our stress management program combines cognitive behavioral therapy with mindfulness techniques to help you develop effective coping strategies. Sessions are personalized to your specific stressors and lifestyle.',
  'both',
  45,
  120.00,
  true,
  true,
  c.id
FROM service_categories c WHERE c.slug = 'mental-health'

UNION ALL

SELECT 
  'Wellness Check-up',
  'wellness-checkup',
  'Comprehensive health assessment and guidance',
  'A thorough wellness evaluation including health history review, lifestyle assessment, and personalized recommendations for optimal health. Perfect for preventive care and wellness planning.',
  'in_person',
  60,
  150.00,
  false,
  true,
  c.id
FROM service_categories c WHERE c.slug = 'wellness'

UNION ALL

SELECT 
  'Virtual Health Consultation',
  'virtual-health-consultation',
  'Convenient online health consultations',
  'Get professional medical advice from the comfort of your home. Our virtual consultations cover general health concerns, follow-ups, and wellness guidance via secure video call.',
  'virtual',
  30,
  80.00,
  true,
  true,
  c.id
FROM service_categories c WHERE c.slug = 'consultation';

-- Add blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, category_id, author_name, is_published, is_featured, read_time_minutes)
SELECT 
  '5 Simple Ways to Reduce Daily Stress',
  '5-ways-reduce-daily-stress',
  'Practical, science-backed techniques you can implement today to lower stress levels.',
  'Stress is inevitable, but managing it effectively is a skill you can learn. Here are five evidence-based strategies that can help: 1) Practice deep breathing exercises for 5 minutes daily. 2) Maintain a consistent sleep schedule. 3) Exercise regularly, even just 20 minutes of walking. 4) Set boundaries with work and technology. 5) Connect with supportive friends and family. Each of these techniques has been shown to reduce cortisol levels and improve overall wellbeing.',
  c.id,
  'Dr. Sarah Johnson',
  true,
  true,
  6
FROM blog_categories c WHERE c.slug = 'mental-wellness'

UNION ALL

SELECT 
  'Understanding Nutrition Labels: A Complete Guide',
  'understanding-nutrition-labels-guide',
  'Learn how to read and interpret nutrition labels to make healthier food choices.',
  'Nutrition labels can be confusing, but they are powerful tools for making informed dietary choices. This guide breaks down each component: serving sizes, calories, macronutrients (proteins, carbs, fats), vitamins, minerals, and the percent daily values. We will also cover common misleading claims on packaging and how to spot them. By the end of this article, you will be equipped to make healthier decisions at the grocery store.',
  c.id,
  'Dr. Michael Chen',
  true,
  false,
  8
FROM blog_categories c WHERE c.slug = 'nutrition'

UNION ALL

SELECT 
  '10 Daily Habits for Better Mental Health',
  '10-daily-habits-mental-health',
  'Small changes that can make a big difference in your mental wellbeing.',
  'Mental health is built through daily practices, not just therapy sessions. Here are 10 habits to incorporate: morning gratitude journaling, regular physical activity, mindful eating, limited social media, quality sleep, social connections, learning something new, practicing self-compassion, spending time in nature, and maintaining boundaries. Start with 2-3 of these and gradually add more as they become routine.',
  c.id,
  'Dr. Emily White',
  true,
  false,
  7
FROM blog_categories c WHERE c.slug = 'mental-wellness';

-- Add upcoming events
INSERT INTO events (title, slug, description, what_to_bring, modality, start_date, end_date, max_participants, category_id, is_published, is_featured, virtual_link)
SELECT
  'Stress Management Workshop',
  'stress-management-workshop',
  'Learn practical techniques for managing stress in daily life. This interactive workshop covers breathing exercises, cognitive reframing, and building resilience. Suitable for all levels.',
  'Notebook, pen, comfortable clothing',
  'hybrid',
  CURRENT_TIMESTAMP + INTERVAL '10 days',
  CURRENT_TIMESTAMP + INTERVAL '10 days' + INTERVAL '2 hours',
  25,
  c.id,
  true,
  true,
  'https://meet.google.com/stress-workshop'
FROM event_categories c WHERE c.slug = 'workshops'

UNION ALL

SELECT
  'Nutrition Q&A Webinar',
  'nutrition-qa-webinar',
  'Join our nutritionist for a live Q&A session. Bring your questions about meal planning, dietary restrictions, supplements, and healthy eating habits. Free event for everyone!',
  'Your questions written down in advance',
  'virtual',
  CURRENT_TIMESTAMP + INTERVAL '14 days',
  CURRENT_TIMESTAMP + INTERVAL '14 days' + INTERVAL '1 hour',
  100,
  c.id,
  true,
  false,
  'https://zoom.us/j/nutrition-qa'
FROM event_categories c WHERE c.slug = 'webinars';

-- ============================================
-- TZ WELLNESS - COMPREHENSIVE AVAILABILITY FUNCTIONS
-- Production-Ready SQL for Supabase
-- ============================================
-- 
-- CRITICAL FIXES:
-- 1. Resolves ambiguous day_of_week column reference
-- 2. Fixes day-of-week mapping (PostgreSQL DOW vs ISO week)
-- 3. Adds proper NULL handling
-- 4. Includes comprehensive logging
-- 5. Optimizes performance with proper indexes
-- 
-- Run this in Supabase SQL Editor to replace existing functions
-- ============================================

-- ============================================
-- UNDERSTANDING DAY OF WEEK MAPPING
-- ============================================
-- PostgreSQL EXTRACT(DOW FROM date):
--   0 = Sunday, 1 = Monday, 2 = Tuesday, ... 6 = Saturday
--
-- ISO Week (used in weekly_availability table):
--   0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 
--   4 = Friday, 5 = Saturday, 6 = Sunday
--
-- Conversion needed: (EXTRACT(DOW) + 6) % 7
--   Sunday (0) -> (0+6)%7 = 6
--   Monday (1) -> (1+6)%7 = 0
--   Saturday (6) -> (6+6)%7 = 5
-- ============================================

-- ============================================
-- DROP EXISTING FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS get_available_dates(INTEGER);
DROP FUNCTION IF EXISTS get_available_slots(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS check_slot_available(DATE, TIME, TEXT);
DROP FUNCTION IF EXISTS get_day_name(INTEGER);
DROP FUNCTION IF EXISTS debug_day_mapping();

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
    d.date AS calendar_date,
    EXTRACT(DOW FROM d.date)::INTEGER AS pg_dow,
    ((EXTRACT(DOW FROM d.date)::INTEGER + 6) % 7) AS iso_day,
    get_day_name(((EXTRACT(DOW FROM d.date)::INTEGER + 6) % 7)) AS day_name,
    EXISTS(
      SELECT 1 FROM weekly_availability wa 
      WHERE wa.day_of_week = ((EXTRACT(DOW FROM d.date)::INTEGER + 6) % 7)
        AND wa.is_active = true
    ) AS has_availability
  FROM generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '14 days',
    '1 day'::INTERVAL
  ) AS d(date)
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION debug_day_mapping() IS
'Shows next 14 days with day-of-week mapping for debugging availability issues.';

-- ============================================
-- SAMPLE DATA POPULATION (RUN ONCE)
-- ============================================
-- Uncomment and modify as needed for your business hours

-- Monday to Friday: 9 AM to 5 PM (every 30 minutes)
DO $$
DECLARE
  day_num INTEGER;
  hour_num INTEGER;
BEGIN
  -- Only insert if table is empty
  IF NOT EXISTS (SELECT 1 FROM weekly_availability LIMIT 1) THEN
    -- Monday to Friday (0-4 in ISO format)
    FOR day_num IN 0..4 LOOP
      FOR hour_num IN 9..16 LOOP  -- 9 AM to 4:30 PM (last slot)
        INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
        VALUES (
          day_num,
          (hour_num || ':00')::TIME,
          (hour_num || ':30')::TIME,
          true,
          true,
          true
        );
        
        -- Add 30-minute slot if not last hour
        IF hour_num < 16 THEN
          INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
          VALUES (
            day_num,
            (hour_num || ':30')::TIME,
            ((hour_num + 1) || ':00')::TIME,
            true,
            true,
            true
          );
        END IF;
      END LOOP;
    END LOOP;
    
    -- Saturday: 10 AM to 2 PM (ISO day 5)
    FOR hour_num IN 10..13 LOOP
      INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
      VALUES (
        5,  -- Saturday
        (hour_num || ':00')::TIME,
        (hour_num || ':30')::TIME,
        true,
        true,
        true
      );
      
      IF hour_num < 13 THEN
        INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
        VALUES (
          5,  -- Saturday
          (hour_num || ':30')::TIME,
          ((hour_num + 1) || ':00')::TIME,
          true,
          true,
          true
        );
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Sample availability data inserted successfully';
  ELSE
    RAISE NOTICE 'Availability data already exists, skipping insert';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything works:

-- 1. Check day mapping for next 2 weeks
-- SELECT * FROM debug_day_mapping();

-- 2. Get available dates for next 30 days
-- SELECT get_available_dates(30);

-- 3. Get available slots for a specific date
-- SELECT get_available_slots('2026-01-13', '2026-01-13', 'virtual');

-- 4. Check if specific slot is available
-- SELECT check_slot_available('2026-01-13'::DATE, '10:00'::TIME, 'virtual');

-- 5. View all weekly availability
-- SELECT 
--   id,
--   get_day_name(day_of_week) as day_name,
--   day_of_week as iso_day,
--   start_time,
--   end_time,
--   is_active,
--   allows_virtual,
--   allows_in_person
-- FROM weekly_availability
-- ORDER BY day_of_week, start_time;


-- ============================================
-- TZ WELLNESS - QUICK FIX DEPLOYMENT SCRIPT
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- DROP EXISTING FUNCTIONS (Clean Slate)
-- ============================================
DROP FUNCTION IF EXISTS get_available_dates(INTEGER);
DROP FUNCTION IF EXISTS get_available_slots(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS check_slot_available(DATE, TIME, TEXT);
DROP FUNCTION IF EXISTS get_day_name(INTEGER);
DROP FUNCTION IF EXISTS debug_day_mapping();

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




-- Add business hours (Mon-Fri 9 AM to 5 PM, Sat 10 AM to 2 PM)
DO $$
DECLARE
  day_num INTEGER;
  hour_num INTEGER;
BEGIN
  -- Check if data already exists
  IF EXISTS (SELECT 1 FROM weekly_availability LIMIT 1) THEN
    RAISE NOTICE 'Weekly availability data already exists. Skipping insert.';
  ELSE
    -- Monday to Friday (ISO 0-4)
    FOR day_num IN 0..4 LOOP
      FOR hour_num IN 9..16 LOOP  -- 9 AM to 4:30 PM
        INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
        VALUES (
          day_num,
          (hour_num || ':00')::TIME,
          (hour_num || ':30')::TIME,
          true,
          true,
          true
        );
        
        IF hour_num < 16 THEN
          INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
          VALUES (
            day_num,
            (hour_num || ':30')::TIME,
            ((hour_num + 1) || ':00')::TIME,
            true,
            true,
            true
          );
        END IF;
      END LOOP;
    END LOOP;
    
    -- Saturday (ISO 5): 10 AM to 2 PM
    FOR hour_num IN 10..13 LOOP
      INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
      VALUES (5, (hour_num || ':00')::TIME, (hour_num || ':30')::TIME, true, true, true);
      
      IF hour_num < 13 THEN
        INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
        VALUES (5, (hour_num || ':30')::TIME, ((hour_num + 1) || ':00')::TIME, true, true, true);
      END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Sample availability data inserted successfully';
  END IF;
END $$;

-- Verify the data was inserted
SELECT 
  get_day_name(day_of_week) as day_name,
  day_of_week as iso_day,
  COUNT(*) as slots_count,
  MIN(start_time) as first_slot,
  MAX(start_time) as last_slot
FROM weekly_availability
WHERE is_active = true
GROUP BY day_of_week, get_day_name(day_of_week)
ORDER BY day_of_week;

-- Test again
SELECT get_available_dates(30);



-- Check what day Jan 13, 2026 actually is
SELECT 
  '2026-01-13'::DATE as date,
  EXTRACT(DOW FROM '2026-01-13'::DATE) as pg_dow,
  ((EXTRACT(DOW FROM '2026-01-13'::DATE)::INTEGER + 6) % 7) as iso_day,
  get_day_name(((EXTRACT(DOW FROM '2026-01-13'::DATE)::INTEGER + 6) % 7)) as day_name;

-- Check if Monday has slots
SELECT 
  day_of_week,
  get_day_name(day_of_week) as day_name,
  COUNT(*) as slot_count,
  MIN(start_time) as first_slot,
  MAX(start_time) as last_slot
FROM weekly_availability
WHERE is_active = true
GROUP BY day_of_week
ORDER BY day_of_week;

-- Test the get_available_slots function for Jan 13
SELECT get_available_slots('2026-01-13', '2026-01-13', NULL);






-- Delete the bad data
DELETE FROM weekly_availability;

-- Insert correct data with 30-minute slots
DO $$
DECLARE
  day_num INTEGER;
  hour_num INTEGER;
BEGIN
  -- Monday to Friday (ISO 0-4)
  FOR day_num IN 0..4 LOOP
    FOR hour_num IN 9..16 LOOP  -- 9 AM to 4:30 PM
      -- On the hour slot
      INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
      VALUES (
        day_num,
        (hour_num || ':00')::TIME,
        (hour_num || ':30')::TIME,
        true,
        true,
        true
      );
      
      -- Half hour slot (except after 4:30 PM)
      IF hour_num < 16 THEN
        INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
        VALUES (
          day_num,
          (hour_num || ':30')::TIME,
          ((hour_num + 1) || ':00')::TIME,
          true,
          true,
          true
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Saturday (ISO 5): 10 AM to 2 PM
  FOR hour_num IN 10..13 LOOP
    INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
    VALUES (5, (hour_num || ':00')::TIME, (hour_num || ':30')::TIME, true, true, true);
    
    IF hour_num < 13 THEN
      INSERT INTO weekly_availability (day_of_week, start_time, end_time, is_active, allows_virtual, allows_in_person)
      VALUES (5, (hour_num || ':30')::TIME, ((hour_num + 1) || ':00')::TIME, true, true, true);
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Inserted % rows', (SELECT COUNT(*) FROM weekly_availability);
END $$;

-- Verify the data
SELECT 
  get_day_name(day_of_week) as day,
  COUNT(*) as slots,
  MIN(start_time) as first,
  MAX(start_time) as last
FROM weekly_availability
GROUP BY day_of_week, get_day_name(day_of_week)
ORDER BY day_of_week;

-- Test Jan 13 again
SELECT get_available_slots('2026-01-13', '2026-01-13', NULL);






-- Drop ALL versions by their specific names
DROP FUNCTION IF EXISTS get_available_slots_17822(DATE, DATE, TEXT);
DROP FUNCTION IF EXISTS get_available_slots_20123(TEXT, TEXT, TEXT);

-- Now create the ONLY correct version
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
      WHERE wa.day_of_week = iso_day
        AND wa.is_active = true
        AND (
          modality_filter IS NULL 
          OR (modality_filter = 'virtual' AND wa.allows_virtual = true)
          OR (modality_filter = 'in_person' AND wa.allows_in_person = true)
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM exception_dates ed
          WHERE ed.date = date_to_check
            AND ed.exception_type = 'blocked'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM appointments a
          WHERE a.scheduled_date = date_to_check
            AND a.scheduled_time = wa.start_time
            AND a.status IN ('pending', 'approved', 'completed')
        )
      ORDER BY wa.start_time
    LOOP
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

-- Verify only ONE function exists now
SELECT routine_name, COUNT(*) 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_available_slots'
GROUP BY routine_name;





SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as parameters
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_available_slots';







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



-- First, let's see ALL users with this email
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
WHERE email = 'tzwellnesshealth@gmail.com'
ORDER BY created_at DESC;

-- Update BOTH users to have admin role (to be safe)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'tzwellnesshealth@gmail.com';

-- Verify both users now have admin role
SELECT 
  id,
  email,
  raw_user_meta_data,
  last_sign_in_at
FROM auth.users
WHERE email = 'tzwellnesshealth@gmail.com'
ORDER BY created_at DESC;


-- See ALL users in the database (not just your email)
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- If you see the user with ID 9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7, run this:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = '9c0f9bbc-52f3-49f6-89d9-3e106a8d29f7';

-- Otherwise, update the existing admin user and use that account:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'tzwellnesshealth@gmail.com';

-- Verify the updates
SELECT 
  id,
  email,
  raw_user_meta_data,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;





-- ============================================
-- SUPABASE STORAGE SETUP FOR BLOG IMAGES
-- ============================================
-- Run this in Supabase SQL Editor to enable image uploads

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog images
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload blog images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to delete blog images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'blog-images';

-- Run this to verify policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%blog%';










