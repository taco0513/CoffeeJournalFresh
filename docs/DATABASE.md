# Coffee Tasting Journal - Database Architecture

**Last Updated**: 2025-07-17

> ⚠️ **현재 상태**: Realm과 Supabase 스키마가 일치하지 않아 동기화 기능이 제한됩니다.
> - Realm: 로컬 오프라인 저장소 (완벽 작동)
> - Supabase: 읽기 전용 비교 데이터 (getCoffeeComparison, getSimilarCoffees)
> - 동기화: 베타 테스트 후 활성화 예정

## Overview
The app uses a hybrid storage approach:
- **Realm**: Local-first storage for offline functionality
- **Supabase**: Cloud storage for backup and cross-device sync
- **Sync Strategy**: Bidirectional sync with conflict resolution

## Realm Schemas (Local Storage)

### 1. TastingRecord Schema

```typescript
class TastingRecord extends Realm.Object {
  static schema = {
    name: 'TastingRecord',
    primaryKey: 'id',
    properties: {
      // Identity
      id: 'string',                    // UUID format: 'tasting_1234567890'
      userId: 'string?',               // Optional, for future user accounts
      
      // Timestamps
      createdAt: 'date',
      updatedAt: 'date',
      syncedAt: 'date?',              // Last sync with Supabase
      
      // Coffee Information
      cafeName: 'string?',
      roastery: 'string',              // Note: maps to roaster_name in Supabase
      coffeeName: 'string',
      origin: 'string?',
      variety: 'string?',
      altitude: 'string?',
      process: 'string?',
      temperature: 'string',           // 'hot' | 'ice'
      
      // Roaster Notes
      roasterNotes: 'string?',
      
      // Match Score (현재 Realm은 3개 필드, Supabase는 1개)
      matchScoreTotal: 'int',          // 0-100
      matchScoreFlavor: 'int',         // 0-100 (Supabase에 없음)
      matchScoreSensory: 'int',        // 0-100 (Supabase에 없음)
      
      // Relationships
      flavorNotes: 'FlavorNote[]',
      sensoryAttribute: 'SensoryAttribute',
      
      // Sync Status
      isSynced: { type: 'bool', default: false },
      isDeleted: { type: 'bool', default: false },
    }
  };
}
```

### 2. FlavorNote Schema

```typescript
class FlavorNote extends Realm.Object {
  static schema = {
    name: 'FlavorNote',
    embedded: true,                    // Embedded in TastingRecord
    properties: {
      level: 'int',                    // 1, 2, 3, or 4
      value: 'string',                 // e.g., 'Fruity', 'Berry', 'Blackberry'
      koreanValue: 'string?',          // e.g., '과일', '베리류', '블랙베리'
    }
  };
}
```

### 3. SensoryAttribute Schema

```typescript
class SensoryAttribute extends Realm.Object {
  static schema = {
    name: 'SensoryAttribute',
    embedded: true,                    // Embedded in TastingRecord
    properties: {
      body: 'int',                     // 1-5
      acidity: 'int',                  // 1-5
      sweetness: 'int',                // 1-5
      finish: 'int',                   // 1-5
      mouthfeel: 'string',             // 'Clean' | 'Creamy' | 'Juicy' | 'Silky'
    }
  };
}
```

### 4. User Schema (Future)

```typescript
class User extends Realm.Object {
  static schema = {
    name: 'User',
    primaryKey: 'id',
    properties: {
      id: 'string',                    // UUID from Supabase Auth
      email: 'string',
      displayName: 'string?',
      avatarUrl: 'string?',
      preferences: 'UserPreferences',
      createdAt: 'date',
      lastSyncedAt: 'date?',
    }
  };
}
```

## Supabase Tables (Cloud Storage)

### 1. tasting_records Table (Note: actual table name)

```sql
CREATE TABLE tasting_records (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  realm_id TEXT UNIQUE,  -- Maps to Realm's string ID
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Coffee Information
  cafe_name TEXT,
  roaster_name TEXT NOT NULL,          -- Changed from 'roastery' to 'roaster_name'
  coffee_name TEXT NOT NULL,
  origin TEXT,
  variety TEXT,
  altitude TEXT,
  process TEXT,
  temperature TEXT CHECK (temperature IN ('hot', 'ice')),
  
  -- Roaster Notes
  roaster_notes TEXT,
  
  -- Match Score
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  
  -- No soft delete columns in actual implementation
);

-- Indexes
CREATE INDEX idx_tasting_records_user_id ON tasting_records(user_id);
CREATE INDEX idx_tasting_records_created_at ON tasting_records(created_at);
CREATE INDEX idx_tasting_records_realm_id ON tasting_records(realm_id);
```

### 2. flavor_notes Table

```sql
CREATE TABLE flavor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID REFERENCES tasting_records(id) ON DELETE CASCADE,
  
  -- 비정규화 구조 (현재 사용 중)
  level1 TEXT,     -- e.g., 'Fruity'
  level2 TEXT,     -- e.g., 'Berry'
  level3 TEXT,     -- e.g., 'Blackberry'
  level4 TEXT,     -- e.g., 'Fresh'
  
  -- 참고: Realm은 정규화 구조 (level, value)로 저장
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flavor_notes_tasting_id ON flavor_notes(tasting_id);
```

### 3. sensory_attributes Table

```sql
CREATE TABLE sensory_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID UNIQUE REFERENCES tasting_records(id) ON DELETE CASCADE,
  
  body INTEGER NOT NULL CHECK (body >= 1 AND body <= 5),
  acidity INTEGER NOT NULL CHECK (acidity >= 1 AND acidity <= 5),
  sweetness INTEGER NOT NULL CHECK (sweetness >= 1 AND sweetness <= 5),
  finish INTEGER NOT NULL CHECK (finish >= 1 AND finish <= 5),
  mouthfeel TEXT NOT NULL CHECK (mouthfeel IN ('Clean', 'Creamy', 'Juicy', 'Silky')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sensory_attributes_tasting_id ON sensory_attributes(tasting_id);
```

### 4. sync_log Table

```sql
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  
  sync_type TEXT CHECK (sync_type IN ('upload', 'download', 'conflict')),
  entity_type TEXT CHECK (entity_type IN ('tasting', 'user_preferences')),
  entity_id TEXT,
  
  status TEXT CHECK (status IN ('success', 'failed', 'conflict_resolved')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX idx_sync_log_created_at ON sync_log(created_at);
```

## Data Sync Strategy

### 1. Sync Triggers

- **Immediate Sync**: When online and user completes a tasting
- **Background Sync**: Every 5 minutes when app is active
- **Manual Sync**: Pull-to-refresh on home screen
- **App Launch**: Check for pending syncs

### 2. Sync Process

```typescript
interface SyncProcess {
  // 1. Check connectivity
  checkNetworkStatus(): boolean;
  
  // 2. Upload local changes
  uploadPendingTastings(): Promise<void>;
  
  // 3. Download remote changes
  downloadRemoteTastings(): Promise<void>;
  
  // 4. Resolve conflicts
  resolveConflicts(): Promise<void>;
  
  // 5. Update sync status
  updateSyncTimestamps(): Promise<void>;
}
```

### 3. Conflict Resolution

**Strategy**: Last-Write-Wins with Full Record Preservation

```typescript
interface ConflictResolution {
  // Compare timestamps
  localRecord: TastingRecord;
  remoteRecord: SupabaseTasting;
  
  resolution: {
    // If local is newer: upload local
    // If remote is newer: download remote
    // If equal: prefer remote (server authority)
    winner: 'local' | 'remote';
    
    // Archive losing version
    archived: TastingRecord;
  };
}
```

### 4. Offline Queue

```typescript
interface OfflineQueue {
  pendingUploads: TastingRecord[];
  failedUploads: {
    record: TastingRecord;
    error: Error;
    retryCount: number;
    nextRetry: Date;
  }[];
}
```

## Migration Strategy

### Phase 1: Local Only (Current)
- Store in Zustand (session)
- No persistence

### Phase 2: Realm Integration ✅ Implemented
- Add Realm for local persistence
- Offline-first functionality
- Local autocomplete and suggestions

### Phase 3: Supabase Integration ✅ Partially Implemented
- 읽기 전용 비교 데이터 조회 
- 기본 데이터 저장 (제한적)
- 동기화 기능 비활성화 상태

### Phase 4: Advanced Features
- Real-time collaboration
- Social features (share tastings)
- Export functionality

## Performance Considerations

### Realm Optimizations
- Use embedded objects for FlavorNote and SensoryAttribute
- Index frequently queried fields
- Lazy load relationships
- Batch write operations

### Supabase Optimizations
- Use connection pooling
- Implement request batching
- Cache frequently accessed data
- Use Supabase Realtime selectively

## Security Considerations

### Local Storage
- Encrypt Realm database
- Use iOS Keychain / Android Keystore for sensitive data
- Clear cache on logout

### Cloud Storage
- Row Level Security (RLS) policies
- User can only access their own records
- API rate limiting
- Secure file uploads for future photo features

## Backup Strategy

### Local Backups
- Auto-backup Realm to app documents
- Export to JSON capability
- iCloud/Google Drive integration

### Cloud Backups
- Supabase automatic backups
- Point-in-time recovery
- Export to CSV/JSON from admin panel