# Supabase Table Analysis

## Security Error Tables

### Tables with RLS Disabled:
1. **coffee_catalog** - Found in: supabase-community-schema.sql
2. **collected_tastings** - Found in: supabase-collection-schema.sql  
3. **collection_logs** - Found in: supabase-collection-schema.sql
4. **user_taste_profiles** - Found in: v0.4.0_personal_taste_discovery.sql, apply_v0.4.0_migration.sql
5. **flavor_learning_progress** - Found in: v0.4.0_personal_taste_discovery.sql, apply_v0.4.0_migration.sql
6. **user_achievements** - Found in: v0.4.0_personal_taste_discovery.sql, apply_v0.4.0_migration.sql
7. **daily_taste_stats** - Found in: v0.4.0_personal_taste_discovery.sql, apply_v0.4.0_migration.sql
8. **achievement_definitions** - Found in: v0.4.0_personal_taste_discovery.sql, apply_v0.4.0_migration.sql

### Views with SECURITY DEFINER:
1. **flavor_mastery_summary**
2. **flavor_analysis**
3. **user_statistics**
4. **user_progress_overview**
5. **collection_stats**
6. **trending_coffees**
7. **origin_stats**
8. **roastery_stats**
9. **admin_notification_stats**

## Core Tables Used in Views:
- **tasting_records** - Main table for coffee tastings
- **flavor_notes** - Stores flavor selections for each tasting
- **sensory_attributes** - Stores sensory attributes for each tasting
- **auth.users** - Supabase auth table

## Table Field Types:
- collected_tastings.user_id: UUID
- collection_logs.user_id: UUID  
- user_taste_profiles.user_id: UUID
- flavor_learning_progress.user_id: UUID
- user_achievements.user_id: UUID
- daily_taste_stats.user_id: UUID
- tasting_records.user_id: UUID

## Key Findings:
1. All user_id fields are UUID type (not text)
2. flavor_selections table doesn't exist - it's actually flavor_notes
3. coffees table doesn't exist - it's actually coffee_catalog
4. tasting_records uses created_at not tasted_at
5. tasting_records uses match_score_total not overall_rating
6. tasting_records has coffee_name and cafe_name as text fields, not IDs