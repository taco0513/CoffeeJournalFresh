# ⚙️ 데이터베이스 설계

## Production-Ready 데이터베이스 설계

확장 가능하고 성능 최적화된 데이터베이스 스키마 설계입니다.

## 핵심 사용자 테이블

```sql
-- 사용자 도메인
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    
    -- 프로필 정보
    profile JSONB NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    
    -- 게이미피케이션
    level INTEGER NOT NULL DEFAULT 1,
    experience_points INTEGER NOT NULL DEFAULT 0,
    badges JSONB NOT NULL DEFAULT '[]',
    
    -- 구독 정보 (확장)
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    subscription_type VARCHAR(20), -- 'monthly_pick', 'my_choice', 'blind_box'
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    lab_pro_active BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Taste DNA (별도 테이블로 분리 고려)
    taste_dna JSONB NOT NULL DEFAULT '{}',
    taste_dna_version INTEGER NOT NULL DEFAULT 1,
    taste_dna_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- 인덱스
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_subscription (subscription_tier, subscription_expires_at)
);
```

## 구독 관리 테이블

```sql
-- 원두 구독 테이블 (신규 추가)
CREATE TABLE coffee_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- 구독 타입
    type VARCHAR(20) NOT NULL CHECK (type IN ('monthly_pick', 'my_choice', 'blind_box')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    
    -- 구독 상세
    price_per_month DECIMAL(10,2) NOT NULL,
    includes_lab_pro BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- 배송 정보
    shipping_address JSONB NOT NULL,
    preferred_delivery_day INTEGER CHECK (preferred_delivery_day BETWEEN 1 AND 28),
    
    -- 구독 기간
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    next_billing_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paused_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_sub_user (user_id),
    INDEX idx_sub_status (status),
    INDEX idx_sub_billing (next_billing_at)
);

-- 구독 주문 테이블
CREATE TABLE subscription_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES coffee_subscriptions(id),
    
    -- 주문 정보
    order_month DATE NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- 상태
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    -- 구성
    coffee_items JSONB NOT NULL, -- [{coffee_id, quantity, unit: '60g'}]
    total_price DECIMAL(10,2) NOT NULL,
    
    -- 배송
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR(100),
    
    -- QR 코드
    qr_codes JSONB, -- [{coffee_id, qr_code, created_at}]
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_order_sub (subscription_id),
    INDEX idx_order_month (order_month),
    INDEX idx_order_status (status)
);

-- 원두 재고 관리 테이블
CREATE TABLE coffee_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id UUID NOT NULL REFERENCES coffees(id),
    roaster_id UUID NOT NULL,
    
    -- 재고 정보
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('60g', '100g')),
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0, -- 주문 확정되었으나 미출고
    
    -- 재고 한계
    min_stock_alert INTEGER NOT NULL DEFAULT 10,
    max_stock INTEGER NOT NULL DEFAULT 100,
    
    -- 가격
    unit_price DECIMAL(10,2) NOT NULL,
    
    -- 상태
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    out_of_stock_at TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 인덱스
    UNIQUE KEY uk_coffee_unit (coffee_id, unit),
    INDEX idx_inventory_available (is_available, current_stock)
);

-- 구독 피드백 테이블
CREATE TABLE subscription_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID NOT NULL REFERENCES subscription_orders(id),
    coffee_id UUID NOT NULL REFERENCES coffees(id),
    
    -- 평가
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    would_buy_again BOOLEAN,
    
    -- Lab 모드 연동
    lab_record_id UUID REFERENCES taste_records(id),
    taste_match_score DECIMAL(5,2),
    
    -- 블라인드 박스 전용
    blind_guess_coffee_id UUID,
    blind_guess_correct BOOLEAN,
    
    -- 피드백
    feedback_text TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_feedback_user (user_id),
    INDEX idx_feedback_coffee (coffee_id)
);
```

## 맛 기록 테이블 (파티셔닝 최적화)

```sql
-- 맛 기록 (파티셔닝 적용) - 구독 연동 추가
CREATE TABLE taste_records (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    coffee_id UUID NOT NULL,
    
    -- 모드 구분
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('cafe', 'lab')),
    
    -- 구독 연동 (신규 추가)
    subscription_order_id UUID REFERENCES subscription_orders(id),
    is_subscription_coffee BOOLEAN NOT NULL DEFAULT FALSE,
    qr_scanned BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- 맛 데이터
    taste_layers JSONB NOT NULL,
    taste_vector vector(128),  -- pgvector extension
    taste_confidence DECIMAL(3,2),
    
    -- 추출 데이터
    extraction_method VARCHAR(50),
    extraction_params JSONB,
    extraction_metrics JSONB,  -- TDS, yield, etc.
    
    -- 컨텍스트 데이터
    location GEOGRAPHY(POINT, 4326),
    weather_conditions JSONB,
    time_of_day TIME,
    mood VARCHAR(50),
    
    -- 실험 데이터
    blind_mode BOOLEAN NOT NULL DEFAULT FALSE,
    reference_profile_id UUID,
    
    -- 미디어
    images JSONB,  -- S3 URLs
    notes TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 파티셔닝 키
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 월별 파티션 자동 생성 함수
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I 
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
    
    -- 파티션별 인덱스 생성
    EXECUTE format('CREATE INDEX %I ON %I (user_id, created_at DESC)',
                   'idx_' || partition_name || '_user_created', partition_name);
    EXECUTE format('CREATE INDEX %I ON %I USING ivfflat (taste_vector vector_cosine_ops)',
                   'idx_' || partition_name || '_vector', partition_name);
END;
$$ LANGUAGE plpgsql;

-- 자동 파티션 생성 트리거
CREATE OR REPLACE FUNCTION auto_create_partition()
RETURNS trigger AS $$
BEGIN
    PERFORM create_monthly_partition('taste_records', date_trunc('month', NEW.created_at)::date);
    RETURN NEW;
EXCEPTION
    WHEN duplicate_table THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_partition_trigger
    BEFORE INSERT ON taste_records
    FOR EACH ROW EXECUTE FUNCTION auto_create_partition();

-- 기본 인덱스들
CREATE INDEX idx_records_user_created ON taste_records (user_id, created_at DESC);
CREATE INDEX idx_records_vector ON taste_records USING ivfflat (taste_vector vector_cosine_ops);
CREATE INDEX idx_records_coffee ON taste_records (coffee_id, created_at DESC);
CREATE INDEX idx_records_subscription ON taste_records (subscription_order_id) WHERE subscription_order_id IS NOT NULL;
```

## AI 분석 및 통계 테이블

```sql
-- AI 분석 결과
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL,
    
    -- 분석 타입 및 버전
    analysis_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    
    -- 분석 결과
    match_score DECIMAL(5,2),
    score_breakdown JSONB NOT NULL,
    confidence_scores JSONB NOT NULL,
    
    -- 인사이트 및 추천
    insights JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    growth_areas JSONB,
    
    -- 구독 관련 인사이트 (신규 추가)
    subscription_insights JSONB,
    
    -- 설명 가능성
    explanation JSONB,
    feature_importance JSONB,
    
    -- 메타데이터
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_analyses_record (record_id, created_at DESC),
    INDEX idx_analyses_type (analysis_type, model_version)
);

-- 사용자 성장 메트릭 (시계열 최적화)
CREATE TABLE user_growth_metrics (
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    
    -- 일별 활동 메트릭
    records_created INTEGER NOT NULL DEFAULT 0,
    unique_coffees INTEGER NOT NULL DEFAULT 0,
    subscription_coffees_tried INTEGER NOT NULL DEFAULT 0, -- 신규 추가
    
    -- 정확도 메트릭
    taste_accuracy DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    blind_test_results JSONB,
    blind_box_accuracy DECIMAL(5,2), -- 신규 추가
    
    -- 성장 지표
    new_flavors_detected INTEGER NOT NULL DEFAULT 0,
    complexity_level INTEGER NOT NULL DEFAULT 1,
    expertise_score DECIMAL(5,2),
    
    -- 누적 통계
    total_records INTEGER NOT NULL,
    total_unique_coffees INTEGER NOT NULL,
    total_subscription_months INTEGER NOT NULL DEFAULT 0, -- 신규 추가
    
    PRIMARY KEY (user_id, date)
) PARTITION BY RANGE (date);

-- 월별 파티션 생성 (성장 메트릭용)
CREATE TABLE user_growth_metrics_2024_01 PARTITION OF user_growth_metrics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE user_growth_metrics_2024_02 PARTITION OF user_growth_metrics
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... 추가 파티션들

-- 성장 메트릭 인덱스
CREATE INDEX idx_growth_user_date ON user_growth_metrics (user_id, date DESC);
CREATE INDEX idx_growth_date ON user_growth_metrics (date);
```

## 커피 마스터 데이터

```sql
-- 커피 정보 (마스터 데이터)
CREATE TABLE coffees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 기본 정보
    name VARCHAR(255) NOT NULL,
    roaster_id UUID NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    origin_region VARCHAR(100),
    origin_farm VARCHAR(100),
    
    -- 상세 정보
    variety VARCHAR(100),
    processing_method VARCHAR(50),
    altitude_min INTEGER,
    altitude_max INTEGER,
    harvest_date DATE,
    roast_date DATE,
    
    -- 로스터 프로필
    roaster_notes JSONB,
    roast_level VARCHAR(20),
    flavor_profile JSONB,
    
    -- 구독 관련 (신규 추가)
    available_for_subscription BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_units JSONB DEFAULT '["60g", "100g"]',
    subscription_price_60g DECIMAL(10,2),
    subscription_price_100g DECIMAL(10,2),
    
    -- 검색 최적화
    search_vector tsvector,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_coffees_roaster (roaster_id),
    INDEX idx_coffees_origin (origin_country, origin_region),
    INDEX idx_coffees_search GIN (search_vector),
    INDEX idx_coffees_subscription (available_for_subscription)
);

-- 로스터 정보
CREATE TABLE roasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location JSONB,
    contact_info JSONB,
    
    -- 구독 파트너십 정보
    subscription_partner BOOLEAN NOT NULL DEFAULT FALSE,
    partnership_tier VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum'
    monthly_quota INTEGER, -- 월간 공급 가능량
    
    -- 품질 메트릭
    average_rating DECIMAL(3,2),
    total_reviews INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## 트리거 및 저장 프로시저

```sql
-- 트리거 함수: 검색 벡터 자동 업데이트
CREATE OR REPLACE FUNCTION update_coffee_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', NEW.name), 'A') ||
        setweight(to_tsvector('english', NEW.origin_country), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.origin_region, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.variety, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coffee_search_vector_trigger
BEFORE INSERT OR UPDATE ON coffees
FOR EACH ROW EXECUTE FUNCTION update_coffee_search_vector();

-- 구독 재고 동기화 트리거
CREATE OR REPLACE FUNCTION sync_subscription_inventory()
RETURNS trigger AS $$
BEGIN
    -- 재고가 min_stock_alert 이하로 떨어지면 알림 생성
    IF NEW.current_stock <= NEW.min_stock_alert AND OLD.current_stock > NEW.min_stock_alert THEN
        INSERT INTO notifications (user_id, type, content, metadata)
        SELECT 
            cs.user_id,
            'stock_alert',
            format('"%s" 재고가 얼마 남지 않았습니다!', c.name),
            jsonb_build_object(
                'coffee_id', NEW.coffee_id,
                'current_stock', NEW.current_stock,
                'unit', NEW.unit
            )
        FROM coffee_subscriptions cs
        JOIN subscription_orders so ON cs.id = so.subscription_id
        JOIN coffees c ON c.id = NEW.coffee_id
        WHERE cs.status = 'active'
        AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(so.coffee_items) AS item
            WHERE item->>'coffee_id' = NEW.coffee_id::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_subscription_inventory_trigger
AFTER UPDATE ON coffee_inventory
FOR EACH ROW EXECUTE FUNCTION sync_subscription_inventory();

-- Taste DNA 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_taste_dna()
RETURNS trigger AS $$
DECLARE
    user_record RECORD;
    taste_evolution JSONB;
BEGIN
    -- 새로운 맛 기록이 생성될 때마다 Taste DNA 업데이트
    IF TG_OP = 'INSERT' THEN
        -- 사용자의 최근 100개 기록 분석
        SELECT 
            user_id,
            COUNT(*) as total_records,
            AVG((taste_layers->>'acidity')::NUMERIC) as avg_acidity,
            AVG((taste_layers->>'sweetness')::NUMERIC) as avg_sweetness,
            AVG((taste_layers->>'body')::NUMERIC) as avg_body
        INTO user_record
        FROM taste_records 
        WHERE user_id = NEW.user_id 
        AND created_at >= NOW() - INTERVAL '3 months'
        GROUP BY user_id;
        
        -- 진화된 Taste DNA 계산
        taste_evolution := jsonb_build_object(
            'acidity_preference', user_record.avg_acidity,
            'sweetness_preference', user_record.avg_sweetness,
            'body_preference', user_record.avg_body,
            'total_records', user_record.total_records,
            'last_updated', NOW()
        );
        
        -- Users 테이블의 Taste DNA 업데이트
        UPDATE users 
        SET 
            taste_dna = taste_evolution,
            taste_dna_version = taste_dna_version + 1,
            taste_dna_updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_taste_dna_trigger
AFTER INSERT ON taste_records
FOR EACH ROW EXECUTE FUNCTION update_taste_dna();

-- 구독 결제 자동화 함수
CREATE OR REPLACE FUNCTION process_monthly_billing()
RETURNS void AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- 결제일이 된 활성 구독들 처리
    FOR subscription_record IN 
        SELECT * FROM coffee_subscriptions 
        WHERE status = 'active' 
        AND next_billing_at <= NOW()
        AND next_billing_at >= NOW() - INTERVAL '1 day'
    LOOP
        -- 결제 처리 (외부 서비스 호출)
        INSERT INTO billing_jobs (subscription_id, amount, due_date)
        VALUES (
            subscription_record.id, 
            subscription_record.price_per_month, 
            subscription_record.next_billing_at
        );
        
        -- 다음 결제일 설정
        UPDATE coffee_subscriptions 
        SET next_billing_at = next_billing_at + INTERVAL '1 month'
        WHERE id = subscription_record.id;
        
        -- 월간 주문 생성 트리거
        INSERT INTO monthly_order_jobs (subscription_id, target_month)
        VALUES (subscription_record.id, DATE_TRUNC('month', NOW() + INTERVAL '1 month'));
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 월간 통계 집계 함수
CREATE OR REPLACE FUNCTION aggregate_monthly_stats()
RETURNS void AS $$
BEGIN
    -- 사용자별 월간 성장 메트릭 계산
    INSERT INTO user_growth_metrics (user_id, date, records_created, unique_coffees, subscription_coffees_tried)
    SELECT 
        user_id,
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*) as records_created,
        COUNT(DISTINCT coffee_id) as unique_coffees,
        COUNT(*) FILTER (WHERE is_subscription_coffee = true) as subscription_coffees_tried
    FROM taste_records 
    WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    AND created_at < DATE_TRUNC('month', NOW())
    GROUP BY user_id, DATE_TRUNC('month', created_at)
    ON CONFLICT (user_id, date) DO UPDATE SET
        records_created = EXCLUDED.records_created,
        unique_coffees = EXCLUDED.unique_coffees,
        subscription_coffees_tried = EXCLUDED.subscription_coffees_tried;
        
    -- 구독 만족도 통계 업데이트
    UPDATE coffee_subscriptions cs
    SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'monthly_satisfaction', (
            SELECT AVG(overall_rating)
            FROM subscription_feedback sf
            JOIN subscription_orders so ON sf.order_id = so.id
            WHERE so.subscription_id = cs.id
            AND sf.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
        )
    )
    WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;
```

## 성능 최적화

```sql
-- 커넥션 풀 설정
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';

-- 자동 VACUUM 설정
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 4;
ALTER SYSTEM SET autovacuum_naptime = '30s';

-- 특별한 테이블들의 VACUUM 설정
ALTER TABLE taste_records SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

-- 핫 데이터를 위한 메모리 테이블
CREATE UNLOGGED TABLE active_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_data JSONB
);

-- 읽기 전용 복제본을 위한 뷰
CREATE VIEW taste_records_readonly AS
SELECT * FROM taste_records
WHERE created_at >= NOW() - INTERVAL '1 year';
```

## 주요 특징

### 1. **확장성**
- 파티셔닝을 통한 수평적 확장
- 인덱스 최적화로 쿼리 성능 향상
- 읽기 복제본 지원

### 2. **구독 서비스 통합**
- 완전한 구독 라이프사이클 관리
- 실시간 재고 추적
- QR 코드 기반 연동

### 3. **성능 최적화**
- TimescaleDB 시계열 최적화
- pgvector를 활용한 벡터 검색
- 자동 파티션 관리

### 4. **데이터 무결성**
- 트리거 기반 자동 업데이트
- 제약 조건을 통한 데이터 품질 보장
- 트랜잭션 안전성

### 5. **분석 친화적**
- JSONB를 활용한 유연한 스키마
- 시계열 데이터 최적화
- 실시간 통계 집계