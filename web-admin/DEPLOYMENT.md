# Coffee Journal Admin - Production Deployment Guide

This guide walks you through deploying the Coffee Journal Admin Dashboard to production using Vercel.

## 🚀 Quick Start

1. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

2. **Configure environment variables in Vercel**
3. **Set up custom domain**
4. **Configure admin accounts**

## 📋 Prerequisites

- [Vercel account](https://vercel.com)
- [Supabase project](https://supabase.com)
- Domain name (optional, for custom domain)
- Admin email accounts set up

## 🔧 Step-by-Step Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy the Project

From the `web-admin` directory:

```bash
# Option 1: Use the deployment script (recommended)
./deploy.sh

# Option 2: Manual deployment
npm run build
vercel --prod
```

### 4. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

#### Required Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Security Variables:
```env
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com
```

#### Admin Configuration:
```env
ADMIN_EMAIL=hello@zimojin.com
SUPER_ADMIN_EMAILS=hello@zimojin.com,admin@yourdomain.com
```

#### Optional Monitoring:
```env
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn-here
```

## 🗄️ Supabase Production Setup

### 1. Create Production Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project for production
3. Wait for the database to be ready
4. Note down your project URL and keys

### 2. Set Up Database Schema

Run the migration scripts in your production database:

```sql
-- User management
CREATE OR REPLACE FUNCTION check_admin_access(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN user_email IN ('hello@zimojin.com', 'admin@yourdomain.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE coffee_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin full access" ON coffee_catalog
  FOR ALL USING (check_admin_access(auth.jwt() ->> 'email'));

CREATE POLICY "Admin user access" ON users
  FOR ALL USING (check_admin_access(auth.jwt() ->> 'email'));
```

### 3. Configure Admin Users

1. Create admin accounts in Supabase Auth
2. Set the `is_admin` metadata:

```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email IN ('hello@zimojin.com', 'admin@yourdomain.com');
```

## 🔐 Security Configuration

### 1. Environment Variables Security

- Never commit `.env` files to version control
- Use Vercel's environment variable system
- Rotate keys regularly
- Use different keys for development and production

### 2. Supabase Security

- Enable Row Level Security (RLS) on all tables
- Restrict admin access to specific email addresses
- Use service role key only for admin operations
- Regular security audits

### 3. HTTPS and Headers

The deployment includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy restrictions

## 🌐 Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow the DNS configuration instructions

### 2. Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:

```env
NEXT_PUBLIC_APP_URL=https://admin.coffeejournal.app
NEXTAUTH_URL=https://admin.coffeejournal.app
```

### 3. DNS Configuration

Add these DNS records:
```
Type: CNAME
Name: admin (or your subdomain)
Value: cname.vercel-dns.com
```

## 📊 Monitoring Setup

### 1. Vercel Analytics (Built-in)

```env
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### 2. Sentry Error Tracking (Optional)

1. Create a Sentry project
2. Add environment variables:

```env
SENTRY_DSN=your-sentry-dsn-here
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=coffee-journal-admin
```

### 3. Uptime Monitoring

Consider setting up:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

## 🔄 CI/CD Setup

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Runs type checking
2. Builds the project
3. Deploys to Vercel on push to main branch
4. Creates preview deployments for pull requests

### Required Secrets

Add these secrets in your GitHub repository settings:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🧪 Testing Production Deployment

### 1. Smoke Tests

- [ ] Login with admin account
- [ ] Dashboard loads correctly
- [ ] Coffee catalog displays data
- [ ] User management works
- [ ] Charts render properly
- [ ] Bulk operations function

### 2. Performance Tests

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Database queries optimized

### 3. Security Tests

- [ ] Non-admin users cannot access
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No sensitive data in client

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Ensure no trailing spaces
   - Redeploy after adding variables

2. **Supabase Connection Failed**
   - Verify URL and keys are correct
   - Check database is accessible
   - Confirm RLS policies allow admin access

3. **Authentication Issues**
   - Ensure NEXTAUTH_URL matches deployment URL
   - Check admin user metadata
   - Verify email addresses in admin list

4. **Build Failures**
   - Run `npm run type-check` locally
   - Check for TypeScript errors
   - Verify all dependencies installed

### Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Monitor browser console errors
4. Contact support if needed

## 📈 Post-Deployment

### 1. Performance Monitoring

- Set up alerts for response time
- Monitor database query performance
- Track user session metrics

### 2. Regular Maintenance

- Update dependencies monthly
- Rotate API keys quarterly
- Review access logs weekly
- Backup database regularly

### 3. Scaling Considerations

- Monitor Vercel usage limits
- Optimize Supabase queries
- Consider CDN for static assets
- Plan for increased traffic

---

## 🎯 Production Checklist

- [ ] Vercel project deployed
- [ ] Environment variables configured
- [ ] Custom domain set up
- [ ] SSL certificate active
- [ ] Admin accounts created
- [ ] Database schema migrated
- [ ] Security policies enabled
- [ ] Monitoring configured
- [ ] CI/CD pipeline active
- [ ] Performance tested
- [ ] Security audited
- [ ] Documentation updated

🎉 **Congratulations!** Your Coffee Journal Admin Dashboard is now live in production!