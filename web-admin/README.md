# Coffee Journal Admin Dashboard

Web-based admin dashboard for Coffee Journal Fresh, built with Next.js and Supabase.

## Overview

This admin dashboard provides comprehensive management tools for:
- Coffee catalog moderation
- User management
- Analytics and reporting
- System administration

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with admin role checking
- **State Management**: React Query
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project with Coffee Journal Fresh schema
- Admin access (email in admin list)

### Installation

1. Clone the repository:
```bash
cd coffee-journal-fresh/web-admin
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
web-admin/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirects to login)
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── dashboard/        # Dashboard-specific components
│   ├── lib/                   # Utility functions
│   │   ├── supabase/         # Supabase client
│   │   └── auth.ts           # Authentication helpers
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── package.json
```

## Features

### Authentication
- Email/password login for admins
- Role-based access control
- Session management

### Coffee Catalog Management
- View pending coffee submissions
- Approve/reject/edit entries
- Bulk operations
- Advanced search and filtering

### User Management
- View all users
- Ban/suspend/verify users
- View user activity and contributions

### Analytics
- Real-time statistics
- Growth charts
- Export capabilities

## Development

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Adding New Pages

1. Create a new directory in `src/app/(dashboard)/`
2. Add `page.tsx` for the main content
3. Use layout groups for shared layouts
4. Protect routes with authentication checks

### UI Components

This project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Self-hosted

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Security

- All admin routes are protected by authentication
- Supabase RLS policies enforce admin-only access
- Environment variables for sensitive data
- HTTPS required in production

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Part of Coffee Journal Fresh project.