# Console Migration Guide

## Overview
This guide helps migrate from console statements to the structured logging service across 567 console statements in 78 files.

## Quick Start

### 1. Import the Logger
```typescript
// For general logging
import { Logger, logError, logUserAction } from '../utils/logger';

// For specific categories
import { RealmLogger, AuthLogger, SyncLogger, UILogger, APILogger } from '../utils/logger';
```

### 2. Replace Console Statements

#### Basic Replacements
```typescript
// Before
console.log('User signed in');
console.error('Database error:', error);
console.warn('Rate limit exceeded');

// After
Logger.info('User signed in', 'auth');
logError(error, { function: 'connectDatabase' }, 'database');
Logger.warn('Rate limit exceeded', 'api', { endpoint: '/users' });
```

#### Category-Specific Loggers
```typescript
// Before
console.log('Realm initialized');
console.error('Auth failed:', error);

// After
RealmLogger.info('Realm initialized');
AuthLogger.error('Auth failed', { error });
```

## Migration Patterns

### Pattern 1: Simple Console Replacement
```typescript
// Before
console.log('Operation completed');

// After
Logger.info('Operation completed', 'general');
```

### Pattern 2: Error Logging
```typescript
// Before
console.error('Failed to save:', error);

// After
logError(error, { function: 'saveData' }, 'data');
```

### Pattern 3: User Actions
```typescript
// Before
console.log('User clicked button');

// After
logUserAction('button_click', 'HomeScreen', { buttonId: 'save' });
```

### Pattern 4: Performance Timing
```typescript
// Before
const start = Date.now();
// ... operation
console.log(`Operation took ${Date.now() - start}ms`);

// After
import { PerformanceTimer } from '../utils/logger';
const timer = new PerformanceTimer('operation_name');
// ... operation
timer.end({ additionalData: 'value' });
```

### Pattern 5: API Calls
```typescript
// Before
console.log(`API call: ${method} ${url} - ${status}`);

// After
logAPICall(url, method, status, { responseTime: 150 });
```

## File-by-File Migration Priority

### High Priority Files (Critical Infrastructure)
1. `src/services/realm/RealmService.ts` ✅ **COMPLETED**
2. `src/services/PhotoService.ts` ✅ **COMPLETED**
3. `src/services/supabase/auth.ts` ✅ **COMPLETED**
4. `src/services/supabase/sync.ts`
5. `src/services/auth/UnifiedAuthService.ts`
6. `src/stores/useUserStore.ts`

### Medium Priority Files (Business Logic)
7. `src/services/LiteAICoachService.ts`
8. `src/services/PersonalTasteAnalysisService.ts`
9. `src/services/DataCollectionService.ts`
10. `src/services/ExportService.ts`

### Lower Priority Files (UI Components)
11. `src/screens/HomeScreen.tsx`
12. `src/screens/StatsScreen.tsx`
13. `src/components/ErrorBoundary.tsx`

## Development Convenience

### Gradual Migration Helper
For teams wanting to migrate gradually:

```typescript
import { createConsoleReplacement } from '../utils/logger';

// Create a console replacement for this file
const log = createConsoleReplacement('myComponent', 'MyComponent');

// Use like console but with structured logging
log.info('This goes to structured logging');
log.error('Error with context');
```

### Development-Only Logging
```typescript
import { devLog } from '../utils/logger';

// Only logs in development
devLog('Debug information', { debugData: value });
```

## Configuration

### Environment Variables
Add to your `.env` files:

```bash
# Development
LOG_LEVEL=0  # DEBUG

# Production  
LOG_LEVEL=2  # WARN
SENTRY_DSN=your_sentry_dsn
```

### Runtime Configuration
```typescript
import { Logger, LogLevel } from '../utils/logger';

// Change log level at runtime
Logger.setLogLevel(LogLevel.INFO);

// Enable/disable categories
Logger.enableCategory('debug');
Logger.disableCategory('verbose');
```

## Benefits After Migration

### 1. Structured Data
- **Before**: `console.log('User action:', action, 'on screen:', screen)`
- **After**: Structured JSON with searchable fields

### 2. Environment Control
- **Development**: All logs visible
- **Production**: Only warnings and errors
- **Testing**: Minimal logging

### 3. Error Tracking
- Automatic Sentry integration
- Error context and stack traces
- User session correlation

### 4. Performance Monitoring
- Built-in timing utilities
- Performance bottleneck identification
- Resource usage tracking

### 5. Debugging Support
- Log export for support tickets
- Session-based log correlation
- Category-based filtering

## Next Steps

1. **Complete High Priority**: Finish migrating critical infrastructure files
2. **Add Environment Config**: Set up proper environment variables
3. **Enable Sentry**: Configure error tracking for production
4. **Train Team**: Share this guide with team members
5. **Monitor Usage**: Review log output and adjust categories as needed

## Rollback Plan

If issues arise, the migration can be easily rolled back:
1. Comment out logger imports
2. Uncomment original console statements  
3. The logging service is non-breaking and optional