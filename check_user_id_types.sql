-- Check actual user_id column types in Supabase
-- Run this in Supabase SQL Editor to see the actual column types

SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE column_name = 'user_id' 
    AND table_schema = 'public'
ORDER BY table_name;