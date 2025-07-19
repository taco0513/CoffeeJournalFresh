# ☕ Coffee Tasting Journey - 제품 아키텍처

## 🏗️ 제품 아키텍처
### 핵심 설계 철학: "Personal Taste, Shared Journey"

### 통합 플랫폼 시스템

```mermaid
graph TB
    subgraph "Coffee Tasting Journey Platform"
        A[사용자] --> B{여정 선택}
        B --> C[Personal Discovery<br/>개인 취향 발견]
        B --> D[Shared Learning<br/>커뮤니티 성장]
        B --> E[Deep Exploration<br/>원두 구독]
        
        C --> F[개인 맞춤 기록<br/>OCR/음성/직관적 UI]
        C --> G[취향 분석<br/>AI 패턴 인식]
        C --> H[성장 추적<br/>개인 진도 관리]
        C --> I[표현 확장<br/>어휘 학습 가이드]
        
        D --> J[커뮤니티 매칭<br/>취향 유사도]
        D --> K[전문가 연결<br/>멘토링 시스템]
        D --> L[공유 경험<br/>테이스팅 비교]
        D --> M[격려 문화<br/>포용적 피드백]
        
        E --> N[큐레이션 서비스<br/>이달의 추천]
        E --> O[개인 선택권<br/>내가 고르기]
        E --> P[도전 요소<br/>블라인드 박스]
        E -.->|Lab Pro 무료| Q[Deep Analysis<br/>전문 분석 도구]
        
        F --> R[Personal+Shared AI]
        G --> R
        H --> R
        I --> R
        J --> R
        K --> R
        L --> R
        M --> R
        N --> R
        
        R --> S[개인화 인사이트]
        R --> T[커뮤니티 연결]
        R --> U[성장 가이드]
        
        P --> V[QR 자동 등록]
        V --> Q
    end
```

### 핵심 기능 매트릭스 - Personal & Shared 통합

| 기능 영역 | Personal Taste (개인 중심) | Shared Journey (공유 중심) | 구독자 특화 |
|----------|--------------------------|---------------------------|------------|
| **기록 & 발견** | 직관적 입력 + 개인 취향 분석 | 실시간 커뮤니티 비교 + 피드백 | QR 자동 등록 |
| **학습 & 성장** | AI 개인 맞춤 가이드 + 진도 추적 | 전문가 멘토링 + 동료 학습 | Lab Pro 심화 분석 |
| **매칭 & 연결** | 개인 프로필 기반 추천 | 취향 유사도 + 커뮤니티 매칭 | 구독자 전용 네트워크 |
| **표현 & 언어** | 개인 어휘 확장 + 스타일 개발 | 다양한 표현 학습 + 소통 | 로스터 직접 피드백 |
| **도전 & 성취** | 개인 목표 설정 + 달성 추적 | 커뮤니티 챌린지 + 협력 | 블라인드 박스 경쟁 |
| **분석 & 인사이트** | 개인 성장 리포트 | 커뮤니티 트렌드 분석 | 월간 큐레이션 인사이트 |

### Personal Taste 아키텍처 (개인 중심)

```mermaid
graph LR
    subgraph "Personal Discovery Engine"
        A1[개인 입력 데이터]
        A2[취향 패턴 분석]
        A3[개인 성장 추적]
        A4[맞춤 추천]
    end
    
    subgraph "Individual Features"
        B1[직관적 기록 UI]
        B2[개인 진도 관리]
        B3[취향 시각화]
        B4[개인별 AI 가이드]
    end
    
    subgraph "Personal Insights"
        C1[나만의 Taste DNA]
        C2[선호도 진화 추적]
        C3[개인 목표 달성]
        C4[표현 스타일 개발]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
```

### Shared Journey 아키텍처 (공유 중심)

```mermaid
graph LR
    subgraph "Community Engine"
        D1[사용자 매칭]
        D2[전문가 연결]
        D3[그룹 활동]
        D4[커뮤니티 큐레이션]
    end
    
    subgraph "Social Features"
        E1[취향 유사도 매칭]
        E2[실시간 테이스팅 비교]
        E3[멘토링 시스템]
        E4[격려 피드백 문화]
    end
    
    subgraph "Shared Insights"
        F1[커뮤니티 트렌드]
        F2[집단 지성 활용]
        F3[문화적 다양성]
        F4[협력 학습 효과]
    end
    
    D1 --> E1
    D2 --> E2
    D3 --> E3
    D4 --> E4
    
    E1 --> F1
    E2 --> F2
    E3 --> F3
    E4 --> F4
```

### 원두 구독 시스템 아키텍처 - Deep Exploration

```mermaid
graph TB
    subgraph "구독 서비스 유형"
        A1[이달의 추천<br/>Personal 큐레이션<br/>4종 x 60g]
        A2[내가 고르기<br/>Personal Choice<br/>맞춤 구성]
        A3[블라인드 박스<br/>Shared Challenge<br/>5종 x 60g]
    end
    
    subgraph "Personal + Shared 혜택"
        B1[Lab Pro 무료<br/>개인 심화 분석]
        B2[QR 자동 등록<br/>간편한 시작]
        B3[구독자 커뮤니티<br/>깊은 교류]
        B4[전문가 직접 피드백<br/>개인 성장 + 공유 학습]
    end
    
    subgraph "통합 데이터 활용"
        C1[개인 선호도 분석]
        C2[커뮤니티 테이스팅 데이터]
        C3[전문가 큐레이션]
        C4[Personal+Shared AI 엔진]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    
    B1 --> C1
    B2 --> C2
    B3 --> C2
    B4 --> C3
    C1 --> C4
    C2 --> C4
    C3 --> C4
    C4 --> A1
```

### 통합 데이터 플로우 - Personal to Shared

```mermaid
sequenceDiagram
    participant U as 사용자
    participant P as Personal Engine
    participant S as Shared Engine
    participant C as 구독 서비스
    participant AI as Personal+Shared AI
    participant DB as 통합 데이터베이스
    
    Note over U,DB: Personal Discovery Phase
    U->>P: 개인 취향 기록
    P->>AI: 개인 패턴 분석
    AI->>P: 맞춤 가이드 제공
    P->>DB: 개인 데이터 저장
    
    Note over U,DB: Shared Learning Phase
    U->>S: 커뮤니티 참여
    S->>AI: 취향 유사도 계산
    AI->>S: 매칭 및 추천
    S->>DB: 공유 데이터 업데이트
    
    Note over U,DB: Deep Exploration Phase
    U->>C: 원두 구독 신청
    C->>AI: Personal+Shared 데이터 통합
    AI->>C: 최적 큐레이션 생성
    C->>U: 맞춤 원두 + Lab Pro 제공
    
    Note over U,DB: Continuous Growth
    U->>P: QR 스캔 자동 기록
    P->>S: 커뮤니티 공유
    S->>AI: 집단 지성 활용
    AI->>U: 개인+공유 인사이트 제공
```

### 기능 간 시너지 매트릭스

| 연계 기능 | Personal 시너지 | Shared 시너지 | 통합 사용자 가치 |
|----------|----------------|---------------|----------------|
| 개인 기록 + 커뮤니티 비교 | 개인 취향 명확화 | 다양한 관점 학습 | 개성 존중 + 시야 확장 |
| AI 분석 + 전문가 피드백 | 정확한 개인 진단 | 전문성 기반 성장 | 과학적 + 인간적 접근 |
| 구독 + Lab Pro | 개인 맞춤 심화 학습 | 구독자 커뮤니티 형성 | 비용 절감 + 깊이 있는 경험 |
| 블라인드 박스 + 커뮤니티 | 개인 실력 검증 | 집단 도전과 협력 | 성장 동기 + 소속감 |

### 사용자 경험 설계 원칙

#### Personal Taste 중심 설계
1. **개인화 우선**: 모든 기능이 사용자 개인의 취향과 성장에 최적화
2. **직관적 인터페이스**: 복잡한 커피 지식 없이도 쉽게 사용 가능
3. **점진적 학습**: 단계별로 자연스럽게 실력 향상
4. **개인 스타일 존중**: 각자만의 표현 방식 인정과 장려

#### Shared Journey 중심 설계
1. **포용적 커뮤니티**: 다양성을 인정하고 격려하는 문화
2. **자연스러운 연결**: 강제가 아닌 자연스러운 관계 형성
3. **집단 지성 활용**: 커뮤니티의 경험과 지혜 공유
4. **성장 동기 부여**: 함께 배우고 성장하는 즐거움

### 기술 스택 - Personal + Shared 지원

| 영역 | 기술 스택 | Personal 용도 | Shared 용도 |
|------|-----------|---------------|-------------|
| Frontend | React Native | 개인 맞춤 UI | 실시간 커뮤니티 기능 |
| Backend | Node.js, Go | 개인 데이터 처리 | 매칭 및 소셜 기능 |
| AI/ML | Python, PyTorch | 개인 취향 분석 | 커뮤니티 추천 시스템 |
| Database | PostgreSQL | 개인 이력 저장 | 커뮤니티 데이터 관리 |
| Real-time | WebSocket | 개인 알림 | 실시간 채팅/커핑 |
| 구독 관리 | Stripe + Custom | 개인 결제 처리 | 그룹 혜택 관리 |

### 확장성 및 미래 발전 방향

#### Personal Taste 확장
- **IoT 연동**: 개인 추출 장비와 자동 연동
- **생체 데이터**: 개인별 미각 민감도 측정
- **AI 개인 비서**: 24/7 맞춤 커피 가이드

#### Shared Journey 확장
- **글로벌 커뮤니티**: 국경을 넘나드는 커피 문화 교류
- **오프라인 연계**: 지역별 커피 모임 및 이벤트
- **전문가 네트워크**: 세계적 커피 전문가들과의 직접 소통

#### Deep Exploration 확장
- **농장 직연결**: 원산지에서 직접 소싱하는 구독
- **로스팅 체험**: 개인 맞춤 로스팅 서비스
- **커피 여행**: 구독자 전용 커피 농장 투어