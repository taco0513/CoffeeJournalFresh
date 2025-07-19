# ⚙️ 마이크로서비스 아키텍처

## 마이크로서비스 아키텍처 3.0

Production-ready 마이크로서비스 아키텍처 설계 및 기술 스택 정의입니다.

```yaml
services:
  # API Gateway & Load Balancing
  api-gateway:
    tech: Kong Gateway
    features:
      - rate_limiting: "1000 req/min per user"
      - authentication: "JWT + OAuth2"
      - circuit_breaker: "enabled"
      - request_routing: "path & header based"
    monitoring: Prometheus + Grafana
  
  # Core Services
  user-service:
    tech: Node.js + TypeScript
    framework: NestJS
    database: 
      primary: PostgreSQL 14
      cache: Redis 6.2
      search: Elasticsearch 8.0
    features:
      - user_management
      - authentication
      - subscription_handling
      - taste_dna_storage
  
  taste-record-service:
    tech: Go 1.19
    framework: Gin
    database:
      primary: PostgreSQL + TimescaleDB
      cache: Redis Cluster
      blob_storage: S3
    features:
      - high_throughput_writes: "10K TPS"
      - time_series_analysis
      - image_storage
      - data_aggregation
  
  # Subscription Service (신규 추가)
  subscription-service:
    tech: Node.js + TypeScript
    framework: NestJS
    database:
      primary: PostgreSQL 14
      inventory: Redis  # 실시간 재고 관리
      queue: RabbitMQ   # 주문 처리 큐
    features:
      - subscription_management
      - inventory_tracking:
          - "60g/100g 소량 단위 재고 관리"
          - "실시간 재고 동기화"
          - "품절 임박 알림"
      - qr_code_generation:
          - "원두별 고유 QR 생성"
          - "Lab 모드 자동 연동"
      - monthly_curation:
          - "이달의 추천 자동 선정"
          - "개인화 추천 알고리즘"
      - order_processing:
          - "구독 주문 자동화"
          - "배송 추적 연동"
      - billing_integration:
          - "정기 결제 처리"
          - "Lab Pro 번들 자동 활성화"
    integrations:
      - payment: "Stripe Subscriptions"
      - shipping: "CJ대한통운 API"
      - inventory_sync: "로스터리 ERP 연동"
  
  # AI/ML Services
  ml-inference-service:
    tech: Python 3.10
    framework: FastAPI
    ml_framework: 
      training: PyTorch 2.0
      serving: TorchServe
      edge: TensorFlow Lite
    infrastructure:
      gpu: "NVIDIA T4 for training"
      cpu: "Intel Ice Lake for inference"
    features:
      - model_versioning: "MLflow"
      - a_b_testing: "built-in"
      - auto_scaling: "HPA based on GPU util"
      - batch_inference: "Ray Serve"
      - subscription_curation: "구독 원두 큐레이션 AI"
  
  recommendation-service:
    tech: Python 3.10
    framework: Ray Serve
    algorithms:
      - collaborative_filtering: "ALS, Neural CF"
      - content_based: "TF-IDF, BERT embeddings"
      - hybrid: "Weighted ensemble"
      - contextual_bandit: "LinUCB, Thompson Sampling"
      - subscription_based: "구독 이력 기반 추천"
    cache: Redis + Embedding Store
  
  # Analytics & Data Pipeline
  analytics-pipeline:
    streaming:
      ingestion: Apache Kafka 3.0
      processing: Apache Flink 1.15
      state_store: RocksDB
    batch:
      processing: Apache Spark 3.3
      workflow: Apache Airflow 2.5
      storage: S3 + Delta Lake
    warehouse:
      primary: Snowflake
      olap: Apache Druid
      visualization: Apache Superset
    subscription_analytics:
      - "구독 패턴 분석"
      - "재고 회전율 추적"
      - "큐레이션 성과 측정"
  
  # Real-time Services
  realtime-service:
    tech: Node.js + TypeScript
    framework: Socket.io 4.0
    pubsub: Redis Pub/Sub
    features:
      - live_cupping_sessions: "온라인 화상 커핑 (WebRTC)"
      - partner_event_streaming: "파트너 오프라인 이벤트 중계"
      - real_time_rankings: "Redis Sorted Sets"
      - collaborative_tasting: "CRDT for sync"
      - presence_system: "Redis + Socket.io"
      - blind_box_reveal: "블라인드 박스 라이브 공개"
  
  # Supporting Services
  notification-service:
    tech: Go
    channels:
      - push: "FCM, APNS"
      - email: "SendGrid"
      - in_app: "WebSocket"
      - sms: "Twilio"
    subscription_notifications:
      - "월간 큐레이션 공개 알림"
      - "재고 소진 임박 알림"
      - "배송 추적 알림"
  
  payment-service:
    tech: Java + Spring Boot
    providers:
      - stripe: "Subscriptions"
      - paypal: "One-time payments"
      - in_app_purchase: "iOS/Android"
    compliance: "PCI DSS Level 1"
    subscription_features:
      - "자동 정기 결제"
      - "Lab Pro 번들 관리"
      - "일시 중지/재개"
```

## 서비스별 상세 아키텍처

### 1. User Service
```typescript
// User Service 구조
@Module({
  imports: [
    TypeOrmModule.forFeature([User, TasteDNA, Subscription]),
    RedisModule,
    ElasticsearchModule,
  ],
  controllers: [UserController, AuthController, SubscriptionController],
  providers: [
    UserService,
    AuthService,
    SubscriptionService,
    TasteDNAService,
    JwtStrategy,
    RedisService,
  ],
})
export class UserModule {}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(TasteDNA) private tasteDNARepo: Repository<TasteDNA>,
    private redisService: RedisService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    // 1. 사용자 생성
    const user = await this.userRepo.save(userData);
    
    // 2. 초기 Taste DNA 생성
    await this.tasteDNARepo.save({
      userId: user.id,
      version: 1,
      dimensions: this.getInitialTasteDimensions(),
    });
    
    // 3. 캐시 저장
    await this.redisService.set(`user:${user.id}`, user, 3600);
    
    // 4. 검색 인덱스 추가
    await this.elasticsearchService.index({
      index: 'users',
      id: user.id,
      body: {
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
    
    return user;
  }
}
```

### 2. Subscription Service
```typescript
@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionOrder) private orderRepo: Repository<SubscriptionOrder>,
    private inventoryService: InventoryService,
    private qrService: QRService,
    private paymentService: PaymentService,
    private curationAI: CurationAIService,
  ) {}

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    // 1. 구독 생성
    const subscription = await this.subRepo.save({
      ...data,
      status: 'active',
      nextBillingAt: this.calculateNextBilling(data.type),
    });

    // 2. 정기 결제 설정
    await this.paymentService.createRecurringPayment({
      subscriptionId: subscription.id,
      amount: subscription.pricePerMonth,
      interval: 'monthly',
    });

    // 3. 첫 달 큐레이션 생성
    await this.createMonthlyOrder(subscription);

    return subscription;
  }

  async createMonthlyOrder(subscription: Subscription): Promise<SubscriptionOrder> {
    const currentMonth = new Date();
    
    // 1. AI 큐레이션으로 원두 선택
    const selectedCoffees = await this.curationAI.curateForUser({
      userId: subscription.userId,
      subscriptionType: subscription.type,
      month: currentMonth,
    });

    // 2. 재고 확인 및 예약
    for (const coffee of selectedCoffees) {
      await this.inventoryService.reserveStock(coffee.id, coffee.quantity);
    }

    // 3. QR 코드 생성
    const qrCodes = await Promise.all(
      selectedCoffees.map(coffee => 
        this.qrService.generateCoffeeQR({
          coffeeId: coffee.id,
          subscriptionId: subscription.id,
          unit: coffee.unit,
        })
      )
    );

    // 4. 주문 생성
    const order = await this.orderRepo.save({
      subscriptionId: subscription.id,
      orderMonth: currentMonth,
      orderNumber: this.generateOrderNumber(),
      coffeeItems: selectedCoffees,
      qrCodes,
      status: 'pending',
    });

    return order;
  }
}
```

### 3. Taste Record Service (Go)
```go
package main

import (
    "context"
    "encoding/json"
    "time"
    
    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
    "gorm.io/gorm"
)

type TasteRecordService struct {
    db          *gorm.DB
    redisClient *redis.Client
    s3Client    *S3Client
    kafkaProducer *KafkaProducer
}

type TasteRecord struct {
    ID                   string                 `json:"id" gorm:"primaryKey"`
    UserID              string                 `json:"userId" gorm:"index"`
    CoffeeID            string                 `json:"coffeeId" gorm:"index"`
    Mode                string                 `json:"mode"`
    SubscriptionOrderID *string                `json:"subscriptionOrderId,omitempty"`
    IsSubscriptionCoffee bool                  `json:"isSubscriptionCoffee"`
    QRScanned           bool                   `json:"qrScanned"`
    TasteLayers         map[string]interface{} `json:"tasteLayers" gorm:"type:jsonb"`
    TasteVector         []float32              `json:"tasteVector" gorm:"type:vector(128)"`
    ExtractionParams    map[string]interface{} `json:"extractionParams" gorm:"type:jsonb"`
    CreatedAt           time.Time              `json:"createdAt"`
}

func (s *TasteRecordService) CreateRecord(c *gin.Context) {
    var req CreateRecordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // 1. 고성능 삽입을 위한 배치 처리
    record := &TasteRecord{
        ID:               generateUUID(),
        UserID:          req.UserID,
        CoffeeID:        req.CoffeeID,
        Mode:            req.Mode,
        TasteLayers:     req.TasteLayers,
        ExtractionParams: req.ExtractionParams,
        CreatedAt:       time.Now(),
    }

    // 2. 비동기 벡터 계산
    go s.calculateTasteVector(record)

    // 3. 데이터베이스 저장 (TimescaleDB 최적화)
    if err := s.db.Create(record).Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to save record"})
        return
    }

    // 4. 실시간 분석을 위한 Kafka 전송
    s.kafkaProducer.SendAsync("taste-records", record)

    // 5. 캐시 무효화
    s.invalidateUserCache(req.UserID)

    c.JSON(201, record)
}

func (s *TasteRecordService) CreateFromQR(c *gin.Context) {
    var req QRScanRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // 1. QR 코드 검증 및 정보 추출
    qrInfo, err := s.validateAndDecodeQR(req.QRCode)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid QR code"})
        return
    }

    // 2. 구독 정보 확인
    var subscriptionInfo *SubscriptionInfo
    if qrInfo.SubscriptionOrderID != nil {
        subscriptionInfo, err = s.getSubscriptionInfo(*qrInfo.SubscriptionOrderID)
        if err != nil {
            c.JSON(404, gin.H{"error": "Subscription order not found"})
            return
        }
    }

    // 3. 기본 레코드 생성
    record := &TasteRecord{
        ID:                   generateUUID(),
        UserID:              req.UserID,
        CoffeeID:            qrInfo.CoffeeID,
        Mode:                req.Mode,
        SubscriptionOrderID: qrInfo.SubscriptionOrderID,
        IsSubscriptionCoffee: qrInfo.SubscriptionOrderID != nil,
        QRScanned:           true,
        CreatedAt:           time.Now(),
    }

    if err := s.db.Create(record).Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to save record"})
        return
    }

    response := gin.H{
        "record": record,
        "coffee": qrInfo.Coffee,
    }

    if subscriptionInfo != nil {
        response["subscriptionInfo"] = subscriptionInfo
    }

    c.JSON(201, response)
}
```

### 4. ML Inference Service
```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import torch
import mlflow
import numpy as np
from typing import List, Dict, Any

app = FastAPI(title="ML Inference Service")

class MLInferenceService:
    def __init__(self):
        self.models = {}
        self.load_models()
    
    def load_models(self):
        """MLflow에서 모델들 로드"""
        self.models = {
            'taste2vec': mlflow.pytorch.load_model('models:/taste2vec/production'),
            'recommendation': mlflow.pytorch.load_model('models:/recommendation/production'),
            'extraction_optimizer': mlflow.pytorch.load_model('models:/extraction_optimizer/production'),
            'subscription_curator': mlflow.pytorch.load_model('models:/subscription_curator/production'),
        }
    
    async def analyze_taste_record(self, record_data: Dict) -> Dict:
        """맛 기록 분석"""
        try:
            # 1. Taste2Vec으로 벡터 생성
            taste_vector = self.models['taste2vec'].encode(record_data)
            
            # 2. 추천 모델로 유사 커피 찾기
            recommendations = self.models['recommendation'].predict(
                user_vector=record_data['user_taste_dna'],
                taste_vector=taste_vector
            )
            
            # 3. 구독 인사이트 생성 (신규)
            subscription_insights = None
            if record_data.get('is_subscription_coffee'):
                subscription_insights = await self.generate_subscription_insights(
                    record_data, taste_vector
                )
            
            return {
                'taste_vector': taste_vector.tolist(),
                'match_score': float(recommendations['match_score']),
                'recommendations': recommendations['similar_coffees'],
                'insights': recommendations['insights'],
                'subscription_insights': subscription_insights,
                'confidence': float(recommendations['confidence'])
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    async def generate_subscription_insights(self, record_data: Dict, taste_vector: np.ndarray) -> Dict:
        """구독 관련 인사이트 생성"""
        user_id = record_data['user_id']
        
        # 1. 사용자의 구독 이력 조회
        subscription_history = await self.get_user_subscription_history(user_id)
        
        # 2. Taste DNA 진화 분석
        taste_evolution = await self.analyze_taste_evolution(user_id, taste_vector)
        
        # 3. 블라인드 박스 성과 분석
        blind_box_performance = await self.analyze_blind_box_performance(user_id)
        
        return {
            'taste_evolution': taste_evolution,
            'subscription_satisfaction_trend': self.calculate_satisfaction_trend(subscription_history),
            'blind_box_accuracy': blind_box_performance['accuracy'],
            'preferred_processing_methods': self.extract_processing_preferences(subscription_history),
            'origin_exploration_score': self.calculate_exploration_score(subscription_history),
            'lab_engagement_rate': await self.calculate_lab_engagement(user_id)
        }

# Subscription Curation API
@app.post("/curate-monthly-selection")
async def curate_monthly_selection(
    month: str,
    year: int,
    background_tasks: BackgroundTasks
):
    """이달의 원두 큐레이션"""
    curation_service = SubscriptionCurationService()
    
    # 1. 시즌 트렌드 분석
    seasonal_trends = await curation_service.analyze_seasonal_trends(month)
    
    # 2. 사용자 전체 선호도 분석
    global_preferences = await curation_service.analyze_global_preferences()
    
    # 3. AI 큐레이션 실행
    selected_coffees = await curation_service.curate_selection(
        trends=seasonal_trends,
        preferences=global_preferences,
        diversity_weight=0.3
    )
    
    # 4. 백그라운드에서 만족도 예측
    background_tasks.add_task(
        predict_satisfaction_scores,
        selected_coffees,
        global_preferences
    )
    
    return {
        'selections': selected_coffees,
        'theme': curation_service.generate_theme(month, selected_coffees),
        'diversity_score': curation_service.calculate_diversity(selected_coffees),
        'expected_satisfaction': 0.85  # 임시값, 백그라운드 작업 완료 후 업데이트
    }
```

### 5. Real-time Service
```typescript
@Injectable()
export class RealtimeService {
  constructor(
    private socketServer: SocketIOServer,
    private redisClient: RedisService,
  ) {}

  // 블라인드 박스 라이브 공개
  async startBlindBoxReveal(orderId: string): Promise<void> {
    const room = `blind-box-${orderId}`;
    
    // 1. 참가자들을 방에 입장
    this.socketServer.to(room).emit('reveal-starting', {
      orderId,
      countdown: 10,
    });

    // 2. 카운트다운 후 순차적 공개
    await this.sleep(10000);
    
    const coffeeItems = await this.getCoffeeItems(orderId);
    
    for (let i = 0; i < coffeeItems.length; i++) {
      await this.sleep(3000); // 3초 간격
      
      this.socketServer.to(room).emit('coffee-revealed', {
        position: i + 1,
        coffee: coffeeItems[i],
        totalCount: coffeeItems.length,
      });
    }

    // 3. 최종 결과 집계
    const results = await this.calculateBlindBoxResults(orderId);
    
    this.socketServer.to(room).emit('reveal-complete', {
      results,
      leaderboard: results.topPerformers,
    });
  }

  // 실시간 재고 알림
  async notifyStockAlert(coffeeId: string, currentStock: number): Promise<void> {
    const subscribers = await this.getSubscribersForCoffee(coffeeId);
    
    for (const subscriber of subscribers) {
      this.socketServer.to(`user-${subscriber.userId}`).emit('stock-alert', {
        coffeeId,
        coffeeName: subscriber.coffeeName,
        currentStock,
        message: `"${subscriber.coffeeName}" 재고가 ${currentStock}개 남았습니다!`,
      });
    }
  }
}
```

## 주요 특징

### 1. **확장성**
- 서비스별 독립적 스케일링
- 수평적 확장 지원
- 로드 밸런싱 및 서킷 브레이커

### 2. **성능 최적화**
- Redis 캐싱 레이어
- TimescaleDB 시계열 최적화
- 비동기 처리 및 배치 작업

### 3. **구독 서비스 통합**
- 실시간 재고 관리
- QR 코드 자동 생성
- AI 기반 큐레이션

### 4. **실시간 기능**
- WebSocket 기반 실시간 통신
- 라이브 이벤트 스트리밍
- 실시간 알림 시스템

### 5. **모니터링 및 관찰성**
- Prometheus + Grafana 모니터링
- 분산 추적 (Jaeger)
- 중앙화된 로깅 (ELK Stack)