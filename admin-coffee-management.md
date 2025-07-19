# Coffee Catalog 관리자 가이드

## 1. 초기 데이터 입력 방법

### 방법 1: SQL 직접 실행 (추천)
1. Supabase Dashboard 로그인
2. SQL Editor 이동
3. `admin-coffee-data-seed.sql` 파일 내용 복사/붙여넣기
4. Run 실행

### 방법 2: CSV 파일 임포트
1. Supabase Dashboard > Table Editor
2. `coffee_catalog` 테이블 선택
3. Import 버튼 클릭
4. `coffee-catalog-sample.csv` 파일 업로드
5. 컬럼 매핑 확인 후 Import

### 방법 3: Supabase Table Editor에서 직접 입력
1. Table Editor > coffee_catalog
2. Insert row 버튼으로 한 줄씩 추가
3. 필수 필드:
   - roastery (로스터명)
   - coffee_name (커피명)
   - verified_by_moderator = true
   - first_added_by = 관리자 UUID

## 2. 주기적 업데이트 방법

### A. 간단한 관리 (Supabase Dashboard)
```sql
-- 새 커피 추가
INSERT INTO coffee_catalog (roastery, coffee_name, origin, variety, process, altitude, verified_by_moderator)
VALUES ('로스터명', '커피이름', '원산지', '품종', '가공방식', '고도', true);

-- 기존 커피 수정
UPDATE coffee_catalog 
SET origin = '새원산지', variety = '새품종'
WHERE roastery = '로스터명' AND coffee_name = '커피이름';

-- 커피 삭제 (soft delete 권장)
UPDATE coffee_catalog 
SET is_deleted = true
WHERE id = 'coffee-uuid';
```

### B. 대량 업데이트 (CSV)
1. 현재 데이터 Export
   ```sql
   -- Supabase SQL Editor에서 실행
   SELECT * FROM coffee_catalog 
   WHERE verified_by_moderator = true
   ORDER BY roastery, coffee_name;
   ```
2. CSV로 다운로드
3. Excel/Google Sheets에서 편집
4. 다시 Import

### C. API를 통한 프로그래매틱 업데이트
```javascript
// Node.js 스크립트 예시
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('YOUR_PROJECT_URL', 'YOUR_SERVICE_KEY');

// 커피 목록 배치 업데이트
async function batchUpdateCoffees(coffees) {
  for (const coffee of coffees) {
    const { error } = await supabase
      .from('coffee_catalog')
      .upsert({
        ...coffee,
        verified_by_moderator: true,
        updated_at: new Date()
      }, {
        onConflict: 'roastery,coffee_name'
      });
    
    if (error) console.error('Error:', error);
  }
}
```

## 3. 관리 팁

### 데이터 품질 관리
- **일관성**: 로스터명은 항상 동일하게 (예: "Fritz Coffee Company" vs "Fritz")
- **표준화**: 가공방식은 표준 용어 사용 (Washed, Natural, Honey, Anaerobic)
- **완성도**: 가능한 모든 필드 채우기 (origin, variety, altitude 등)

### 검수 프로세스
```sql
-- 미검수 커피 확인
SELECT * FROM coffee_catalog 
WHERE verified_by_moderator = false
ORDER BY created_at DESC;

-- 검수 승인
UPDATE coffee_catalog 
SET verified_by_moderator = true
WHERE id IN ('uuid1', 'uuid2', ...);
```

### 통계 모니터링
```sql
-- 로스터별 커피 수
SELECT roastery, COUNT(*) as count 
FROM coffee_catalog 
WHERE verified_by_moderator = true 
GROUP BY roastery;

-- 최근 추가된 커피
SELECT * FROM coffee_catalog 
ORDER BY created_at DESC 
LIMIT 20;

-- 사용자 기여 통계
SELECT u.email, COUNT(*) as contributions
FROM coffee_catalog c
JOIN auth.users u ON c.first_added_by = u.id
WHERE c.verified_by_moderator = false
GROUP BY u.email;
```

## 4. 자동화 옵션 (고급)

### GitHub Actions를 통한 자동 업데이트
1. 커피 데이터를 GitHub 저장소에 CSV/JSON으로 관리
2. Push 시 자동으로 Supabase 업데이트
3. 버전 관리 및 롤백 가능

### Google Sheets 연동
1. Google Sheets에서 커피 목록 관리
2. Apps Script로 Supabase API 호출
3. 주기적 동기화 설정

필요하시면 특정 방법에 대해 더 자세히 설명드릴 수 있습니다!