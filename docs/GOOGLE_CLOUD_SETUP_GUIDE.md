# Google Cloud Console Setup Guide - Coffee Journal Fresh

This comprehensive guide will walk you through setting up Google OAuth for Coffee Journal Fresh with proper security configurations.

## Prerequisites

- Google account with access to Google Cloud Console
- Coffee Journal Fresh project details:
  - iOS Bundle ID: `com.brianjin.CoffeeJournalFresh`
  - Android Package Name: `com.brianjin.coffeejournalf`
  - Supabase Project URL: `https://YOUR_PROJECT.supabase.co`

## Step 1: Create Google Cloud Project

1. **Navigate to Google Cloud Console**
   - Go to [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Project name: `Coffee Journal Fresh`
   - Organization: Leave as default or select your organization
   - Location: Leave as default
   - Click "Create"

3. **Select Your Project**
   - Once created, make sure your project is selected in the dropdown

## Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type (unless you have a Google Workspace)
   - Click "Create"

2. **App Information**
   ```
   App name: Coffee Journal Fresh
   User support email: [Your email]
   App logo: [Optional - upload coffee app icon]
   ```

3. **App Domain**
   ```
   Application home page: https://coffeejournalapp.com (if you have one)
   Application privacy policy: https://coffeejournalapp.com/privacy
   Application terms of service: https://coffeejournalapp.com/terms
   ```

4. **Authorized Domains**
   ```
   supabase.co
   [your-domain.com] (if applicable)
   ```

5. **Developer Contact Information**
   - Add your email address
   - Click "Save and Continue"

6. **Scopes**
   - Click "Add or Remove Scopes"
   - Select:
     - `openid`
     - `profile`
     - `email`
   - Click "Update" → "Save and Continue"

7. **Test Users** (for development)
   - Add your email and test users' emails
   - Click "Save and Continue"

8. **Summary**
   - Review information
   - Click "Back to Dashboard"

## Step 3: Enable Required APIs

1. **Navigate to APIs & Services**
   - Go to "APIs & Services" → "Library"

2. **Enable Google Sign-In API**
   - Search for "Google Sign-In API"
   - Click on it and press "Enable"

3. **Enable Google+ API** (if available)
   - Search for "Google+ API"
   - Click and enable (may not be available for new projects)

## Step 4: Create OAuth 2.0 Credentials

### Create iOS OAuth Client

1. **Navigate to Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure iOS Client**
   ```
   Application type: iOS
   Name: Coffee Journal Fresh iOS
   Bundle ID: com.brianjin.CoffeeJournalFresh
   ```

3. **Save iOS Client ID**
   - Copy the Client ID (format: `123456789-abcdefg.apps.googleusercontent.com`)
   - Save this for later use

### Create Web Application OAuth Client

1. **Create Another OAuth Client**
   - Click "Create Credentials" → "OAuth client ID" again

2. **Configure Web Client**
   ```
   Application type: Web application
   Name: Coffee Journal Fresh Web (Supabase)
   ```

3. **Authorized Redirect URIs**
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID

4. **Save Web Client Details**
   - Copy the Client ID
   - Copy the Client Secret
   - Save both for Supabase configuration

### Create Android OAuth Client (Future)

1. **Create Android Client**
   ```
   Application type: Android
   Name: Coffee Journal Fresh Android
   Package name: com.brianjin.coffeejournalf
   SHA-1 certificate fingerprint: [Generate from keystore]
   ```

## Step 5: Configure Supabase Authentication

1. **Navigate to Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to "Authentication" → "Providers"

2. **Enable Google Provider**
   - Toggle "Google" to enabled
   - Add your Web Client ID (from Step 4)
   - Add your Web Client Secret (from Step 4)
   - Click "Save"

3. **Verify Redirect URL**
   - Ensure the redirect URL matches what you added in Google Cloud Console
   - Format: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## Step 6: Security Configuration

### API Key Restrictions

1. **Navigate to Credentials**
   - Find your API keys in "APIs & Services" → "Credentials"

2. **Restrict API Key**
   - Click on your API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sign-In API"
   - Save

### Application Restrictions

1. **Restrict by HTTP Referrers** (for web)
   ```
   https://YOUR_PROJECT.supabase.co/*
   https://localhost:3000/* (for development)
   ```

2. **Restrict by iOS Bundle ID**
   - Add `com.brianjin.CoffeeJournalFresh`

### Enable Security Features

1. **Enable Advanced Protection**
   - Go to "Security" in Cloud Console
   - Enable relevant security features for your project

2. **Set Up Monitoring**
   - Enable audit logs
   - Set up quotas and monitoring for API usage

## Step 7: Environment Configuration

Create a `.env` file for your credentials (NEVER commit this to git):

```bash
# Google OAuth Credentials
GOOGLE_OAUTH_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_SECRET=your_web_client_secret
GOOGLE_OAUTH_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com

# Supabase Configuration
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

## Step 8: Production Considerations

### Domain Verification

1. **Verify Domain Ownership**
   - If using custom domains, verify ownership in Google Search Console
   - Add verified domains to OAuth consent screen

### Quota Management

1. **Set API Quotas**
   - Go to "APIs & Services" → "Quotas"
   - Set appropriate limits for Google Sign-In API
   - Monitor usage regularly

### Security Monitoring

1. **Enable Cloud Audit Logs**
   - Monitor authentication events
   - Set up alerts for suspicious activity

2. **Regular Security Reviews**
   - Review OAuth scopes periodically
   - Remove unused credentials
   - Rotate secrets regularly

## Troubleshooting

### Common Issues

1. **"OAuth client not found" Error**
   - Verify Client ID is correct
   - Ensure the OAuth client type matches your platform

2. **"Redirect URI mismatch" Error**
   - Check that Supabase redirect URI exactly matches Google Console
   - Ensure no trailing slashes or extra characters

3. **"This app isn't verified" Warning**
   - Normal for development
   - Submit for verification when ready for production
   - Add your email to test users for development

### Development vs Production

**Development:**
- Use "External" user type
- Add test users manually
- "This app isn't verified" warning is acceptable

**Production:**
- Submit app for verification
- Complete OAuth consent screen fully
- Remove test user restrictions

## Security Best Practices

1. **Credential Management**
   - Never commit OAuth secrets to version control
   - Use environment variables or secure vaults
   - Rotate secrets regularly

2. **Scope Minimization**
   - Only request necessary scopes (openid, profile, email)
   - Avoid requesting sensitive scopes unless required

3. **Certificate Pinning**
   - Implement certificate pinning for API calls
   - Validate SSL certificates

4. **Token Security**
   - Store tokens securely using KeyChain (iOS) or Keystore (Android)
   - Implement token refresh logic
   - Clear tokens on logout

5. **Monitoring**
   - Log authentication events
   - Monitor for unusual activity
   - Set up alerts for failed authentication attempts

## Next Steps

After completing this setup:

1. Update `src/config/googleAuth.ts` with your credentials
2. Configure iOS URL schemes in Info.plist
3. Test the OAuth flow thoroughly
4. Implement additional security measures
5. Prepare for production deployment

Remember to keep your credentials secure and never share them publicly!