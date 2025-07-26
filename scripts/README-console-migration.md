# Console to Logger Migration Guide

## Overview

This guide helps migrate all `console.*` statements to use our centralized `LoggingService` for better production logging, error tracking, and debugging capabilities.

## Current Status

- **Total console statements**: 623
- **Files affected**: 106
- **Most common**: `console.error` (309), `console.log` (275), `console.warn` (39)

## Migration Scripts

### 1. Dry Run Analysis
```bash
node scripts/migrate-console-dry-run.js
```
Shows a summary of all console statements and what will be changed.

### 2. Comprehensive Migration (Recommended)
```bash
# Preview changes
node scripts/migrate-console-comprehensive.js --dry-run

# Preview with details
node scripts/migrate-console-comprehensive.js --dry-run --verbose

# Apply changes
node scripts/migrate-console-comprehensive.js
```

### 3. Safe Migration (Basic)
```bash
node scripts/migrate-console-safe.js
```
A simpler version that handles basic console patterns.

## What Gets Changed

### Console Methods Mapping
- `console.log()` → `Logger.debug()`
- `console.debug()` → `Logger.debug()`
- `console.info()` → `Logger.info()`
- `console.warn()` → `Logger.warn()`
- `console.error()` → `Logger.error()`

### Example Transformations

```typescript
// Before
console.log('User logged in');
console.error('Login failed', error);

// After
Logger.debug('User logged in', 'auth', { component: 'LoginScreen' });
Logger.error('Login failed', 'auth', { component: 'LoginScreen', error: error });
```

### Automatic Features
- Adds Logger import automatically
- Determines category based on file location
- Extracts component name from filename
- Preserves error objects in context
- Skips commented console statements

## Categories

Files are automatically categorized based on their location:
- `/services/realm/` → `realm`
- `/services/auth/` → `auth`
- `/services/supabase/` → `supabase`
- `/screens/` → `screen`
- `/components/` → `component`
- `/hooks/` → `hook`
- `/stores/` → `store`
- `/utils/` → `util`
- `/services/` → `service`
- Other → `general`

## Step-by-Step Migration Process

### 1. Backup Your Code
```bash
git add .
git commit -m "backup: before console migration"
```

### 2. Run Dry Run
```bash
node scripts/migrate-console-comprehensive.js --dry-run --verbose
```

### 3. Review Output
Check the proposed changes and ensure they look correct.

### 4. Apply Migration
```bash
node scripts/migrate-console-comprehensive.js
```

### 5. Verify Changes
```bash
# Review git diff
git diff

# Check TypeScript compilation
npm run type-check

# Run the app and check logs
npm run ios
```

### 6. Commit Changes
```bash
git add .
git commit -m "refactor: migrate console statements to Logger

- Replace 623 console statements with Logger calls
- Add proper categorization and context
- Improve production logging capabilities"
```

## Benefits of Migration

1. **Production Safety**: Console logs are filtered in production
2. **Error Tracking**: Automatic Sentry integration for errors
3. **Categorization**: Filter logs by category (auth, realm, etc.)
4. **Context**: Every log includes component and additional context
5. **Performance**: Logs can be buffered and batched
6. **Debugging**: Export logs for support and debugging

## Post-Migration Configuration

### Adjust Log Levels
In `LoggingService.ts`, you can configure:
```typescript
// Development
this.currentLogLevel = LogLevel.DEBUG;

// Production
this.currentLogLevel = LogLevel.WARN;
```

### Enable/Disable Categories
```typescript
Logger.enableCategory('auth');
Logger.disableCategory('debug');
```

### Create Custom Loggers
```typescript
const MyLogger = Logger.createLogger('myfeature', { 
  component: 'MyComponent' 
});
```

## Troubleshooting

### Import Path Issues
The script automatically calculates relative imports. If you see errors, check:
- The import path is correct relative to the file location
- The LoggingService file exists at `src/services/LoggingService.ts`

### TypeScript Errors
After migration, if you see TypeScript errors:
1. Run `npm run type-check` to see all errors
2. Check that Logger methods match the expected signatures
3. Ensure all error objects are properly typed

### Runtime Issues
If the app crashes after migration:
1. Check that LoggingService is properly initialized
2. Verify import paths are correct
3. Look for circular dependency issues

## Manual Cleanup

Some patterns may need manual review:
- Complex console statements with multiple arguments
- Console statements in conditional blocks
- Dynamic console method calls
- Console statements in JSX

## Next Steps

After successful migration:
1. Review LoggingService configuration
2. Set up proper log levels for different environments
3. Configure Sentry for production error tracking
4. Consider adding custom loggers for specific features
5. Set up log export functionality for debugging