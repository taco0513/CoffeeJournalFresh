# 🗄️ Coffee Tasting App - 데이터베이스 스키마

## 📊 데이터베이스 구조 개요

### 사용하는 DB
- **Realm**: 로컬 저장소 (오프라인 우선)
- **Supabase**: 클라우드 동기화 (PostgreSQL 기반)

> 기술 스택 상세는 [TECH-STACK.md](TECH-STACK.md) 참조

---

## 📋 테이블 구조

### 1. **TastingRecord** (테이스팅 기록)
메인 테이블 - 한 번의 커피 테이스팅 기록

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| created_at | DateTime | 생성 시간 | ✅ | 현재시간 |
| updated_at | DateTime | 수정 시간 | ✅ | 현재시간 |
| cafe_name | String | 카페 이름 | ❌ | null |
| roaster_name | String | 로스터리 이름 | ✅ | - |
| coffee_name | String | 커피 이름 | ✅ | - |
| origin | String | 생산지 (국가/지역) | ❌ | null |
| variety | String | 품종 | ❌ | null |
| altitude | String | 재배 고도 | ❌ | null |
| process | String | 가공 방식 | ❌ | null |
| temperature | String | 'hot' 또는 'ice' | ✅ | 'hot' |
| roaster_notes | String | 로스터가 제공한 컵노트 | ❌ | null |
| match_score | Integer | 매칭 점수 (0-100) | ❌ | null |
| is_synced | Boolean | 클라우드 동기화 여부 | ✅ | false |
| user_id | String | 사용자 ID | ✅ | - |

---

### 2. **FlavorNote** (맛 노트)
선택한 맛 정보 저장 - 멀티 선택 지원 (여러 레코드)

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| tasting_id | UUID | TastingRecord 참조 | ✅ | - |
| level1 | String | 1단계 Category (예: Fruity) | ✅ | - |
| level2 | String | 2단계 Subcategory (예: Berry) | ❌ | null |
| level3 | String | 3단계 Specific (예: Blackberry) | ❌ | null |
| raw_note | String | 사용자 원본 입력 (AI 매핑 전) | ❌ | null |
| order_index | Integer | 표시 순서 | ✅ | 0 |

**예시**: 한 테이스팅에서 "Fruity > Berry > Blueberry"와 "Sweet > Chocolate" 선택 시
- FlavorNote 레코드 1: {level1: "Fruity", level2: "Berry", level3: "Blueberry", order_index: 0}
- FlavorNote 레코드 2: {level1: "Sweet", level2: "Chocolate", level3: null, order_index: 1}

**Note**: `raw_note` 필드는 Phase 2의 AI 매핑 기능을 위해 예약됨

---

### 3. **SensoryAttribute** (감각 특성)
바디감, 산미 등 평가 정보

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| tasting_id | UUID | TastingRecord 참조 | ✅ | - |
| body | Integer | 바디감 (1-5) | ✅ | 3 |
| acidity | Integer | 산미 (1-5) | ✅ | 3 |
| sweetness | Integer | 단맛 (1-5) | ✅ | 3 |
| finish | Integer | 여운 (1-5) | ✅ | 3 |
| mouthfeel | String | Clean/Creamy/Juicy/Silky | ✅ | 'Clean' |

---

### 4. **RoasterInfo** (로스터리 정보)
자주 가는 카페/로스터리 정보 캐싱

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| name | String | 로스터리 이름 | ✅ | - |
| location | String | 위치 | ❌ | null |
| visit_count | Integer | 사용 횟수 | ✅ | 1 |
| last_used | DateTime | 마지막 사용 | ✅ | 현재시간 |
| user_id | String | 사용자 ID | ✅ | - |

---

### 5. **CafeInfo** (카페 정보)
방문한 카페 정보 저장

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| name | String | 카페 이름 | ✅ | - |
| location | String | 위치 | ❌ | null |
| default_roaster_id | UUID | 주 거래 로스터리 | ❌ | null |
| visit_count | Integer | 방문 횟수 | ✅ | 1 |
| last_visited | DateTime | 마지막 방문 | ✅ | 현재시간 |
| user_id | String | 사용자 ID | ✅ | - |

---

### 6. **CafeRoasteryRelation** (카페-로스터리 관계)
카페에서 취급하는 로스터리 매핑

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| cafe_id | UUID | CafeInfo 참조 | ✅ | - |
| roaster_id | UUID | RoasterInfo 참조 | ✅ | - |
| is_primary | Boolean | 주 거래처 여부 | ✅ | false |
| user_id | String | 사용자 ID | ✅ | - |

---

### 7. **CoffeeLibrary** (커피 라이브러리)
자주 마시는 커피 정보 저장

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| roaster_id | UUID | RoasterInfo 참조 | ✅ | - |
| coffee_name | String | 커피 이름 | ✅ | - |
| origin | String | 생산지 | ❌ | null |
| variety | String | 품종 | ❌ | null |
| altitude | String | 고도 | ❌ | null |
| process | String | 가공방식 | ❌ | null |
| use_count | Integer | 선택 횟수 | ✅ | 1 |
| last_used | DateTime | 마지막 선택 | ✅ | 현재시간 |
| user_id | String | 사용자 ID | ✅ | - |

---

### 8. **FlavorWheel** (맛 선택지)
SCA 플레이버 휠 마스터 데이터

| 필드명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | UUID | 고유 식별자 | ✅ | 자동생성 |
| level | Integer | 단계 (1-3) | ✅ | - |
| parent_id | UUID | 상위 항목 ID | ❌ | null |
| name_en | String | 영문명 | ✅ | - |
| name_ko | String | 한글명 | ✅ | - |
| hex_color | String | 표시 색상 | ❌ | '#000000' |
| order_index | Integer | 표시 순서 | ✅ | 0 |

---

## 🔗 테이블 관계

```
TastingRecord (1)
    ├── FlavorNote (1..n)
    └── SensoryAttribute (1)

CafeInfo (n) ← → RoasterInfo (n) 
    [via CafeRoasteryRelation]

RoasterInfo (1) → CoffeeLibrary (n)

필터링 방향:
- 카페 → 로스터리 (O): 카페 선택 시 해당 카페의 로스터리만 표시
- 로스터리 → 커피 정보 (O): 로스터리 선택 시 해당 커피들 자동완성
- 로스터리 → 카페 (X): 로스터리 선택이 카페를 제한하지 않음

자동완성 우선순위:
1. 최근 사용 (last_used 기준)
2. 자주 사용 (use_count 기준)
3. 전체 목록 (알파벳순)

FlavorWheel (부모) ← → FlavorWheel (자식들)
```

---

## 💾 Realm 스키마 (React Native)

```javascript
// TastingRecord 스키마
const TastingRecordSchema = {
  name: 'TastingRecord',
  primaryKey: 'id',
  properties: {
    id: 'string',
    created_at: 'date',
    updated_at: 'date',
    cafe_name: 'string?',
    roaster_name: 'string',
    coffee_name: 'string',
    origin: 'string?',
    variety: 'string?',
    altitude: 'string?',
    process: 'string?',
    temperature: 'string',
    roaster_notes: 'string?',
    match_score: 'int?',
    is_synced: { type: 'bool', default: false },
    user_id: 'string',
    // 관계
    flavor_notes: 'FlavorNote[]',
    sensory_attributes: 'SensoryAttribute'
  }
};

// CoffeeLibrary 스키마
const CoffeeLibrarySchema = {
  name: 'CoffeeLibrary',
  primaryKey: 'id',
  properties: {
    id: 'string',
    roaster_id: 'string',
    coffee_name: 'string',
    origin: 'string?',
    variety: 'string?',
    altitude: 'string?',
    process: 'string?',
    use_count: { type: 'int', default: 1 },
    last_used: 'date',
    user_id: 'string'
  }
};

// FlavorNote 스키마 (멀티선택 지원)
const FlavorNoteSchema = {
  name: 'FlavorNote',
  primaryKey: 'id',
  properties: {
    id: 'string',
    tasting_id: 'string',
    level1: 'string',         // Category (필수)
    level2: 'string?',        // Subcategory (선택)
    level3: 'string?',        // Specific (선택)
    raw_note: 'string?',      // AI 매핑 전 원본 (Phase 2)
    order_index: { type: 'int', default: 0 }
  }
};

// 예시: 한 테이스팅에 여러 FlavorNote 레코드 생성
// - Fruity > Berry > Blueberry
// - Sweet > Chocolate
// - Roasted > Nutty
```

---

## 🌐 Supabase 테이블 생성 SQL

```sql
-- 1. TastingRecord 테이블
CREATE TABLE tasting_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cafe_name VARCHAR(255),
  roaster_name VARCHAR(255) NOT NULL,
  coffee_name VARCHAR(255) NOT NULL,
  origin VARCHAR(255),
  variety VARCHAR(255),
  altitude VARCHAR(100),
  process VARCHAR(100),
  temperature VARCHAR(10) CHECK (temperature IN ('hot', 'ice')),
  roaster_notes TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  user_id VARCHAR(255) NOT NULL
);

-- 2. CafeInfo 테이블
CREATE TABLE cafe_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  default_roaster_id UUID,
  visit_count INTEGER DEFAULT 1,
  last_visited TIMESTAMPTZ DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  UNIQUE(name, user_id)
);

-- 3. RoasterInfo 테이블
CREATE TABLE roaster_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  visit_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  UNIQUE(name, user_id)
);

-- 4. CafeRoasteryRelation 테이블
CREATE TABLE cafe_roastery_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID REFERENCES cafe_info(id) ON DELETE CASCADE,
  roaster_id UUID REFERENCES roaster_info(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(255) NOT NULL,
  UNIQUE(cafe_id, roaster_id)
);

-- 5. CoffeeLibrary 테이블
CREATE TABLE coffee_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roaster_id UUID REFERENCES roaster_info(id) ON DELETE CASCADE,
  coffee_name VARCHAR(255) NOT NULL,
  origin VARCHAR(255),
  variety VARCHAR(255),
  altitude VARCHAR(100),
  process VARCHAR(100),
  use_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  UNIQUE(roaster_id, coffee_name, user_id)
);

-- 6. FlavorNote 테이블 (raw_note 추가)
CREATE TABLE flavor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID REFERENCES tasting_records(id) ON DELETE CASCADE,
  level1 VARCHAR(100) NOT NULL,
  level2 VARCHAR(100),
  level3 VARCHAR(100),
  raw_note TEXT,  -- AI 매핑 전 원본 입력 (Phase 2)
  order_index INTEGER DEFAULT 0
);

-- 7. SensoryAttribute 테이블
CREATE TABLE sensory_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID REFERENCES tasting_records(id) ON DELETE CASCADE,
  body INTEGER CHECK (body >= 1 AND body <= 5),
  acidity INTEGER CHECK (acidity >= 1 AND acidity <= 5),
  sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 5),
  finish INTEGER CHECK (finish >= 1 AND finish <= 5),
  mouthfeel VARCHAR(20) CHECK (mouthfeel IN ('Clean', 'Creamy', 'Juicy', 'Silky'))
);

-- 인덱스 생성
CREATE INDEX idx_tasting_user_id ON tasting_records(user_id);
CREATE INDEX idx_tasting_created_at ON tasting_records(created_at DESC);
CREATE INDEX idx_cafe_user_id ON cafe_info(user_id);
CREATE INDEX idx_roaster_user_id ON roaster_info(user_id);
CREATE INDEX idx_coffee_library_roaster ON coffee_library(roaster_id);
CREATE INDEX idx_flavor_tasting_id ON flavor_notes(tasting_id);
```

---

## 🔄 동기화 전략

### 1. **충돌 해결**
- 기준: `updated_at` 타임스탬프
- 최신 데이터가 항상 우선

### 2. **동기화 큐**
```javascript
// 동기화 대기 큐 스키마
const SyncQueueSchema = {
  name: 'SyncQueue',
  properties: {
    id: 'string',
    record_id: 'string',
    table_name: 'string',
    action: 'string', // 'create', 'update', 'delete'
    retry_count: { type: 'int', default: 0 },
    created_at: 'date'
  }
};
```

### 3. **오프라인 → 온라인 전환**
1. 네트워크 연결 감지
2. SyncQueue 확인
3. 순서대로 Supabase 전송
4. 성공 시 is_synced = true
5. 실패 시 retry_count 증가

---

## 📈 성능 최적화

### 1. **로컬 캐싱**
- FlavorWheel 데이터는 앱 설치 시 한 번만 다운로드
- RoasterInfo는 자동완성용으로 로컬 유지

### 2. **데이터 정리**
- 30일 이상 된 로컬 기록 자동 삭제
- 클라우드는 영구 보관

### 3. **쿼리 최적화**
- 최근 기록 10개만 홈 화면에 로드
- 나머지는 필요 시 추가 로드