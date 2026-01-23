-- =====================================================
-- TZWELLNESS PRODUCTION VERIFICATION SCRIPT (SIMPLIFIED)
-- =====================================================
-- Run this in Supabase SQL Editor to verify database
-- Date: January 23, 2026
-- Purpose: Complete backend validation before production
-- =====================================================

-- Clear any previous verification results
DROP TABLE IF EXISTS verification_results CASCADE;

-- Create results table
CREATE TEMP TABLE verification_results (
    test_number SERIAL PRIMARY KEY,
    category VARCHAR(50),
    test_name VARCHAR(200),
    status VARCHAR(10),
    details TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 1: TABLE EXISTENCE VERIFICATION
-- =====================================================

DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'service_categories',
        'services',
        'blog_categories',
        'blog_posts',
        'event_categories',
        'events',
        'event_registrations',
        'appointments',
        'admin_settings',
        'activity_logs'
    ];
    tbl_name TEXT;
    table_exists BOOLEAN;
BEGIN
    FOREACH tbl_name IN ARRAY required_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) INTO table_exists;
        
        IF table_exists THEN
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('TABLE', 'Table: ' || tbl_name, 'PASS', 'Table exists');
        ELSE
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('TABLE', 'Table: ' || tbl_name, 'FAIL', 'Table missing');
        END IF;
    END LOOP;
END $$;

-- SECTION 2: RLS POLICIES
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class
        WHERE relname = table_record.tablename;
        
        IF rls_enabled THEN
            SELECT COUNT(*) INTO policy_count
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = table_record.tablename;
            
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('RLS', 'RLS: ' || table_record.tablename, 'PASS', 
                    'RLS enabled with ' || policy_count || ' policies');
        ELSE
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('RLS', 'RLS: ' || table_record.tablename, 'WARN', 
                    'RLS not enabled');
        END IF;
    END LOOP;
END $$;

-- SECTION 3: AUTHENTICATION
DO $$
DECLARE
    auth_users_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    SELECT COUNT(*) INTO admin_count
    FROM auth.users
    WHERE raw_app_meta_data->>'role' = 'admin';
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('AUTH', 'Total Users', 'INFO', auth_users_count || ' users');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('AUTH', 'Admin Users',
            CASE WHEN admin_count > 0 THEN 'PASS' ELSE 'FAIL' END,
            admin_count || ' admin(s) - ' || CASE WHEN admin_count > 0 THEN 'OK' ELSE 'CRITICAL: NEED ADMIN!' END);
END $$;

-- SECTION 4: DATA
DO $$
DECLARE
    service_cat_count INTEGER;
    blog_cat_count INTEGER;
    event_cat_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO service_cat_count FROM service_categories;
    SELECT COUNT(*) INTO blog_cat_count FROM blog_categories;
    SELECT COUNT(*) INTO event_cat_count FROM event_categories;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Service Categories', 
            CASE WHEN service_cat_count > 0 THEN 'PASS' ELSE 'WARN' END,
            service_cat_count || ' categories');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Blog Categories',
            CASE WHEN blog_cat_count > 0 THEN 'PASS' ELSE 'WARN' END,
            blog_cat_count || ' categories');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Event Categories',
            CASE WHEN event_cat_count > 0 THEN 'PASS' ELSE 'WARN' END,
            event_cat_count || ' categories');
END $$;

-- SECTION 5: STORAGE
DO $$
DECLARE
    bucket_count INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('STORAGE', 'Storage Buckets',
            CASE WHEN bucket_count > 0 THEN 'PASS' ELSE 'WARN' END,
            bucket_count || ' buckets - ' || CASE WHEN bucket_count > 0 THEN 'Configured' ELSE 'Need buckets for images' END);
END $$;

-- =====================================================
-- SINGLE OUTPUT: ALL RESULTS
-- =====================================================

SELECT 
    category,
    test_name,
    status,
    details
FROM verification_results
ORDER BY 
    CASE category
        WHEN 'TABLE' THEN 1
        WHEN 'RLS' THEN 2
        WHEN 'AUTH' THEN 3
        WHEN 'DATA' THEN 4
        WHEN 'STORAGE' THEN 5
        ELSE 6
    END,
    test_number;
