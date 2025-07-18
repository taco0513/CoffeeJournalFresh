# Supabase Setup Guide

This guide will help you set up Supabase for Coffee Journal app.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project

## Database Schema Setup

### 1. User Data Schema (Personal Tasting Records)

Run the SQL from `supabase-user-data-schema.sql` in the Supabase SQL editor:
- This creates tables for syncing personal tasting data
- Includes RLS policies for security

### 2. Community Features Schema

Run the SQL from `supabase-community-schema.sql` in the Supabase SQL editor:
- This creates tables for user profiles, reviews, and recommendations
- Includes social features like follows and likes

### 3. Data Collection Schema (Optional)

Run the SQL from `supabase-collection-schema.sql` if you want to enable anonymous data collection:
- This is for developers/operators to collect aggregated data
- Not required for regular users

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the `URL` and `anon public` key

3. Update `.env` file:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Enable Sync

1. Open `App.tsx`
2. Change `ENABLE_SYNC` to `true`:
   ```typescript
   export const ENABLE_SYNC = true;
   ```

## Authentication Setup

### Email Auth (Default)

Email authentication is enabled by default in Supabase.

### Additional Auth Providers (Optional)

To enable social logins:

1. Go to Authentication > Providers in Supabase dashboard
2. Enable desired providers (Google, Apple, etc.)
3. Configure OAuth credentials

### Deep Linking (for password reset)

Add this to your `Info.plist` (iOS):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>coffeejournalapp</string>
    </array>
  </dict>
</array>
```

## Testing Sync

1. Create a test account in the app
2. Add some tasting records
3. Check Supabase dashboard to verify data is syncing
4. Sign in on another device to test data sync

## Troubleshooting

### Sync not working
- Check internet connection
- Verify ENABLE_SYNC is true
- Check Supabase credentials in .env
- Look for errors in console

### Authentication errors
- Verify email is confirmed (check spam folder)
- Ensure Supabase project is not paused
- Check RLS policies are correctly set

### Performance issues
- Enable connection pooling in Supabase
- Consider implementing pagination for large datasets
- Use indexes on frequently queried columns