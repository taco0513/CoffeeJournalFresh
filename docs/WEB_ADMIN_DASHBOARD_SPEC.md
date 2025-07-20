# Coffee Journal Fresh - Web Admin Dashboard Specification

## Overview

A dedicated web-based admin dashboard for Coffee Journal Fresh, built with Next.js and Supabase, providing comprehensive management tools for coffee catalog moderation, user management, and analytics.

## Current State Analysis

### Existing In-App Admin Features
- **Admin Access**: Limited to `hello@zimojin.com` email
- **Coffee Catalog Management**:
  - View pending coffee submissions
  - Approve/reject/edit coffee entries
  - Basic statistics (total coffees, pending reviews, approved today, contributors)
- **Real-time Notifications**: Admin notifications for new submissions
- **Database Tables**:
  - `coffee_catalog`: Community-sourced coffee database
  - `admin_notifications`: Workflow management
  - Supporting tables: `user_profiles`, `community_reviews`, etc.

### Limitations of Current In-App Admin
- Limited screen real estate on mobile
- Basic filtering and search capabilities
- No bulk operations
- Limited analytics and reporting
- No export functionality
- Manual checking required for new submissions

## Web Admin Dashboard Requirements

### 1. Core Features

#### 1.1 Authentication & Authorization
- **Supabase Auth Integration**
  - Email-based admin login
  - Role-based access control (Super Admin, Moderator)
  - Session management with JWT tokens
- **Multi-admin Support**
  - Add/remove admin users
  - Permission levels per feature

#### 1.2 Coffee Catalog Management
- **Enhanced Review Interface**
  - Grid/table view with sorting and filtering
  - Batch operations (approve/reject multiple)
  - Advanced search (by date, user, origin, etc.)
  - Quick edit inline without navigation
- **Coffee Entry Details**
  - Full history of edits
  - User contribution history
  - Related reviews and ratings
  - Image uploads for coffee packaging
- **Duplicate Detection**
  - AI-powered similarity matching
  - Merge duplicate entries
  - Standardize naming conventions

#### 1.3 User Management
- **User Directory**
  - Search and filter users
  - View user profiles and activity
  - Ban/suspend/verify users
  - Reset passwords
- **Contribution Tracking**
  - User submission history
  - Quality score per contributor
  - Achievement management
- **Communication**
  - Send notifications to users
  - Broadcast announcements
  - Email templates for approvals/rejections

#### 1.4 Analytics & Reporting
- **Dashboard Overview**
  - Real-time statistics
  - Growth charts (users, coffees, reviews)
  - Geographic distribution maps
  - Popular coffees and roasteries
- **Detailed Reports**
  - User engagement metrics
  - Coffee submission trends
  - Review quality analysis
  - Moderation efficiency stats
- **Export Capabilities**
  - CSV/Excel exports
  - PDF reports
  - API for external tools

#### 1.5 Content Moderation
- **Review Management**
  - Flag inappropriate content
  - Moderate user reviews
  - Handle user reports
- **Quality Control**
  - Verify roaster information
  - Standardize coffee names
  - Validate origin data
  - Image moderation

#### 1.6 System Administration
- **Real-time Monitoring**
  - Server status
  - Database performance
  - API usage stats
  - Error tracking
- **Configuration Management**
  - Feature flags
  - System settings
  - Email templates
  - Notification rules

### 2. Technical Architecture

#### 2.1 Technology Stack
```
Frontend:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query for data fetching
- Recharts for data visualization

Backend:
- Supabase (existing)
- Edge Functions for complex operations
- Real-time subscriptions
- Row Level Security (RLS)

Infrastructure:
- Vercel deployment
- Supabase hosted database
- Cloudflare CDN for assets
- Sentry for error tracking
```

#### 2.2 Database Schema Extensions
```sql
-- Admin roles table
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('super_admin', 'moderator', 'analyst')),
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Moderation log
CREATE TABLE moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin settings
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);
```

#### 2.3 API Design
```typescript
// Admin API endpoints
/api/admin/auth/login
/api/admin/auth/logout
/api/admin/auth/refresh

/api/admin/coffee-catalog
  GET    /pending?page=1&limit=20&filter=...
  POST   /approve/:id
  POST   /reject/:id
  PUT    /edit/:id
  POST   /bulk-action

/api/admin/users
  GET    /?search=...&role=...
  PUT    /:id/status
  POST   /:id/notify

/api/admin/analytics
  GET    /overview
  GET    /reports/:type
  POST   /export

/api/admin/settings
  GET    /
  PUT    /:key
```

### 3. UI/UX Design

#### 3.1 Layout Structure
```
┌─────────────────────────────────────────────┐
│  Logo    Dashboard  Catalog  Users  Reports │ <- Top Nav
├─────────┬───────────────────────────────────┤
│         │                                   │
│ Sidebar │         Main Content Area         │
│         │                                   │
│ - Stats │                                   │
│ - Queue │                                   │
│ - Tools │                                   │
│         │                                   │
└─────────┴───────────────────────────────────┘
```

#### 3.2 Key Pages
1. **Dashboard Home**
   - Widget-based layout
   - Customizable metrics
   - Quick actions
   - Recent activity feed

2. **Coffee Catalog Queue**
   - Card or table view toggle
   - Batch selection
   - Quick preview modal
   - Inline editing

3. **User Management**
   - User table with filters
   - User detail drawer
   - Activity timeline
   - Action buttons

4. **Analytics**
   - Interactive charts
   - Date range selector
   - Comparison tools
   - Export options

#### 3.3 Design System
- **Colors**: Consistent with app (coffee-themed browns, greens)
- **Typography**: Inter for UI, system fonts
- **Components**: Based on shadcn/ui
- **Responsive**: Desktop-first, tablet-compatible
- **Dark Mode**: Optional support

### 4. Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Next.js project setup
- [ ] Supabase integration
- [ ] Authentication system
- [ ] Basic layout and navigation
- [ ] Admin role management

#### Phase 2: Core Features (Week 3-4)
- [ ] Coffee catalog management
- [ ] User management interface
- [ ] Basic analytics dashboard
- [ ] Notification system

#### Phase 3: Advanced Features (Week 5-6)
- [ ] Bulk operations
- [ ] Advanced search and filters
- [ ] Export functionality
- [ ] Real-time updates

#### Phase 4: Polish & Deploy (Week 7-8)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Deployment to production

### 5. Security Considerations

1. **Access Control**
   - IP whitelist option
   - 2FA support
   - Session timeout
   - Audit logging

2. **Data Protection**
   - Encrypted connections
   - RLS policies
   - Input validation
   - XSS prevention

3. **Rate Limiting**
   - API request limits
   - Bulk operation throttling
   - Export size limits

### 6. Performance Requirements

- Page load: < 2 seconds
- API response: < 500ms
- Real-time updates: < 1 second delay
- Support 10+ concurrent admins
- Handle 100k+ coffee entries

### 7. Future Enhancements

1. **AI Integration**
   - Auto-categorization
   - Quality scoring
   - Trend predictions
   - Anomaly detection

2. **Mobile App**
   - React Native admin app
   - Push notifications
   - Offline capabilities

3. **Advanced Analytics**
   - Machine learning insights
   - Predictive analytics
   - Custom report builder
   - Data warehouse integration

## Success Metrics

1. **Efficiency**
   - 50% reduction in moderation time
   - 90% of submissions reviewed within 24 hours
   - Bulk operations save 70% time

2. **Quality**
   - 95% accurate coffee data
   - < 5% duplicate entries
   - Standardized naming across catalog

3. **Adoption**
   - 100% admin task migration from app
   - Daily active usage by all admins
   - Positive feedback from moderators

## Conclusion

This web admin dashboard will transform coffee catalog management from a mobile-constrained experience to a powerful desktop interface, enabling efficient moderation, comprehensive analytics, and scalable administration of the Coffee Journal Fresh platform.