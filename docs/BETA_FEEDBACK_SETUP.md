# Beta Feedback System Setup Guide

## Overview

Coffee Journal Fresh now includes a comprehensive beta feedback mechanism that allows beta testers to easily provide feedback, report bugs, and suggest improvements. The system includes in-app feedback forms, shake-to-feedback functionality, crash reporting, and an admin dashboard for managing feedback.

## Features Implemented

### 1. In-App Feedback Component
- **Shake-to-Feedback**: Beta users can shake their device to open the feedback modal
- **Floating Feedback Button**: A draggable button appears for beta users
- **Feedback Categories**: Bug reports, improvements, ideas, and praise
- **Rating System**: 1-5 star satisfaction rating
- **Screenshot Capability**: Capture current screen (ready for integration)
- **Offline Support**: Feedback is queued when offline and synced later

### 2. Feedback Form UI
- Clean, user-friendly modal interface
- Category selection with emoji icons
- Optional rating system
- Title and description fields
- Character count for description
- Device info auto-collection
- Korean language support throughout

### 3. Backend Integration
- **Database Tables**:
  - `beta_users`: Tracks beta testers
  - `feedback_items`: Stores all feedback
  - `feedback_notifications`: Admin notifications
  - `feedback_analytics`: Analytics view
- **Supabase Integration**: Real-time updates and secure storage
- **Email Notifications**: Ready for admin alerts (requires email service setup)
- **Offline Queue**: Feedback saved locally when offline

### 4. Beta User Management
- Beta status tracked in database
- Feature flags for beta-only features
- Beta badge on floating button
- Developer mode integration

### 5. Admin Dashboard
- Located at `/admin/feedback` route
- View all feedback with filters
- Update feedback status
- Add admin notes
- View device info and context
- Analytics overview

### 6. Crash Reporting
- Sentry integration ready (requires DSN)
- Custom error boundaries
- User context tracking
- Breadcrumbs for debugging
- Beta-specific tracking

## Setup Instructions

### 1. Database Setup

Run the migration script to create the necessary tables:

```sql
-- Apply the migration
psql -U your_user -d your_database -f src/database/migrations/v0.5.0_beta_feedback_system.sql
```

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Sentry Configuration (optional but recommended)
SENTRY_DSN=your_sentry_dsn_here

# Email Service (for admin notifications - optional)
SENDGRID_API_KEY=your_sendgrid_key
ADMIN_EMAIL=hello@zimojin.com
```

### 3. Enable Beta Features for Users

To make a user a beta tester:

```sql
-- Add user to beta program
INSERT INTO beta_users (user_id) 
VALUES ('user-uuid-here')
ON CONFLICT (user_id) 
DO UPDATE SET is_active = true;
```

### 4. Developer Mode Access

Beta feedback controls are available in Developer Mode:
1. Go to Profile → 개발자 모드
2. Enable Developer Mode
3. Find "베타 피드백" section
4. Toggle features as needed

### 5. Admin Access

The feedback admin dashboard is available at:
- In-app: Developer Mode → 피드백 관리 대시보드
- Only accessible by `hello@zimojin.com`

## Usage Guide

### For Beta Users

1. **Shake to Feedback**:
   - Shake device to open feedback modal
   - Can be disabled in Developer Mode

2. **Floating Button**:
   - Drag the floating button anywhere on screen
   - Tap to expand, tap again to open feedback

3. **Submit Feedback**:
   - Choose category (bug, improvement, idea, praise)
   - Add optional rating
   - Write title and description
   - Screenshot option available (coming soon)
   - Submit sends immediately or queues if offline

### For Admins

1. **Access Dashboard**:
   - Go to Developer Mode
   - Tap "피드백 관리 대시보드"

2. **Manage Feedback**:
   - Filter by category or status
   - Tap feedback to view details
   - Update status (pending → reviewed → in-progress → resolved)
   - Add admin notes
   - View device info and context

3. **Analytics**:
   - Total feedback count
   - Pending items
   - Average rating
   - Unique users

## Technical Details

### Key Components

- **FeedbackProvider**: Wraps the app with feedback functionality
- **FeedbackModal**: Main feedback form component
- **FloatingFeedbackButton**: Draggable feedback button
- **FeedbackService**: Handles submission and offline queue
- **useFeedbackStore**: Zustand store for feedback state
- **useShakeToFeedback**: Hook for shake detection
- **AdminFeedbackScreen**: Admin management interface

### Offline Support

Feedback is automatically queued when offline:
1. Saved to AsyncStorage with `@feedback_queue` key
2. Synced on app launch or network reconnection
3. Failed syncs are retried

### Security

- Row Level Security (RLS) policies ensure:
  - Users can only view their own feedback
  - Only admins can view all feedback
  - Only admins can update feedback status
- Beta status verified server-side

## Future Enhancements

1. **Screenshot Integration**:
   - Uncomment ViewShot code when ready
   - Configure react-native-view-shot properly

2. **Email Notifications**:
   - Implement Supabase Edge Function for emails
   - Or integrate SendGrid/Mailgun directly

3. **Analytics Dashboard**:
   - Add charts for feedback trends
   - Export functionality
   - More detailed metrics

4. **Push Notifications**:
   - Notify users when feedback is resolved
   - Admin alerts for new feedback

## Troubleshooting

### Shake Not Working
- Check if shake is enabled in Developer Mode
- Ensure device has accelerometer
- Android may need explicit permissions

### Feedback Not Syncing
- Check network connection
- Verify Supabase configuration
- Check RLS policies

### Beta Features Not Showing
- Verify user is in beta_users table
- Check isBetaUser state in app
- Force refresh by restarting app

## Contact

For issues or questions about the beta feedback system:
- Email: hello@zimojin.com
- Create an issue in the repository