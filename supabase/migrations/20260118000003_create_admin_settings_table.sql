-- =============================================
-- ADMIN SETTINGS TABLE
-- Store system-wide settings and admin preferences
-- =============================================

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile Settings
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Notification Settings
    email_notifications BOOLEAN DEFAULT true,
    appointment_notifications BOOLEAN DEFAULT true,
    event_notifications BOOLEAN DEFAULT true,
    blog_notifications BOOLEAN DEFAULT false,
    
    -- System Settings (only for primary admin)
    enable_online_booking BOOLEAN DEFAULT true,
    require_appointment_approval BOOLEAN DEFAULT true,
    auto_send_confirmations BOOLEAN DEFAULT true,
    auto_send_reminders BOOLEAN DEFAULT true,
    reminder_hours_before INTEGER DEFAULT 24,
    max_appointments_per_day INTEGER DEFAULT 10,
    booking_buffer_minutes INTEGER DEFAULT 15,
    
    -- Business Hours
    business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "17:00", "enabled": true}, "tuesday": {"open": "09:00", "close": "17:00", "enabled": true}, "wednesday": {"open": "09:00", "close": "17:00", "enabled": true}, "thursday": {"open": "09:00", "close": "17:00", "enabled": true}, "friday": {"open": "09:00", "close": "17:00", "enabled": true}, "saturday": {"open": "10:00", "close": "14:00", "enabled": false}, "sunday": {"open": "10:00", "close": "14:00", "enabled": false}}'::jsonb,
    
    -- Contact Information
    clinic_name TEXT DEFAULT 'TZ Wellness',
    clinic_email TEXT DEFAULT 'contact@tzwellness.com',
    clinic_phone TEXT DEFAULT '(555) 123-4567',
    clinic_address TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one settings record per user
    CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON public.admin_settings(user_id);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admin users can view their own settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin users can insert their own settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin users can update their own settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin users can delete their own settings" ON public.admin_settings;

-- RLS Policies: Only authenticated admin users can access their own settings
CREATE POLICY "Admin users can view their own settings"
    ON public.admin_settings
    FOR SELECT
    USING (
        auth.uid() = user_id 
        AND (auth.jwt() ->> 'role') = 'admin'
    );

CREATE POLICY "Admin users can insert their own settings"
    ON public.admin_settings
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND (auth.jwt() ->> 'role') = 'admin'
    );

CREATE POLICY "Admin users can update their own settings"
    ON public.admin_settings
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND (auth.jwt() ->> 'role') = 'admin'
    )
    WITH CHECK (
        auth.uid() = user_id 
        AND (auth.jwt() ->> 'role') = 'admin'
    );

CREATE POLICY "Admin users can delete their own settings"
    ON public.admin_settings
    FOR DELETE
    USING (
        auth.uid() = user_id 
        AND (auth.jwt() ->> 'role') = 'admin'
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_settings_updated_at_trigger ON public.admin_settings;
CREATE TRIGGER update_admin_settings_updated_at_trigger
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_settings_updated_at();

-- Insert default settings for existing admin users
INSERT INTO public.admin_settings (user_id, full_name, email)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    email
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.admin_settings IS 'Stores admin user profiles and system-wide settings. Protected by RLS - admin users only.';
