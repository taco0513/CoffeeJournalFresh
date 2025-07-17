# 데이터 수집 시스템 가이드

## 📋 개요

이 시스템은 **개발자/운영자가 사용자의 로컬 Realm 데이터를 Supabase로 수집**하기 위한 도구입니다. 사용자에게는 보이지 않는 백그라운드 시스템으로 작동합니다.

## 🏗️ 시스템 구조

### 1. 데이터 흐름
```
사용자 앱 (로컬 Realm) → DataCollectionService → Supabase Database
```

### 2. 주요 컴포넌트

- **DataCollectionService**: 메인 데이터 수집 서비스
- **DevUtils**: 개발자 콘솔 도구
- **Supabase 테이블**: 수집된 데이터 저장소

## 🚀 사용 방법

### 1. 개발 환경 설정

```bash
# 앱 실행 (개발 모드)
npm start
npx react-native run-ios
```

### 2. 개발자 콘솔에서 데이터 수집

앱이 실행되면 개발자 콘솔에서 다음 명령어 사용:

```javascript
// 도움말 보기
DevUtils.help()

// 모든 사용자 데이터 수집
DevUtils.collectUserData()

// 특정 사용자 데이터 수집
DevUtils.collectUserData('user_123')

// 기간별 데이터 수집
DevUtils.collectDataByDate('2024-01-01', '2024-01-31')

// 데이터 수집 상태 확인
DevUtils.checkCollectionStatus()

// 테스트 데이터 생성
DevUtils.generateTestData(10)
```

### 3. Supabase 테이블 생성

```sql
-- 제공된 스키마 파일 실행
psql -f supabase-collection-schema.sql
```

## 📊 Supabase 테이블 구조

### 메인 테이블: `collected_tastings`

```sql
CREATE TABLE collected_tastings (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  
  -- 커피 정보
  coffee_name TEXT NOT NULL,
  roastery TEXT NOT NULL,
  cafe_name TEXT,
  origin TEXT,
  variety TEXT,
  process TEXT,
  roaster_notes TEXT,
  
  -- 테이스팅 정보
  temperature TEXT,
  match_score_total INTEGER,
  
  -- 감각 평가
  sensory_body INTEGER,
  sensory_acidity INTEGER,
  sensory_sweetness INTEGER,
  sensory_finish INTEGER,
  
  -- 플레이버 노트 (JSON)
  flavor_notes JSONB,
  
  -- 메타데이터
  is_deleted BOOLEAN DEFAULT FALSE,
  device_info JSONB,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 통계 뷰들

- `collection_stats`: 일별 수집 통계
- `roastery_stats`: 로스터리별 통계
- `origin_stats`: 원산지별 통계
- `flavor_analysis`: 플레이버 노트 분석

## 🔧 API 참조

### DataCollectionService

```typescript
// 인스턴스 생성
const service = DataCollectionService.getInstance();

// 전체 데이터 수집
const result = await service.collectUserData(userId?);

// 기간별 데이터 수집
const result = await service.collectDataByDateRange(startDate, endDate, userId?);

// 수집 상태 확인
const status = await service.getCollectionStatus();

// 테스트 데이터 생성
const result = await service.generateTestData(count);
```

### 응답 형태

```typescript
interface CollectionResult {
  success: boolean;
  message: string;
  totalRecords?: number;
  uploadedRecords?: number;
}

interface CollectionStatus {
  localRecords: number;
  lastCollectionDate?: string;
  pendingRecords: number;
}
```

## 📈 데이터 분석 쿼리 예시

```sql
-- 전체 통계 조회
SELECT * FROM get_collection_summary();

-- 일별 수집 현황
SELECT * FROM collection_stats LIMIT 10;

-- 인기 로스터리 Top 10
SELECT * FROM roastery_stats LIMIT 10;

-- 원산지별 통계
SELECT * FROM origin_stats LIMIT 10;

-- 인기 플레이버 노트
SELECT * FROM flavor_analysis WHERE flavor_level = '1' LIMIT 10;

-- 특정 기간 데이터
SELECT COUNT(*) FROM collected_tastings 
WHERE collected_at >= '2024-01-01' 
AND collected_at < '2024-02-01';
```

## 🛡️ 보안 고려사항

### 1. 사용자 데이터 보호
- 개인 식별 정보 최소화
- 익명화된 사용자 ID 사용
- 데이터 수집 전 사용자 동의 필요

### 2. 접근 제어
- 개발 환경에서만 수집 도구 활성화
- Supabase RLS(Row Level Security) 활용
- 관리자 권한 분리

### 3. 데이터 무결성
- 중복 데이터 방지 (upsert 사용)
- 데이터 검증 로직 포함
- 수집 실패 시 재시도 메커니즘

## 🚨 주의사항

### 1. 개발 전용 도구
- `__DEV__` 환경에서만 작동
- 프로덕션 빌드에서는 자동으로 비활성화
- 사용자에게 노출되지 않음

### 2. 네트워크 요구사항
- 안정적인 인터넷 연결 필요
- Supabase 연결 상태 확인
- 배치 처리로 네트워크 부하 최소화

### 3. 데이터 용량
- 대용량 데이터 수집 시 시간 소요
- 진행 상황 로그 확인
- 필요시 기간별 분할 수집

## 🔄 업데이트 가이드

### 1. 스키마 변경 시
```sql
-- 새 컬럼 추가
ALTER TABLE collected_tastings ADD COLUMN new_field TEXT;

-- 인덱스 추가
CREATE INDEX idx_new_field ON collected_tastings(new_field);
```

### 2. 데이터 수집 로직 변경
- `DataCollectionService.ts` 수정
- 버전 관리 (collection_version 필드)
- 하위 호환성 유지

### 3. 새로운 통계 뷰 추가
```sql
CREATE OR REPLACE VIEW new_stats AS
SELECT ...
FROM collected_tastings
GROUP BY ...;
```

## 📞 문의사항

데이터 수집 시스템 관련 문의사항이 있으시면:

1. 개발팀 슬랙 채널
2. 이슈 트래커 등록
3. 코드 리뷰 요청

---

**⚠️ 중요**: 이 도구는 개발/운영 목적으로만 사용하며, 사용자 데이터 보호 및 관련 법규를 준수해야 합니다.