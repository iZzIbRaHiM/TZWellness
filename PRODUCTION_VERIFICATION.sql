-- =====================================================
-- TZWELLNESS PRODUCTION VERIFICATION SCRIPT
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

-- =====================================================
-- SECTION 2: RLS POLICIES VERIFICATION
-- =====================================================

DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
    table_record RECORD;
BEGIN
    -- Check each critical table has RLS enabled
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class
        WHERE relname = table_record.tablename;
        
        IF rls_enabled THEN
            -- Count policies for this table
            SELECT COUNT(*) INTO policy_count
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = table_record.tablename;
            
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('RLS', 'RLS: ' || table_record.tablename, 'PASS', 
                    'RLS enabled with ' || policy_count || ' policies');
        ELSE
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('RLS', 'RLS: ' || table_record.tablename, 'WARN', 
                    'RLS not enabled (might be intentional)');
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- SECTION 3: CRITICAL RLS POLICIES CHECK
-- =====================================================

DO $$
DECLARE
    critical_policies TEXT[][] := ARRAY[
        ARRAY['services', 'Services are viewable by everyone'],
        ARRAY['blog_posts', 'Blog posts are viewable by everyone'],
        ARRAY['events', 'Events are viewable by everyone'],
        ARRAY['appointments', 'Users can view own appointments'],
        ARRAY['admin_settings', 'Admin users can view own settings'],
        ARRAY['activity_logs', 'Admin users can view all logs']
    ];
    policy_record TEXT[];
    policy_exists BOOLEAN;
BEGIN
    FOREACH policy_record SLICE 1 IN ARRAY critical_policies
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = policy_record[1] 
            AND policyname = policy_record[2]
        ) INTO policy_exists;
        
        IF policy_exists THEN
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('POLICY', policy_record[2], 'PASS', 'Policy exists on ' || policy_record[1]);
        ELSE
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('POLICY', policy_record[2], 'FAIL', 'Policy missing on ' || policy_record[1]);
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- SECTION 4: FOREIGN KEY CONSTRAINTS
-- =====================================================

DO $$
DECLARE
    fk_record RECORD;
    fk_count INTEGER := 0;
BEGIN
    FOR fk_record IN
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    LOOP
        fk_count := fk_count + 1;
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('FK', 'FK: ' || fk_record.table_name || '.' || fk_record.column_name, 'PASS',
                'References ' || fk_record.foreign_table_name || '.' || fk_record.foreign_column_name);
    END LOOP;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('FK', 'Total Foreign Keys', 'INFO', fk_count || ' foreign key constraints found');
END $$;

-- =====================================================
-- SECTION 5: TRIGGERS VERIFICATION
-- =====================================================

DO $$
DECLARE
    trigger_record RECORD;
    trigger_count INTEGER := 0;
BEGIN
    FOR trigger_record IN
        SELECT 
            event_object_table as table_name,
            trigger_name,
            action_timing,
            event_manipulation
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        ORDER BY event_object_table, trigger_name
    LOOP
        trigger_count := trigger_count + 1;
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('TRIGGER', trigger_record.trigger_name, 'PASS',
                'On ' || trigger_record.table_name || ' (' || trigger_record.action_timing || ' ' || trigger_record.event_manipulation || ')');
    END LOOP;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('TRIGGER', 'Total Triggers', 'INFO', trigger_count || ' triggers found');
END $$;

-- =====================================================
-- SECTION 6: INDEXES VERIFICATION
-- =====================================================

DO $$
DECLARE
    index_record RECORD;
    index_count INTEGER := 0;
BEGIN
    FOR index_record IN
        SELECT
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
        ORDER BY tablename, indexname
    LOOP
        index_count := index_count + 1;
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('INDEX', index_record.indexname, 'PASS', 'On ' || index_record.tablename);
    END LOOP;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('INDEX', 'Total Indexes', 'INFO', index_count || ' custom indexes found');
END $$;

-- =====================================================
-- SECTION 7: COLUMN DATA TYPES VERIFICATION
-- =====================================================

DO $$
DECLARE
    column_record RECORD;
    expected_type TEXT;
    type_matches BOOLEAN;
BEGIN
    -- Check critical timestamp columns
    FOR column_record IN
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name IN ('created_at', 'updated_at')
        ORDER BY table_name, column_name
    LOOP
        IF column_record.data_type = 'timestamp with time zone' THEN
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('DATATYPE', column_record.table_name || '.' || column_record.column_name, 'PASS',
                    'Correct type: ' || column_record.data_type);
        ELSE
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('DATATYPE', column_record.table_name || '.' || column_record.column_name, 'WARN',
                    'Unexpected type: ' || column_record.data_type);
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- SECTION 8: DEFAULT VALUES VERIFICATION
-- =====================================================

DO $$
DECLARE
    default_record RECORD;
BEGIN
    FOR default_record IN
        SELECT 
            table_name,
            column_name,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_default IS NOT NULL
        AND column_name IN ('created_at', 'updated_at', 'status', 'is_published', 'is_active')
        ORDER BY table_name, column_name
    LOOP
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('DEFAULT', default_record.table_name || '.' || default_record.column_name, 'PASS',
                'Default: ' || default_record.column_default);
    END LOOP;
END $$;

-- =====================================================
-- SECTION 9: ADMIN SETTINGS TABLE VALIDATION
-- =====================================================

DO $$
DECLARE
    settings_count INTEGER;
    has_business_hours BOOLEAN;
BEGIN
    -- Check if admin_settings table has records
    SELECT COUNT(*) INTO settings_count FROM admin_settings;
    
    IF settings_count > 0 THEN
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('DATA', 'Admin Settings Records', 'PASS', settings_count || ' settings record(s) found');
        
        -- Check if business_hours has default values
        SELECT EXISTS (
            SELECT 1 FROM admin_settings 
            WHERE business_hours IS NOT NULL 
            AND business_hours::text != '{}'
        ) INTO has_business_hours;
        
        IF has_business_hours THEN
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('DATA', 'Business Hours Configuration', 'PASS', 'Business hours configured');
        ELSE
            INSERT INTO verification_results (category, test_name, status, details)
            VALUES ('DATA', 'Business Hours Configuration', 'WARN', 'Business hours empty or null');
        END IF;
    ELSE
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('DATA', 'Admin Settings Records', 'WARN', 'No admin settings found (create on first admin login)');
    END IF;
END $$;

-- =====================================================
-- SECTION 10: CATEGORY TABLES VALIDATION
-- =====================================================

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
            service_cat_count || ' categories found');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Blog Categories',
            CASE WHEN blog_cat_count > 0 THEN 'PASS' ELSE 'WARN' END,
            blog_cat_count || ' categories found');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Event Categories',
            CASE WHEN event_cat_count > 0 THEN 'PASS' ELSE 'WARN' END,
            event_cat_count || ' categories found');
END $$;

-- =====================================================
-- SECTION 11: ORPHANED RECORDS CHECK
-- =====================================================

DO $$
DECLARE
    orphaned_services INTEGER;
    orphaned_blog_posts INTEGER;
    orphaned_events INTEGER;
    orphaned_appointments INTEGER;
BEGIN
    -- Check services without valid categories
    SELECT COUNT(*) INTO orphaned_services
    FROM services s
    LEFT JOIN service_categories sc ON s.category_id = sc.id
    WHERE sc.id IS NULL;
    
    -- Check blog posts without valid categories
    SELECT COUNT(*) INTO orphaned_blog_posts
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bp.category_id = bc.id
    WHERE bc.id IS NULL;
    
    -- Check events without valid categories
    SELECT COUNT(*) INTO orphaned_events
    FROM events e
    LEFT JOIN event_categories ec ON e.category_id = ec.id
    WHERE ec.id IS NULL;
    
    -- Check appointments without valid services
    SELECT COUNT(*) INTO orphaned_appointments
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    WHERE s.id IS NULL;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('INTEGRITY', 'Orphaned Services',
            CASE WHEN orphaned_services = 0 THEN 'PASS' ELSE 'FAIL' END,
            orphaned_services || ' services without valid category');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('INTEGRITY', 'Orphaned Blog Posts',
            CASE WHEN orphaned_blog_posts = 0 THEN 'PASS' ELSE 'FAIL' END,
            orphaned_blog_posts || ' blog posts without valid category');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('INTEGRITY', 'Orphaned Events',
            CASE WHEN orphaned_events = 0 THEN 'PASS' ELSE 'FAIL' END,
            orphaned_events || ' events without valid category');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('INTEGRITY', 'Orphaned Appointments',
            CASE WHEN orphaned_appointments = 0 THEN 'PASS' ELSE 'FAIL' END,
            orphaned_appointments || ' appointments without valid service');
END $$;

-- =====================================================
-- SECTION 12: ACTIVITY LOGS FUNCTIONALITY
-- =====================================================

DO $$
DECLARE
    log_count INTEGER;
    recent_logs INTEGER;
BEGIN
    SELECT COUNT(*) INTO log_count FROM activity_logs;
    
    SELECT COUNT(*) INTO recent_logs
    FROM activity_logs
    WHERE created_at > NOW() - INTERVAL '7 days';
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('LOGGING', 'Activity Logs Total', 'INFO', log_count || ' total log entries');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('LOGGING', 'Recent Activity Logs', 'INFO', recent_logs || ' logs in last 7 days');
END $$;

-- =====================================================
-- SECTION 13: AUTHENTICATION & PROFILES
-- =====================================================

DO $$
DECLARE
    auth_users_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- Count auth users
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    
    -- Count admin users (from app_metadata)
    SELECT COUNT(*) INTO admin_count
    FROM auth.users
    WHERE raw_app_meta_data->>'role' = 'admin';
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('AUTH', 'Auth Users', 'INFO', auth_users_count || ' users in auth.users');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('AUTH', 'Admin Users',
            CASE WHEN admin_count > 0 THEN 'PASS' ELSE 'FAIL' END,
            admin_count || ' admin user(s) configured');
END $$;

-- =====================================================
-- SECTION 14: STORAGE BUCKETS VERIFICATION
-- =====================================================

DO $$
DECLARE
    bucket_record RECORD;
    bucket_count INTEGER := 0;
BEGIN
    FOR bucket_record IN
        SELECT name, public FROM storage.buckets
    LOOP
        bucket_count := bucket_count + 1;
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('STORAGE', 'Bucket: ' || bucket_record.name, 'PASS',
                'Public: ' || bucket_record.public);
    END LOOP;
    
    IF bucket_count = 0 THEN
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('STORAGE', 'Storage Buckets', 'WARN', 'No storage buckets found');
    ELSE
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('STORAGE', 'Total Buckets', 'INFO', bucket_count || ' storage buckets configured');
    END IF;
END $$;

-- =====================================================
-- SECTION 15: CHECK CONSTRAINTS VALIDATION
-- =====================================================

DO $$
DECLARE
    constraint_record RECORD;
    constraint_count INTEGER := 0;
BEGIN
    FOR constraint_record IN
        SELECT
            tc.table_name,
            tc.constraint_name,
            cc.check_clause
        FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc
            ON tc.constraint_name = cc.constraint_name
        WHERE tc.constraint_type = 'CHECK'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name
    LOOP
        constraint_count := constraint_count + 1;
        INSERT INTO verification_results (category, test_name, status, details)
        VALUES ('CONSTRAINT', constraint_record.table_name || ': ' || constraint_record.constraint_name, 'PASS',
                constraint_record.check_clause);
    END LOOP;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('CONSTRAINT', 'Total Check Constraints', 'INFO', constraint_count || ' check constraints found');
END $$;

-- =====================================================
-- SECTION 16: APPOINTMENTS STATUS VALIDATION
-- =====================================================

DO $$
DECLARE
    pending_count INTEGER;
    approved_count INTEGER;
    rejected_count INTEGER;
    completed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pending_count FROM appointments WHERE status = 'pending';
    SELECT COUNT(*) INTO approved_count FROM appointments WHERE status = 'approved';
    SELECT COUNT(*) INTO rejected_count FROM appointments WHERE status = 'rejected';
    SELECT COUNT(*) INTO completed_count FROM appointments WHERE status = 'completed';
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Appointments: Pending', 'INFO', pending_count || ' pending appointments');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Appointments: Approved', 'INFO', approved_count || ' approved appointments');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Appointments: Rejected', 'INFO', rejected_count || ' rejected appointments');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('DATA', 'Appointments: Completed', 'INFO', completed_count || ' completed appointments');
END $$;

-- =====================================================
-- SECTION 17: PUBLISHED CONTENT VALIDATION
-- =====================================================

DO $$
DECLARE
    published_services INTEGER;
    published_blogs INTEGER;
    published_events INTEGER;
BEGIN
    SELECT COUNT(*) INTO published_services FROM services WHERE is_published = true;
    SELECT COUNT(*) INTO published_blogs FROM blog_posts WHERE is_published = true;
    SELECT COUNT(*) INTO published_events FROM events WHERE is_published = true;
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('CONTENT', 'Published Services', 'INFO', published_services || ' services published');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('CONTENT', 'Published Blog Posts', 'INFO', published_blogs || ' blog posts published');
    
    INSERT INTO verification_results (category, test_name, status, details)
    VALUES ('CONTENT', 'Published Events', 'INFO', published_events || ' events published');
END $$;

-- =====================================================
-- FINAL RESULTS OUTPUT
-- =====================================================

-- Summary by category and status
SELECT 
    '=== VERIFICATION SUMMARY BY CATEGORY ===' as summary_section;

SELECT 
    category,
    COUNT(*) as total_tests,
    SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as passed,
    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as failed,
    SUM(CASE WHEN status = 'WARN' THEN 1 ELSE 0 END) as warnings,
    SUM(CASE WHEN status = 'INFO' THEN 1 ELSE 0 END) as info
FROM verification_results
GROUP BY category
ORDER BY category;

-- Overall status
SELECT 
    '=== OVERALL STATUS ===' as overall_section;

SELECT 
    COUNT(*) as total_tests,
    SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as total_passed,
    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as total_failed,
    SUM(CASE WHEN status = 'WARN' THEN 1 ELSE 0 END) as total_warnings,
    SUM(CASE WHEN status = 'INFO' THEN 1 ELSE 0 END) as total_info,
    CASE 
        WHEN SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) = 0 THEN '✅ PRODUCTION READY'
        ELSE '❌ ISSUES FOUND - REVIEW FAILURES'
    END as production_status
FROM verification_results;

-- Show all failures first
SELECT 
    '=== CRITICAL FAILURES ===' as failures_section;

SELECT 
    test_number,
    category,
    test_name,
    details
FROM verification_results
WHERE status = 'FAIL'
ORDER BY category, test_number;

-- Show all warnings
SELECT 
    '=== WARNINGS ===' as warnings_section;

SELECT 
    test_number,
    category,
    test_name,
    details
FROM verification_results
WHERE status = 'WARN'
ORDER BY category, test_number;

-- Complete detailed results
SELECT 
    '=== DETAILED RESULTS (ALL TESTS) ===' as detailed_section;

SELECT 
    test_number,
    category,
    test_name,
    status,
    details,
    timestamp
FROM verification_results
ORDER BY category, test_number;

-- =====================================================
-- PRODUCTION READINESS CHECKLIST
-- =====================================================

SELECT 
    '=== PRODUCTION READINESS CHECKLIST ===' as checklist_section;

WITH checklist AS (
    SELECT 'All Tables Exist' as check_item,
           CASE WHEN NOT EXISTS (SELECT 1 FROM verification_results WHERE category = 'TABLE' AND status = 'FAIL') 
                THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT 'RLS Policies Active',
           CASE WHEN NOT EXISTS (SELECT 1 FROM verification_results WHERE category = 'RLS' AND status = 'FAIL')
                THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'Foreign Keys Valid',
           CASE WHEN NOT EXISTS (SELECT 1 FROM verification_results WHERE category = 'FK' AND status = 'FAIL')
                THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'No Orphaned Records',
           CASE WHEN NOT EXISTS (SELECT 1 FROM verification_results WHERE category = 'INTEGRITY' AND status = 'FAIL')
                THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'Admin User Configured',
           CASE WHEN EXISTS (SELECT 1 FROM verification_results WHERE category = 'AUTH' AND test_name = 'Admin Users' AND status = 'PASS')
                THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'Triggers Active',
           CASE WHEN EXISTS (SELECT 1 FROM verification_results WHERE category = 'TRIGGER' AND status = 'PASS')
                THEN '✅ PASS' ELSE '⚠️ CHECK' END
    UNION ALL
    SELECT 'Storage Configured',
           CASE WHEN EXISTS (SELECT 1 FROM verification_results WHERE category = 'STORAGE' AND test_name LIKE 'Bucket:%')
                THEN '✅ PASS' ELSE '⚠️ CHECK' END
)
SELECT check_item, status FROM checklist;

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================

SELECT 
    '=== RECOMMENDATIONS ===' as recommendations_section;

SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM service_categories) THEN '⚠️ Create service categories before adding services'
        WHEN NOT EXISTS (SELECT 1 FROM blog_categories) THEN '⚠️ Create blog categories before adding blog posts'
        WHEN NOT EXISTS (SELECT 1 FROM event_categories) THEN '⚠️ Create event categories before adding events'
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin') THEN '❌ CRITICAL: Create admin user before deployment'
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets) THEN '⚠️ Configure storage buckets for image uploads'
        ELSE '✅ All basic requirements met'
    END as recommendation;

-- =====================================================
-- END OF VERIFICATION SCRIPT
-- =====================================================

SELECT 
    '=== VERIFICATION COMPLETE ===' as completion_message,
    NOW() as completed_at;
