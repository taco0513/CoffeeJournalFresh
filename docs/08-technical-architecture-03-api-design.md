# ⚙️ API 설계

## Production-Ready API 설계

RESTful API와 GraphQL을 결합한 하이브리드 API 아키텍처 설계입니다.

## RESTful API 명세

```yaml
openapi: 3.0.3
info:
  title: Coffee Tasting Journey API
  version: 2.0.0
  description: 커피 테이스팅 저널 및 구독 서비스 API
  contact:
    name: API Support
    email: api-support@coffee-journey.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.coffee-journey.com/v2
    description: Production server
  - url: https://staging-api.coffee-journey.com/v2
    description: Staging server

security:
  - bearerAuth: []

paths:
  # 구독 관리 API (신규 추가)
  /subscriptions:
    post:
      summary: Create new subscription
      description: 새로운 원두 구독 생성
      tags:
        - Subscriptions
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSubscriptionRequest'
            examples:
              monthly_pick:
                summary: 이달의 추천 구독
                value:
                  type: monthly_pick
                  shippingAddress:
                    street: "서울시 강남구 테헤란로 123"
                    city: "서울"
                    postalCode: "06142"
                    country: "KR"
                  preferredDeliveryDay: 15
              blind_box:
                summary: 블라인드 박스 구독
                value:
                  type: blind_box
                  shippingAddress:
                    street: "부산시 해운대구 해운대로 456"
                    city: "부산"
                    postalCode: "48099"
                    country: "KR"
      responses:
        '201':
          description: Subscription created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Subscription'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
      security:
        - bearerAuth: []

    get:
      summary: Get user subscriptions
      description: 사용자의 구독 목록 조회
      tags:
        - Subscriptions
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, paused, cancelled]
        - name: type
          in: query
          schema:
            type: string
            enum: [monthly_pick, my_choice, blind_box]
      responses:
        '200':
          description: Subscription list
          content:
            application/json:
              schema:
                type: object
                properties:
                  subscriptions:
                    type: array
                    items:
                      $ref: '#/components/schemas/Subscription'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /subscriptions/{id}/pause:
    post:
      summary: Pause subscription
      description: 구독 일시 중지
      tags:
        - Subscriptions
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
                  description: 중지 사유
                resumeDate:
                  type: string
                  format: date
                  description: 재개 예정일
      responses:
        '200':
          description: Subscription paused
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Subscription'

  /subscriptions/{id}/coffee-selection:
    get:
      summary: Get available coffees for selection
      description: 구독자가 선택할 수 있는 원두 목록 조회
      tags:
        - Subscriptions
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: month
          in: query
          required: true
          schema:
            type: string
            format: date
          example: "2024-03"
      responses:
        '200':
          description: Available coffee list with personalized recommendations
          content:
            application/json:
              schema:
                type: object
                properties:
                  coffees:
                    type: array
                    items:
                      $ref: '#/components/schemas/SubscriptionCoffee'
                  personalizedRecommendations:
                    type: array
                    items:
                      $ref: '#/components/schemas/PersonalizedRecommendation'
                  monthlyTheme:
                    type: string
                    example: "Spring Blossoms - 플로럴 노트의 향연"

    post:
      summary: Select coffees for the month
      description: 이달의 원두 선택 (My Choice 구독용)
      tags:
        - Subscriptions
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - month
                - selections
              properties:
                month:
                  type: string
                  format: date
                selections:
                  type: array
                  items:
                    type: object
                    properties:
                      coffeeId:
                        type: string
                        format: uuid
                      unit:
                        type: string
                        enum: [60g, 100g]
                      quantity:
                        type: integer
                        minimum: 1
      responses:
        '201':
          description: Coffee selection confirmed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubscriptionOrder'

  /subscriptions/{id}/blind-box-guess:
    post:
      summary: Submit blind box guess
      description: 블라인드 박스 추측 제출
      tags:
        - Subscriptions
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - orderId
                - guesses
              properties:
                orderId:
                  type: string
                  format: uuid
                guesses:
                  type: array
                  items:
                    type: object
                    properties:
                      label:
                        type: string
                        enum: [a, b, c, d, e]
                      coffeeId:
                        type: string
                        format: uuid
                      confidence:
                        type: integer
                        minimum: 1
                        maximum: 5
      responses:
        '200':
          description: Guess submitted and results calculated
          content:
            application/json:
              schema:
                type: object
                properties:
                  correctCount:
                    type: integer
                  totalCount:
                    type: integer
                  accuracy:
                    type: number
                    format: float
                  results:
                    type: array
                    items:
                      type: object
                      properties:
                        label:
                          type: string
                        correct:
                          type: boolean
                        actualCoffee:
                          $ref: '#/components/schemas/Coffee'
                        guessedCoffee:
                          $ref: '#/components/schemas/Coffee'
                  ranking:
                    type: object
                    properties:
                      currentRank:
                        type: integer
                      totalParticipants:
                        type: integer
                      leaderboard:
                        type: array

  # 맛 기록 API
  /records:
    post:
      summary: Create taste record
      description: 새로운 맛 기록 생성
      tags:
        - Records
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRecordRequest'
      responses:
        '201':
          description: Record created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TasteRecord'
        '400':
          $ref: '#/components/responses/BadRequest'
      security:
        - bearerAuth: []
      x-rate-limit:
        - tier: free
          limit: 5
          window: day
        - tier: pro
          limit: 50
          window: day
        - tier: subscription
          limit: unlimited

    get:
      summary: Get taste records
      description: 사용자의 맛 기록 목록 조회
      tags:
        - Records
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: mode
          in: query
          schema:
            type: string
            enum: [cafe, lab]
        - name: from_date
          in: query
          schema:
            type: string
            format: date
        - name: to_date
          in: query
          schema:
            type: string
            format: date
        - name: coffee_id
          in: query
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Records retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  records:
                    type: array
                    items:
                      $ref: '#/components/schemas/TasteRecord'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /records/qr-scan:
    post:
      summary: Create record from QR scan
      description: QR 코드 스캔으로 맛 기록 생성
      tags:
        - Records
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - qrCode
                - mode
              properties:
                qrCode:
                  type: string
                  description: QR 코드 데이터
                mode:
                  type: string
                  enum: [cafe, lab]
      responses:
        '201':
          description: Record created with coffee info from QR
          content:
            application/json:
              schema:
                type: object
                properties:
                  record:
                    $ref: '#/components/schemas/TasteRecord'
                  coffee:
                    $ref: '#/components/schemas/Coffee'
                  subscriptionInfo:
                    type: object
                    properties:
                      orderId:
                        type: string
                        format: uuid
                      monthlyTheme:
                        type: string
                      isBlindBox:
                        type: boolean

  # AI 분석 API
  /ai/analyze:
    post:
      summary: Request AI analysis
      description: 맛 기록에 대한 AI 분석 요청
      tags:
        - AI Analysis
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - recordId
              properties:
                recordId:
                  type: string
                  format: uuid
                analysisTypes:
                  type: array
                  items:
                    type: string
                    enum: 
                      - taste_match
                      - extraction_optimization
                      - growth_insights
                      - subscription_insights
                  default: [taste_match, growth_insights]
      responses:
        '202':
          description: Analysis request accepted
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                    format: uuid
                  estimatedTime:
                    type: integer
                    description: Estimated completion time in seconds
                  webhookUrl:
                    type: string
                    description: Webhook URL for completion notification
        '400':
          $ref: '#/components/responses/BadRequest'

  /ai/analysis/{jobId}:
    get:
      summary: Get analysis result
      description: AI 분석 결과 조회
      tags:
        - AI Analysis
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Analysis completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalysisResult'
        '202':
          description: Analysis in progress
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [pending, processing, completed, failed]
                  progress:
                    type: integer
                    minimum: 0
                    maximum: 100

  # 추출 최적화 API
  /extraction/optimize:
    post:
      summary: Optimize extraction parameters
      description: 목표 맛 프로필을 위한 추출 조건 최적화
      tags:
        - Extraction
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - targetProfile
                - constraints
              properties:
                targetProfile:
                  $ref: '#/components/schemas/TasteProfile'
                constraints:
                  type: object
                  properties:
                    equipment:
                      type: string
                      enum: [v60, chemex, aeropress, french_press]
                    coffeeProfile:
                      $ref: '#/components/schemas/CoffeeProfile'
                    dose:
                      type: number
                      minimum: 15
                      maximum: 30
      responses:
        '200':
          description: Optimization completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ExtractionOptimization'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    CreateSubscriptionRequest:
      type: object
      required:
        - type
        - shippingAddress
      properties:
        type:
          type: string
          enum: [monthly_pick, my_choice, blind_box]
          description: 구독 타입
        shippingAddress:
          $ref: '#/components/schemas/ShippingAddress'
        preferredDeliveryDay:
          type: integer
          minimum: 1
          maximum: 28
          description: 선호 배송일 (매월)

    Subscription:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [monthly_pick, my_choice, blind_box]
        status:
          type: string
          enum: [active, paused, cancelled]
        pricePerMonth:
          type: number
          format: decimal
        includesLabPro:
          type: boolean
        shippingAddress:
          $ref: '#/components/schemas/ShippingAddress'
        preferredDeliveryDay:
          type: integer
        startedAt:
          type: string
          format: date-time
        nextBillingAt:
          type: string
          format: date-time
        pausedAt:
          type: string
          format: date-time
        cancelledAt:
          type: string
          format: date-time

    SubscriptionCoffee:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        roaster:
          type: object
          properties:
            id:
              type: string
              format: uuid
            name:
              type: string
        origin:
          type: object
          properties:
            country:
              type: string
            region:
              type: string
            farm:
              type: string
        flavorProfile:
          type: array
          items:
            type: string
        availableUnits:
          type: array
          items:
            type: object
            properties:
              unit:
                type: string
                enum: [60g, 100g]
              price:
                type: number
              stock:
                type: integer
        matchScore:
          type: number
          minimum: 0
          maximum: 1
          description: 개인 취향 매치 점수

    PersonalizedRecommendation:
      type: object
      properties:
        coffeeId:
          type: string
          format: uuid
        matchScore:
          type: number
          minimum: 0
          maximum: 1
        reasons:
          type: array
          items:
            type: string
          example: 
            - "과거 에티오피아 원두를 좋아하셨어요"
            - "플로럴 계열 취향과 잘 맞아요"
            - "새로운 프로세싱 방법을 경험해보세요"
        basedOn:
          type: object
          properties:
            tasteDNA:
              type: number
            pastRatings:
              type: number
            explorationFactor:
              type: number
            subscriptionHistory:
              type: number

    CreateRecordRequest:
      type: object
      required:
        - coffeeId
        - mode
        - tasteLayers
      properties:
        coffeeId:
          type: string
          format: uuid
        mode:
          type: string
          enum: [cafe, lab]
        tasteLayers:
          type: object
          properties:
            acidity:
              type: number
              minimum: 0
              maximum: 10
            sweetness:
              type: number
              minimum: 0
              maximum: 10
            body:
              type: number
              minimum: 0
              maximum: 10
            aftertaste:
              type: number
              minimum: 0
              maximum: 10
            balance:
              type: number
              minimum: 0
              maximum: 10
        extractionParams:
          type: object
          properties:
            method:
              type: string
            temperature:
              type: number
            grindSize:
              type: string
            brewTime:
              type: integer
            ratio:
              type: string
        notes:
          type: string
        images:
          type: array
          items:
            type: string
            format: uri

    TasteRecord:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        coffeeId:
          type: string
          format: uuid
        mode:
          type: string
          enum: [cafe, lab]
        subscriptionOrderId:
          type: string
          format: uuid
        isSubscriptionCoffee:
          type: boolean
        qrScanned:
          type: boolean
        tasteLayers:
          type: object
        tasteVector:
          type: array
          items:
            type: number
        extractionParams:
          type: object
        notes:
          type: string
        images:
          type: array
          items:
            type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    AnalysisResult:
      type: object
      properties:
        id:
          type: string
          format: uuid
        recordId:
          type: string
          format: uuid
        analysisType:
          type: string
        matchScore:
          type: number
        insights:
          type: object
          properties:
            tasteDevelopment:
              type: string
            recommendations:
              type: array
              items:
                type: string
            growthAreas:
              type: array
              items:
                type: string
        subscriptionInsights:
          type: object
          properties:
            tasteEvolution:
              type: object
            preferredOrigins:
              type: array
              items:
                type: string
            blindBoxAccuracy:
              type: number
        confidence:
          type: number
          minimum: 0
          maximum: 1

    ShippingAddress:
      type: object
      required:
        - street
        - city
        - postalCode
        - country
      properties:
        street:
          type: string
        city:
          type: string
        state:
          type: string
        postalCode:
          type: string
        country:
          type: string
          minLength: 2
          maxLength: 2

    Pagination:
      type: object
      properties:
        limit:
          type: integer
        offset:
          type: integer
        total:
          type: integer
        hasNext:
          type: boolean
        hasPrev:
          type: boolean

    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "INVALID_REQUEST"
            message: "요청 데이터가 올바르지 않습니다"

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "인증이 필요합니다"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "요청한 리소스를 찾을 수 없습니다"

    RateLimitExceeded:
      description: Rate limit exceeded
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
          description: Request limit per time window
        X-RateLimit-Remaining:
          schema:
            type: integer
          description: Remaining requests in current window
        X-RateLimit-Reset:
          schema:
            type: integer
          description: Time when rate limit resets
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

## GraphQL Schema

```graphql
scalar DateTime
scalar JSON
scalar UUID

# 루트 타입들
type Query {
  # 사용자 정보
  me: User!
  user(id: UUID!): User
  
  # 구독 정보
  subscription(id: UUID!): Subscription
  subscriptions(filter: SubscriptionFilter): [Subscription!]!
  
  # 맛 기록
  record(id: UUID!): TasteRecord
  records(
    first: Int = 10
    after: String
    filter: RecordFilter
    orderBy: RecordOrderBy
  ): RecordConnection!
  
  # 커피 정보
  coffee(id: UUID!): Coffee
  coffees(
    first: Int = 10
    after: String
    filter: CoffeeFilter
    search: String
  ): CoffeeConnection!
  
  # 추천
  recommendations(
    context: RecommendationContext
    limit: Int = 5
  ): [Recommendation!]!
  
  # 통계
  userStatistics(period: StatsPeriod!): UserStatistics!
  
  # 리더보드
  leaderboard(
    type: LeaderboardType!
    period: StatsPeriod!
    limit: Int = 10
  ): [LeaderboardEntry!]!
}

type Mutation {
  # 맛 기록
  createTasteRecord(input: CreateRecordInput!): TasteRecord!
  createTasteRecordFromQR(qrCode: String!, mode: RecordMode!): TasteRecord!
  updateTasteRecord(id: UUID!, input: UpdateRecordInput!): TasteRecord!
  deleteTasteRecord(id: UUID!): Boolean!
  
  # 구독 관리
  createSubscription(input: CreateSubscriptionInput!): Subscription!
  pauseSubscription(id: UUID!, reason: String, resumeDate: DateTime): Subscription!
  resumeSubscription(id: UUID!): Subscription!
  cancelSubscription(id: UUID!, reason: String): Subscription!
  
  # 구독 커피 선택
  selectSubscriptionCoffees(
    subscriptionId: UUID!
    month: DateTime!
    selections: [CoffeeSelection!]!
  ): SubscriptionOrder!
  
  # 블라인드 박스
  submitBlindBoxGuess(
    orderId: UUID!
    guesses: [BlindBoxGuess!]!
  ): BlindBoxResult!
  
  # AI 분석
  requestAIAnalysis(
    recordId: UUID!
    types: [AnalysisType!]!
  ): AnalysisJob!
  
  # 추출 최적화
  optimizeExtraction(
    targetProfile: TasteProfileInput!
    constraints: ExtractionConstraints!
  ): ExtractionOptimization!
  
  # 소셜 기능
  followUser(userId: UUID!): User!
  unfollowUser(userId: UUID!): User!
  joinCuppingSession(sessionId: UUID!): CuppingSession!
  leaveCuppingSession(sessionId: UUID!): Boolean!
}

type Subscription {
  # 실시간 커핑 세션
  cuppingSession(sessionId: UUID!): CuppingUpdate!
  
  # 랭킹 업데이트
  leaderboardUpdate(leagueId: UUID!): LeaderboardUpdate!
  
  # AI 분석 완료 알림
  analysisComplete(jobId: UUID!): AnalysisResult!
  
  # 구독 관련 실시간 업데이트
  subscriptionUpdate(subscriptionId: UUID!): SubscriptionUpdate!
  blindBoxReveal(orderId: UUID!): BlindBoxReveal!
  
  # 재고 알림
  stockAlert(userId: UUID!): StockAlert!
  
  # 알림
  notifications(userId: UUID!): Notification!
}

# 사용자 타입
type User {
  id: UUID!
  username: String!
  email: String!
  profile: UserProfile!
  
  # 게이미피케이션
  level: Int!
  experiencePoints: Int!
  badges: [Badge!]!
  
  # Taste DNA
  tasteDNA: TasteDNA!
  
  # 구독 정보
  subscription: Subscription
  subscriptionHistory: [SubscriptionOrder!]!
  
  # 관계
  records(
    first: Int = 10
    after: String
    filter: RecordFilter
    orderBy: RecordOrderBy
  ): RecordConnection!
  
  followers: [User!]!
  following: [User!]!
  
  # 통계
  statistics(period: StatsPeriod!): UserStatistics!
  
  # 추천
  recommendations(
    context: RecommendationContext
    limit: Int = 5
  ): [Recommendation!]!
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

# 구독 타입
type Subscription {
  id: UUID!
  type: SubscriptionType!
  status: SubscriptionStatus!
  pricePerMonth: Float!
  includesLabPro: Boolean!
  
  # 배송 정보
  shippingAddress: ShippingAddress!
  preferredDeliveryDay: Int
  
  # 주문 이력
  orders(
    first: Int = 10
    after: String
  ): SubscriptionOrderConnection!
  
  # 현재 달 정보
  currentMonthSelection: MonthlySelection
  availableCoffees: [SubscriptionCoffee!]!
  
  # 구독 기간
  startedAt: DateTime!
  nextBillingAt: DateTime!
  pausedAt: DateTime
  cancelledAt: DateTime
  
  # 통계
  satisfactionScore: Float
  totalOrders: Int!
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SubscriptionOrder {
  id: UUID!
  subscription: Subscription!
  orderNumber: String!
  month: DateTime!
  status: OrderStatus!
  
  # 구성
  coffeeItems: [CoffeeItem!]!
  totalPrice: Float!
  
  # 배송
  shippedAt: DateTime
  deliveredAt: DateTime
  trackingNumber: String
  
  # QR 코드
  qrCodes: [QRCode!]!
  
  # 피드백
  feedback: [SubscriptionFeedback!]!
  
  # 블라인드 박스 전용
  isBlindBox: Boolean!
  blindBoxResults: BlindBoxResult
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

type CoffeeItem {
  coffee: Coffee!
  quantity: Int!
  unit: CoffeeUnit!
  qrCode: String!
  unitPrice: Float!
}

type SubscriptionFeedback {
  id: UUID!
  user: User!
  coffee: Coffee!
  overallRating: Int
  wouldBuyAgain: Boolean
  
  # Lab 모드 연동
  labRecord: TasteRecord
  tasteMatchScore: Float
  
  # 블라인드 박스 전용
  blindGuess: Coffee
  blindGuessCorrect: Boolean
  
  feedbackText: String
  createdAt: DateTime!
}

# 맛 기록 타입
type TasteRecord {
  id: UUID!
  user: User!
  coffee: Coffee!
  mode: RecordMode!
  
  # 구독 연동
  subscriptionOrder: SubscriptionOrder
  isSubscriptionCoffee: Boolean!
  qrScanned: Boolean!
  
  # 맛 데이터
  tasteLayers: TasteLayers!
  tasteVector: [Float!]
  tasteConfidence: Float
  
  # 추출 데이터
  extractionMethod: String
  extractionParams: JSON
  extractionMetrics: JSON
  
  # 컨텍스트
  location: Location
  weatherConditions: JSON
  timeOfDay: String
  mood: String
  
  # 실험 데이터
  blindMode: Boolean!
  referenceProfile: TasteRecord
  
  # 미디어
  images: [String!]!
  notes: String
  
  # AI 분석
  analyses: [Analysis!]!
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

type TasteDNA {
  id: UUID!
  user: User!
  version: Int!
  
  # 차원별 점수
  dimensions: TasteDimensions!
  
  # 진화 기록
  evolution(
    from: DateTime
    to: DateTime
  ): [TasteDNASnapshot!]!
  
  # 유사 사용자
  similarUsers(first: Int = 10): [User!]!
  
  # 구독 기반 인사이트
  subscriptionInsights: SubscriptionInsights!
  
  # 시각화 데이터
  visualizationData(type: VisualizationType!): JSON!
  
  lastUpdated: DateTime!
}

type SubscriptionInsights {
  preferredOrigins: [String!]!
  flavorEvolution: [FlavorEvolution!]!
  blindTestAccuracy: Float!
  diversityScore: Float!
  labEngagementRate: Float!
  monthlyProgressions: [MonthlyProgression!]!
}

# 커피 타입
type Coffee {
  id: UUID!
  name: String!
  roaster: Roaster!
  
  # 원산지 정보
  origin: Origin!
  variety: String
  processingMethod: ProcessingMethod!
  altitude: IntRange
  harvestDate: DateTime
  roastDate: DateTime
  
  # 프로필
  roasterNotes: JSON
  roastLevel: RoastLevel!
  flavorProfile: [FlavorNote!]!
  
  # 구독 관련
  availableForSubscription: Boolean!
  subscriptionUnits: [CoffeeUnit!]!
  subscriptionPrices: [PriceInfo!]!
  
  # 통계
  averageRating: Float
  totalRecords: Int!
  popularityScore: Float
  
  # 재고 정보 (구독자용)
  inventory(unit: CoffeeUnit): InventoryInfo
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

# 입력 타입들
input CreateSubscriptionInput {
  type: SubscriptionType!
  shippingAddress: ShippingAddressInput!
  preferredDeliveryDay: Int
}

input CreateRecordInput {
  coffeeId: UUID!
  mode: RecordMode!
  tasteLayers: TasteLayersInput!
  extractionParams: JSON
  notes: String
  images: [String!]
  location: LocationInput
  weatherConditions: JSON
  mood: String
}

input CoffeeSelection {
  coffeeId: UUID!
  unit: CoffeeUnit!
  quantity: Int!
}

input BlindBoxGuess {
  label: BlindBoxLabel!
  coffeeId: UUID!
  confidence: Int!
}

# 열거형들
enum SubscriptionType {
  MONTHLY_PICK
  MY_CHOICE
  BLIND_BOX
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

enum CoffeeUnit {
  GRAM_60
  GRAM_100
}

enum RecordMode {
  CAFE
  LAB
}

enum AnalysisType {
  TASTE_MATCH
  EXTRACTION_OPTIMIZATION
  GROWTH_INSIGHTS
  SUBSCRIPTION_INSIGHTS
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum BlindBoxLabel {
  A
  B
  C
  D
  E
}

# 실시간 업데이트 타입들
type SubscriptionUpdate {
  subscriptionId: UUID!
  type: SubscriptionUpdateType!
  data: JSON!
  timestamp: DateTime!
}

type BlindBoxReveal {
  orderId: UUID!
  position: Int!
  coffee: Coffee!
  totalCount: Int!
  isComplete: Boolean!
  leaderboard: [BlindBoxParticipant!]
}

type StockAlert {
  coffeeId: UUID!
  coffeeName: String!
  currentStock: Int!
  message: String!
  urgency: AlertUrgency!
}

enum SubscriptionUpdateType {
  ORDER_CONFIRMED
  SHIPPED
  DELIVERED
  MONTHLY_SELECTION_AVAILABLE
  STOCK_ALERT
}

enum AlertUrgency {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## 실시간 WebSocket API

```typescript
// WebSocket 이벤트 정의
interface WebSocketEvents {
  // 클라이언트 → 서버
  'join-room': { roomId: string; roomType: 'cupping' | 'blind-box' | 'user' }
  'leave-room': { roomId: string }
  'cupping-action': { sessionId: string; action: CuppingAction }
  'blind-box-guess': { orderId: string; guesses: BlindBoxGuess[] }
  
  // 서버 → 클라이언트
  'cupping-update': CuppingUpdate
  'blind-box-reveal': BlindBoxReveal
  'stock-alert': StockAlert
  'subscription-update': SubscriptionUpdate
  'notification': Notification
  'leaderboard-update': LeaderboardUpdate
  'analysis-complete': AnalysisResult
}

// 실시간 커핑 세션
interface CuppingAction {
  type: 'taste' | 'note' | 'rating'
  coffeeId: string
  data: any
  timestamp: Date
}

interface CuppingUpdate {
  sessionId: string
  participants: Participant[]
  currentPhase: 'fragrance' | 'flavor' | 'aftertaste' | 'discussion'
  timeRemaining: number
  updates: CuppingAction[]
}

// 블라인드 박스 공개
interface BlindBoxReveal {
  orderId: string
  revealPhase: 'starting' | 'revealing' | 'complete'
  currentReveal?: {
    position: number
    coffee: Coffee
  }
  leaderboard: BlindBoxParticipant[]
}
```

## 주요 특징

### 1. **하이브리드 API 아키텍처**
- RESTful API: CRUD 작업 및 명확한 리소스 관리
- GraphQL: 복잡한 쿼리 및 실시간 구독
- WebSocket: 실시간 양방향 통신

### 2. **구독 서비스 통합**
- 완전한 구독 라이프사이클 API
- QR 코드 기반 연동
- 블라인드 박스 특별 기능

### 3. **실시간 기능**
- 라이브 커핑 세션
- 블라인드 박스 실시간 공개
- 재고 알림 시스템

### 4. **AI/ML 통합**
- 비동기 AI 분석 처리
- 개인화 추천 API
- 추출 최적화 서비스

### 5. **확장성 및 성능**
- 레이트 리미팅
- 페이지네이션
- 캐싱 전략
- 에러 처리 표준화