# v0.4.0 Personal Taste Discovery - Database Migration Guide

## Overview
This migration adds database support for the Personal Taste Discovery features including:
- User taste profiles and preferences
- Flavor learning progress tracking
- Achievement system
- Daily statistics and analytics

## Migration Files
1. `apply_v0.4.0_migration.sql` - Main migration script (safe to run multiple times)
2. `verify_v0.4.0_migration.sql` - Verification script to check migration success

## How to Apply the Migration

### Step 1: Connect to Supabase
You can use either method:

#### Option A: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `apply_v0.4.0_migration.sql`
4. Click "Run"

#### Option B: Command Line (psql)
```bash
# Get your database URL from Supabase Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f apply_v0.4.0_migration.sql
```

### Step 2: Verify Migration
Run the verification script to ensure everything was created correctly:

```sql
-- In Supabase SQL Editor or psql
-- Copy and run the contents of verify_v0.4.0_migration.sql
```

Expected output:
- All tables should show "✅ EXISTS"
- New columns in tasting_records should be listed
- All indexes should be present
- Views should exist
- 15 achievement definitions should be loaded

### Step 3: Update RLS Policies (if needed)
The migration grants basic permissions, but you may need to add RLS policies:

```sql
-- Example RLS policies for user_taste_profiles
ALTER TABLE user_taste_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own taste profile" ON user_taste_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own taste profile" ON user_taste_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own taste profile" ON user_taste_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

## New Tables Created

### 1. `user_taste_profiles`
Stores user's flavor preferences and taste statistics

### 2. `flavor_learning_progress`
Tracks user's progress in learning different flavors

### 3. `user_achievements`
Records unlocked achievements per user

### 4. `daily_taste_stats`
Daily aggregated statistics for analytics

### 5. `achievement_definitions`
Master list of available achievements (pre-populated with 15 achievements)

## Modified Tables

### `tasting_records`
Added columns:
- `personal_insights` (JSONB) - AI-generated insights
- `vocabulary_used` (TEXT[]) - Words used in description
- `difficulty_level` (INTEGER) - Tasting difficulty 1-5
- `learning_points` (INTEGER) - Points earned
- `taste_confidence` (DECIMAL) - User's confidence level

## Rollback Instructions (if needed)

```sql
-- Drop new tables
DROP TABLE IF EXISTS daily_taste_stats CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS flavor_learning_progress CASCADE;
DROP TABLE IF EXISTS user_taste_profiles CASCADE;
DROP TABLE IF EXISTS achievement_definitions CASCADE;

-- Drop views
DROP VIEW IF EXISTS user_progress_overview;
DROP VIEW IF EXISTS flavor_mastery_summary;

-- Remove columns from tasting_records
ALTER TABLE tasting_records 
DROP COLUMN IF EXISTS personal_insights,
DROP COLUMN IF EXISTS vocabulary_used,
DROP COLUMN IF EXISTS difficulty_level,
DROP COLUMN IF EXISTS learning_points,
DROP COLUMN IF EXISTS taste_confidence;
```

## Post-Migration Tasks

1. **Update TypeScript Types**
   - Regenerate Supabase types: `npx supabase gen types typescript --project-id [YOUR-PROJECT-ID] > src/types/supabase.ts`

2. **Test Services**
   - Run the app and test PersonalTasteAnalysisService
   - Verify achievement unlocking works
   - Check flavor learning progress tracking

3. **Monitor Performance**
   - Check query performance with new indexes
   - Monitor database size growth

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure you're using the correct database role
   - Check RLS policies are properly configured

2. **Table Already Exists**
   - The script uses `IF NOT EXISTS` so it's safe to run multiple times
   - If you get errors, check if tables were partially created

3. **Achievement Definitions Not Loading**
   - The script uses `ON CONFLICT DO NOTHING` to avoid duplicates
   - If empty, check for any constraint violations

## Next Steps

After successful migration:
1. ✅ Update Realm schemas to match new structure
2. ✅ Test data synchronization between Realm and Supabase
3. ✅ Implement UI components for new features
4. ✅ Add analytics tracking for user progress