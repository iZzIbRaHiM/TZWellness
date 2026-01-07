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

-- Uncomment to insert sample data

/*
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
*/

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
