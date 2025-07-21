# ⚙️ TastingFlow Technical Implementation Specifications

## 개요

TastingFlow Cafe Mode의 기술적 구현을 위한 상세 명세서입니다. 아키텍처, 데이터 모델, API 설계, 성능 요구사항을 다룹니다.

> **기술 목표**: 확장 가능한 모듈형 아키텍처, 실시간 데이터 동기화, 오프라인 지원

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
├─────────────────┬─────────────────┬─────────────────────┤
│   React Native  │   Components    │   Screen States     │
│     Screens     │   Library       │   Management        │
└─────────────────┴─────────────────┴─────────────────────┘
         │                  │                   │
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                  │
├─────────────────┬─────────────────┬─────────────────────┤
│   TastingFlow   │   Services &    │   State Management  │
│     Engine      │   Processors    │    (Zustand)       │
└─────────────────┴─────────────────┴─────────────────────┘
         │                  │                   │
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                         │
├─────────────────┬─────────────────┬─────────────────────┤
│   Realm DB      │   Supabase      │   Local Storage    │
│   (Local)       │   (Remote)      │   (Cache)          │  
└─────────────────┴─────────────────┴─────────────────────┘
```

### Technology Stack
```typescript
interface TechStack {
  frontend: {
    framework: 'React Native 0.80+';
    language: 'TypeScript 5.0+';
    stateManagement: 'Zustand 4.4+';
    navigation: 'React Navigation 6+';
    ui: 'React Native Elements + Custom';
  };
  
  backend: {
    database: 'Supabase PostgreSQL';
    auth: 'Supabase Auth';
    storage: 'Supabase Storage';
    realtime: 'Supabase Realtime';
  };
  
  local: {
    database: 'Realm 12+';
    storage: 'AsyncStorage';
    cache: 'React Query 4+';
  };
  
  services: {
    ocr: 'Google ML Kit / AWS Textract';
    ai: 'OpenAI API / Custom NLP';
    analytics: 'Supabase Analytics';
    crashlytics: 'Flipper + Sentry';
  };
}
```

---

## 📊 Data Model & Schema

### Core Entities
```typescript
// 1. TastingSession (메인 엔티티)
interface TastingSession {
  id: string;                    // UUID
  userId: string;                // 사용자 ID
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Steps Data
  coffeeInfo: CoffeeInfo;
  flavorSelection?: FlavorSelection;
  sensoryEvaluation?: SensoryEvaluation;
  personalNote?: PersonalNote;
  roasterNotes?: RoasterNotes;
  results?: TastingResults;
  
  // Metadata
  currentStep: number;           // 1-6
  isCompleted: boolean;
  isDraft: boolean;
  version: number;               // 스키마 버전
  
  // Analytics
  totalTimeSpent: number;        // 밀리초
  stepTimes: number[];           // 각 단계별 소요시간
  deviceInfo: DeviceInfo;
}

// 2. CoffeeInfo (1단계)
interface CoffeeInfo {
  coffeeName: string;            // 필수
  roastery: string;              // 필수
  cafeName: string;              // 필수 ('Home' 선택 가능)
  temperature: 'hot' | 'ice';    // 필수
  origin?: string;               // 선택
  variety?: string;              // 선택
  altitude?: string;             // 선택
  process?: ProcessMethod;       // 선택
  roastLevel?: RoastLevel;       // 선택
  price?: number;                // 선택
  purchaseDate?: Date;           // 선택
  
  // OCR 메타데이터
  ocrData?: {
    originalImageUri: string;
    extractedText: string;
    confidence: number;
    processingTime: number;
  };
  
  // 자동완성 데이터
  autoCompleted: string[];       // 자동완성된 필드들
}

// 3. FlavorSelection (2단계 - 핵심)
interface FlavorSelection {
  selectedFlavors: SelectedFlavor[];
  selectionMethod: 'category' | 'wheel' | 'search';
  
  // UI 상태
  expandedCategories: string[];   // 열려있는 카테고리들
  searchQuery: string;            // 현재 검색어
  
  // 개인화
  newFlavorsDiscovered: string[];
  personalLibraryUsed: string[];
  recommendationsShown: FlavorRecommendation[];
  recommendationsUsed: string[];
  
  // 메타데이터
  selectionTime: number;
  hesitationFlavors: string[];   // 망설였던 향미들
  confidence: number;            // 1-5 자신감
  selectionOrder: string[];      // 선택한 순서
}

// 3-1. SelectedFlavor 상세
interface SelectedFlavor {
  flavorId: string;
  category: string;
  subcategory: string;
  name: string;
  nameKo?: string;
  selectedAt: Date;
}

// 4. 향미 마스터 데이터
interface FlavorMaster {
  id: string;
  name: string;                  // 한글명
  nameEn?: string;               // 영문명
  category: FlavorCategory;
  subcategory?: string;
  
  // SCA Flavor Wheel 매핑
  scaLevel: 1 | 2 | 3;          // 향미휠 레벨
  scaParent?: string;           // 상위 카테고리
  scaChildren: string[];         // 하위 카테고리
  
  // 사용자 난이도
  difficulty: 1 | 2 | 3;        // 1: 초보자, 3: 전문가
  frequency: number;             // 사용 빈도 (0-1)
  
  // 다국어 지원
  translations: {
    [lang: string]: {
      name: string;
      description: string;
      examples: string[];
    };
  };
}
```

### Database Schema (Supabase)
```sql
-- Users table (Supabase Auth 확장)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile info
  display_name TEXT,
  avatar_url TEXT,
  user_level TEXT DEFAULT 'intermediate',
  
  -- Preferences
  preferred_language TEXT DEFAULT 'ko',
  ui_complexity TEXT DEFAULT 'simple',
  
  -- Stats
  total_tastings INTEGER DEFAULT 0,
  total_flavors_used INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  
  CONSTRAINT user_level_check CHECK (user_level IN ('intermediate', 'advanced'))
);

-- TastingSessions table
CREATE TABLE tasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Session data (JSONB for flexibility)
  coffee_info JSONB NOT NULL,
  roaster_notes JSONB,
  flavor_selection JSONB,
  sensory_evaluation JSONB,
  personal_comment JSONB,
  results JSONB,
  
  -- Metadata
  current_step INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  
  -- Analytics
  total_time_spent INTEGER DEFAULT 0,
  step_times INTEGER[] DEFAULT '{}',
  device_info JSONB,
  
  -- Indexes
  INDEX(user_id, created_at DESC),
  INDEX(user_id, is_completed),
  INDEX(is_completed, created_at)
);

-- FlavorMaster table (참조 데이터)
CREATE TABLE flavor_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- SCA mapping
  sca_level INTEGER CHECK (sca_level IN (1, 2, 3)),
  sca_parent TEXT,
  sca_children TEXT[],
  
  -- Usage data
  difficulty INTEGER DEFAULT 1 CHECK (difficulty IN (1, 2, 3)),
  frequency DECIMAL DEFAULT 0.5 CHECK (frequency >= 0 AND frequency <= 1),
  
  -- Localization
  translations JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX(category, subcategory),
  INDEX(difficulty, frequency DESC),
  UNIQUE(name, category)
);

-- UserFlavorLibrary table (개인화 데이터)
CREATE TABLE user_flavor_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  flavor_id UUID REFERENCES flavor_master(id) NOT NULL,
  
  -- Usage statistics
  usage_count INTEGER DEFAULT 1,
  first_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  
  -- Personal notes
  personal_tags TEXT[],
  associated_coffees TEXT[],
  
  UNIQUE(user_id, flavor_id),
  INDEX(user_id, last_used DESC),
  INDEX(user_id, usage_count DESC)
);
```

### Realm Schema (Local Database)
```typescript
// 로컬 캐시와 오프라인 지원
class TastingSessionRealm extends Realm.Object {
  static schema = {
    name: 'TastingSession',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      completedAt: 'date?',
      
      // JSON으로 저장
      coffeeInfoJson: 'string',
      roasterNotesJson: 'string?',
      flavorSelectionJson: 'string?',
      sensoryEvaluationJson: 'string?',
      personalCommentJson: 'string?',
      resultsJson: 'string?',
      
      currentStep: {type: 'int', default: 1},
      isCompleted: {type: 'bool', default: false},
      isDraft: {type: 'bool', default: true},
      
      // Sync status
      syncStatus: {type: 'string', default: 'pending'}, // pending, synced, error
      lastSyncAt: 'date?',
      
      totalTimeSpent: {type: 'int', default: 0},
      stepTimesJson: 'string', // JSON array
    }
  };
}

// 향미 마스터 데이터 캐시
class FlavorMasterRealm extends Realm.Object {
  static schema = {
    name: 'FlavorMaster',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      nameEn: 'string?',
      category: 'string',
      subcategory: 'string?',
      difficulty: {type: 'int', default: 1},
      frequency: {type: 'double', default: 0.5},
      translationsJson: 'string', // JSON object
      lastUpdated: 'date'
    }
  };
}
```

---

## 🔄 State Management Architecture

### Zustand Store Structure
```typescript
// 1. Main TastingFlow Store
interface TastingFlowState {
  // Current session
  currentSession: TastingSession | null;
  sessionHistory: TastingSession[];
  
  // UI state
  currentStep: number;
  isLoading: boolean;
  errors: Record<string, string>;
  
  // Progress tracking
  stepCompletions: boolean[];
  totalProgress: number; // 0-100
  
  // Actions
  actions: TastingFlowActions;
}

interface TastingFlowActions {
  // Session management
  startNewSession: (coffeeInfo: CoffeeInfo) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  saveCurrentSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  
  // Step navigation
  goToStep: (step: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  
  // Step data updates
  updateCoffeeInfo: (data: Partial<CoffeeInfo>) => void;
  updateFlavorSelection: (data: Partial<FlavorSelection>) => void;
  updateSensoryEvaluation: (data: Partial<SensoryEvaluation>) => void;
  updatePersonalComment: (data: Partial<PersonalComment>) => void;
  
  // Validation
  validateCurrentStep: () => ValidationResult;
  canProceedToNext: () => boolean;
  
  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

// Store implementation
export const useTastingFlowStore = create<TastingFlowState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentSession: null,
        sessionHistory: [],
        currentStep: 1,
        isLoading: false,
        errors: {},
        stepCompletions: [false, false, false, false, false, false],
        totalProgress: 0,
        
        actions: {
          startNewSession: async (coffeeInfo: CoffeeInfo) => {
            set({ isLoading: true });
            
            try {
              const newSession: TastingSession = {
                id: generateUUID(),
                userId: await getCurrentUserId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                coffeeInfo,
                currentStep: 1,
                isCompleted: false,
                isDraft: true,
                version: 1,
                totalTimeSpent: 0,
                stepTimes: [],
                deviceInfo: await getDeviceInfo()
              };
              
              // Save to local DB first
              await RealmService.saveTastingSession(newSession);
              
              set({
                currentSession: newSession,
                currentStep: 1,
                stepCompletions: [true, false, false, false, false, false],
                totalProgress: 16.67,
                isLoading: false
              });
              
              // Background sync to Supabase
              SyncService.syncTastingSession(newSession.id);
              
            } catch (error) {
              set({ 
                isLoading: false, 
                errors: { session: '세션 시작 중 오류가 발생했습니다.' }
              });
            }
          },
          
          updateFlavorSelection: (data: Partial<FlavorSelection>) => {
            const state = get();
            if (!state.currentSession) return;
            
            const updatedSession = {
              ...state.currentSession,
              flavorSelection: {
                ...state.currentSession.flavorSelection,
                ...data
              },
              updatedAt: new Date()
            };
            
            set({ currentSession: updatedSession });
            
            // Auto-save
            debounce(() => {
              RealmService.updateTastingSession(updatedSession);
            }, 2000)();
          },
          
          // ... other actions
        }
      }),
      {
        name: 'tasting-flow-storage',
        partialize: (state) => ({
          currentSession: state.currentSession,
          currentStep: state.currentStep,
          stepCompletions: state.stepCompletions
        })
      }
    )
  )
);
```

### Flavor Recommendation Store
```typescript
interface FlavorRecommendationState {
  // Flavor data
  flavorMaster: FlavorMaster[];
  userFlavorLibrary: PersonalFlavor[];
  
  // Recommendations
  currentRecommendations: FlavorRecommendation[];
  recommendationHistory: FlavorRecommendation[];
  
  // User preferences
  userLevel: 'beginner' | 'intermediate';
  preferredCategories: FlavorCategory[];
  
  // Actions
  actions: FlavorRecommendationActions;
}

export const useFlavorStore = create<FlavorRecommendationState>((set, get) => ({
  flavorMaster: [],
  userFlavorLibrary: [],
  currentRecommendations: [],
  recommendationHistory: [],
  userLevel: 'beginner',
  preferredCategories: [],
  
  actions: {
    loadFlavorMaster: async () => {
      const cached = await RealmService.getFlavorMaster();
      if (cached.length > 0) {
        set({ flavorMaster: cached });
      }
      
      // Background refresh from server
      const fresh = await SupabaseService.getFlavorMaster();
      if (fresh.length > 0) {
        await RealmService.updateFlavorMaster(fresh);
        set({ flavorMaster: fresh });
      }
    },
    
    generateRecommendations: async (
      coffeeInfo: CoffeeInfo,
      userHistory: TastingSession[]
    ) => {
      const recommendations = await FlavorRecommendationEngine.recommend({
        coffeeInfo,
        userHistory,
        userLevel: get().userLevel,
        flavorLibrary: get().userFlavorLibrary
      });
      
      set({ 
        currentRecommendations: recommendations,
        recommendationHistory: [...get().recommendationHistory, ...recommendations]
      });
    }
  }
}));
```

---

## 🔌 Service Layer Architecture

### Core Services
```typescript
// 1. TastingFlowService (Main orchestrator)
class TastingFlowService {
  static async startNewTasting(coffeeInfo: CoffeeInfo): Promise<TastingSession> {
    // Validation
    const validation = await this.validateCoffeeInfo(coffeeInfo);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // Create session
    const session = await this.createTastingSession(coffeeInfo);
    
    // Initialize recommendations
    await FlavorRecommendationEngine.preloadRecommendations(session);
    
    // Start analytics
    AnalyticsService.trackEvent('tasting_started', {
      sessionId: session.id,
      roastery: coffeeInfo.roastery,
      hasOrigin: !!coffeeInfo.origin
    });
    
    return session;
  }
  
  static async completeStep(
    sessionId: string,
    step: number,
    data: any
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Validate step data
      const validation = await this.validateStepData(step, data);
      if (!validation.isValid) {
        return validation;
      }
      
      // Update session
      await this.updateSessionStep(sessionId, step, data);
      
      // Process step-specific logic
      await this.processStepCompletion(sessionId, step, data);
      
      // Track timing
      const completionTime = Date.now() - startTime;
      await this.updateStepTiming(sessionId, step, completionTime);
      
      return { isValid: true };
      
    } catch (error) {
      ErrorService.logError('step_completion_failed', error, {
        sessionId,
        step,
        duration: Date.now() - startTime
      });
      
      return {
        isValid: false,
        errors: ['단계 완료 중 오류가 발생했습니다.']
      };
    }
  }
  
  private static async processStepCompletion(
    sessionId: string,
    step: number,
    data: any
  ): Promise<void> {
    switch (step) {
      case 1: // Coffee Info
        await this.processCoffeeInfoStep(sessionId, data);
        break;
      case 2: // Roaster Notes
        await this.processRoasterNotesStep(sessionId, data);
        break;
      case 3: // Flavor Selection
        await this.processFlavorSelectionStep(sessionId, data);
        break;
      case 4: // Sensory Evaluation
        await this.processSensoryEvaluationStep(sessionId, data);
        break;
      case 5: // Personal Comment
        await this.processPersonalCommentStep(sessionId, data);
        break;
      case 6: // Results
        await this.processResultsStep(sessionId, data);
        break;
    }
  }
  
  private static async processFlavorSelectionStep(
    sessionId: string,
    flavorSelection: FlavorSelection
  ): Promise<void> {
    // Update user flavor library
    await PersonalizationService.updateFlavorLibrary(
      sessionId,
      flavorSelection.selectedFlavors
    );
    
    // Check for level up
    const levelUpResult = await PersonalizationService.checkLevelUp(sessionId);
    if (levelUpResult.shouldLevelUp) {
      await AchievementService.triggerLevelUp(sessionId, levelUpResult.newLevel);
    }
    
    // Generate next step recommendations
    await RecommendationService.generateSensoryRecommendations(sessionId, flavorSelection);
  }
}

// 2. OCRService (Image processing)
class OCRService {
  private static readonly config = {
    maxImageSize: 2048,
    compressionQuality: 0.8,
    timeoutMs: 30000
  };
  
  static async extractCoffeeInfo(imageUri: string): Promise<ExtractedCoffeeInfo> {
    try {
      // Image preprocessing
      const processedImage = await this.preprocessImage(imageUri);
      
      // OCR processing
      const ocrResult = await MLKitOCR.recognizeText(processedImage);
      
      // Information extraction
      const extractedInfo = await this.extractStructuredInfo(ocrResult);
      
      return {
        ...extractedInfo,
        confidence: this.calculateOverallConfidence(extractedInfo),
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      throw new OCRError('이미지 처리 중 오류가 발생했습니다.', error);
    }
  }
  
  private static async extractStructuredInfo(
    ocrResult: OCRResult
  ): Promise<Partial<CoffeeInfo>> {
    const extractors = {
      coffeeName: new CoffeeNameExtractor(),
      roastery: new RoasteryExtractor(),
      origin: new OriginExtractor(),
      process: new ProcessExtractor(),
      roastLevel: new RoastLevelExtractor()
    };
    
    const results: Partial<CoffeeInfo> = {};
    
    await Promise.all(
      Object.entries(extractors).map(async ([field, extractor]) => {
        try {
          const extracted = await extractor.extract(ocrResult.text);
          if (extracted.confidence > 0.6) {
            results[field] = extracted.value;
          }
        } catch (error) {
          console.warn(`Failed to extract ${field}:`, error);
        }
      })
    );
    
    return results;
  }
}

// 3. FlavorRecommendationEngine
class FlavorRecommendationEngine {
  static async recommend(params: RecommendationParams): Promise<FlavorRecommendation[]> {
    const {
      coffeeInfo,
      userHistory,
      userLevel,
      flavorLibrary
    } = params;
    
    // Multi-strategy recommendation
    const strategies = [
      new CoffeeProfileStrategy(coffeeInfo),
      new UserHistoryStrategy(userHistory),
      new ExplorationStrategy(flavorLibrary, userLevel),
      new CollaborativeStrategy(userHistory)
    ];
    
    const recommendations = await Promise.all(
      strategies.map(strategy => strategy.generateRecommendations())
    );
    
    // Merge and rank recommendations
    const merged = this.mergeRecommendations(recommendations);
    const ranked = this.rankByRelevance(merged, params);
    
    return ranked.slice(0, userLevel === 'beginner' ? 5 : 10);
  }
  
  private static mergeRecommendations(
    recommendations: FlavorRecommendation[][]
  ): FlavorRecommendation[] {
    const merged = new Map<string, FlavorRecommendation>();
    
    for (const strategyRecs of recommendations) {
      for (const rec of strategyRecs) {
        const existing = merged.get(rec.flavorId);
        if (existing) {
          // Combine scores
          existing.score = Math.max(existing.score, rec.score);
          existing.sources.push(...rec.sources);
        } else {
          merged.set(rec.flavorId, rec);
        }
      }
    }
    
    return Array.from(merged.values());
  }
}

// 4. SyncService (Online/Offline sync)
class SyncService {
  private static syncQueue: SyncTask[] = [];
  private static isOnline = true;
  
  static async syncTastingSession(sessionId: string): Promise<void> {
    if (!this.isOnline) {
      this.queueForSync({ type: 'session', id: sessionId });
      return;
    }
    
    try {
      const localSession = await RealmService.getTastingSession(sessionId);
      if (!localSession) return;
      
      // Check if remote version is newer
      const remoteSession = await SupabaseService.getTastingSession(sessionId);
      if (remoteSession && remoteSession.updatedAt > localSession.updatedAt) {
        // Conflict resolution
        const resolved = await this.resolveConflict(localSession, remoteSession);
        await RealmService.updateTastingSession(resolved);
        return;
      }
      
      // Upload local changes
      await SupabaseService.upsertTastingSession(localSession);
      await RealmService.markAsSynced(sessionId);
      
    } catch (error) {
      ErrorService.logError('sync_failed', error, { sessionId });
      this.queueForSync({ type: 'session', id: sessionId });
    }
  }
  
  static startBackgroundSync(): void {
    // Process sync queue every 30 seconds
    setInterval(async () => {
      if (this.isOnline && this.syncQueue.length > 0) {
        const task = this.syncQueue.shift();
        if (task) {
          await this.processSyncTask(task);
        }
      }
    }, 30000);
    
    // Listen to network changes
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.processSyncQueue();
      }
    });
  }
}
```

---

## 🚀 Performance Optimization

### Lazy Loading Strategy
```typescript
// Code splitting for steps
const CoffeeInfoStep = lazy(() => import('./screens/CoffeeInfoStep'));
const FlavorSelectionStep = lazy(() => import('./screens/FlavorSelectionStep'));
const SensoryEvaluationStep = lazy(() => import('./screens/SensoryEvaluationStep'));

// Preload next step
const useStepPreloader = (currentStep: number) => {
  useEffect(() => {
    const nextStep = currentStep + 1;
    if (nextStep <= 6) {
      // Preload next step component
      import(`./screens/Step${nextStep}Component`);
    }
  }, [currentStep]);
};

// Data preloading
const useDataPreloader = () => {
  useEffect(() => {
    // Preload flavor master data
    FlavorService.preloadFlavorData();
    
    // Preload user's flavor library
    PersonalizationService.preloadUserLibrary();
    
    // Preload autocomplete data
    AutoCompleteService.preloadSuggestions();
  }, []);
};
```

### Memory Management
```typescript
// Image processing optimization
class ImageOptimizer {
  static async optimizeForOCR(imageUri: string): Promise<string> {
    // Resize to optimal dimensions
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }], // Maintain aspect ratio
      { 
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    
    return resized.uri;
  }
  
  static cleanupProcessedImages(): void {
    // Clean up temporary image files
    FileSystem.deleteAsync(TEMP_IMAGE_DIR, { idempotent: true });
  }
}

// Memory-efficient list rendering
const FlavorList = ({ flavors }: { flavors: FlavorMaster[] }) => {
  const renderFlavor = useCallback(({ item }: { item: FlavorMaster }) => (
    <FlavorItem key={item.id} flavor={item} />
  ), []);
  
  return (
    <FlatList
      data={flavors}
      renderItem={renderFlavor}
      keyExtractor={(item) => item.id}
      windowSize={10}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 60, // Fixed item height
        offset: 60 * index,
        index,
      })}
    />
  );
};
```

### Caching Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Flavor data caching
const useFlavorMaster = () => {
  return useQuery({
    queryKey: ['flavor-master'],
    queryFn: FlavorService.getFlavorMaster,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (rarely changes)
  });
};

// User-specific data caching
const useUserFlavorLibrary = (userId: string) => {
  return useQuery({
    queryKey: ['user-flavor-library', userId],
    queryFn: () => PersonalizationService.getUserFlavorLibrary(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Background cache warming
const useCacheWarming = () => {
  useEffect(() => {
    // Warm up common queries
    queryClient.prefetchQuery({
      queryKey: ['flavor-master'],
      queryFn: FlavorService.getFlavorMaster,
    });
    
    queryClient.prefetchQuery({
      queryKey: ['roastery-suggestions'],
      queryFn: AutoCompleteService.getRoasterySuggestions,
    });
  }, []);
};
```

---

## 🔐 Security & Privacy

### Data Encryption
```typescript
// Sensitive data encryption
class EncryptionService {
  private static readonly algorithm = 'AES-256-GCM';
  
  static async encryptSensitiveData(data: any): Promise<EncryptedData> {
    const key = await this.getDerivedKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv },
      key,
      new TextEncoder().encode(JSON.stringify(data))
    );
    
    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      algorithm: this.algorithm
    };
  }
  
  static async decryptSensitiveData(encrypted: EncryptedData): Promise<any> {
    const key = await this.getDerivedKey();
    
    const decrypted = await crypto.subtle.decrypt(
      { name: encrypted.algorithm, iv: new Uint8Array(encrypted.iv) },
      key,
      new Uint8Array(encrypted.data)
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}

// Personal data anonymization
class PrivacyService {
  static anonymizeTastingData(session: TastingSession): AnonymizedSession {
    return {
      ...session,
      userId: this.hashUserId(session.userId),
      personalComment: this.sanitizeComment(session.personalComment),
      deviceInfo: this.anonymizeDevice(session.deviceInfo),
    };
  }
  
  private static hashUserId(userId: string): string {
    return crypto.createHash('sha256').update(userId).digest('hex');
  }
  
  private static sanitizeComment(comment?: PersonalComment): PersonalComment | undefined {
    if (!comment) return undefined;
    
    return {
      ...comment,
      text: this.removePII(comment.text),
      voiceMemoUri: undefined, // Remove voice data for privacy
    };
  }
}
```

### API Security
```typescript
// Supabase RLS policies
/*
-- Row Level Security for tasting_sessions
ALTER TABLE tasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own sessions"
  ON tasting_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Rate limiting for API calls
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_id UUID,
  action_type TEXT,
  max_requests INTEGER,
  time_window INTERVAL
) RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM api_rate_limits
  WHERE user_id = $1 
    AND action_type = $2
    AND created_at > (NOW() - time_window);
    
  IF request_count >= max_requests THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO api_rate_limits (user_id, action_type, created_at)
  VALUES ($1, $2, NOW());
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
*/

// Client-side security
class SecurityService {
  static validateInput(input: string, type: 'text' | 'email' | 'url'): boolean {
    const patterns = {
      text: /^[a-zA-Z0-9가-힣\s.,!?-]{1,500}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/[^\s<>{}|\\^`[\]]+$/,
    };
    
    return patterns[type].test(input);
  }
  
  static sanitizeUserInput(input: string): string {
    return DOMPurify.sanitize(input.trim());
  }
  
  static async verifyImageSafety(imageUri: string): Promise<boolean> {
    // Check file size and type
    const info = await FileSystem.getInfoAsync(imageUri);
    if (info.size > 10 * 1024 * 1024) { // 10MB limit
      return false;
    }
    
    // Basic MIME type validation
    const response = await fetch(imageUri);
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') ?? false;
  }
}
```

---

## 📊 Analytics & Monitoring

### Event Tracking
```typescript
// Analytics service
class AnalyticsService {
  private static readonly events = {
    // Session events
    TASTING_STARTED: 'tasting_started',
    STEP_COMPLETED: 'step_completed',
    TASTING_COMPLETED: 'tasting_completed',
    TASTING_ABANDONED: 'tasting_abandoned',
    
    // Feature usage
    OCR_USED: 'ocr_used',
    VOICE_INPUT_USED: 'voice_input_used',
    FLAVOR_RECOMMENDATION_ACCEPTED: 'flavor_recommendation_accepted',
    LEVEL_UP_ACHIEVED: 'level_up_achieved',
    
    // Errors
    OCR_FAILED: 'ocr_failed',
    SYNC_FAILED: 'sync_failed',
    STEP_VALIDATION_FAILED: 'step_validation_failed',
  } as const;
  
  static trackEvent(event: string, properties?: Record<string, any>): void {
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId: getCurrentSessionId(),
      userId: getCurrentUserId(),
      appVersion: getAppVersion(),
      platform: Platform.OS,
    };
    
    // Send to analytics providers
    this.sendToSupabase(event, enrichedProperties);
    this.sendToLocalStorage(event, enrichedProperties); // For offline events
  }
  
  static trackTiming(operation: string, duration: number, metadata?: any): void {
    this.trackEvent('timing_metric', {
      operation,
      duration,
      ...metadata,
    });
  }
  
  static trackUserJourney(step: number, action: string, metadata?: any): void {
    this.trackEvent('user_journey', {
      step,
      action,
      ...metadata,
    });
  }
}

// Performance monitoring
class PerformanceMonitor {
  private static performanceObserver?: PerformanceObserver;
  
  static startMonitoring(): void {
    // Monitor slow renders
    if (this.performanceObserver) return;
    
    this.performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 16.67) { // More than 1 frame at 60fps
          AnalyticsService.trackEvent('slow_render', {
            component: entry.name,
            duration: entry.duration,
          });
        }
      });
    });
    
    this.performanceObserver.observe({ entryTypes: ['measure'] });
  }
  
  static measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const startTime = performance.now();
      
      try {
        const result = await operation();
        const duration = performance.now() - startTime;
        
        AnalyticsService.trackTiming(operationName, duration);
        resolve(result);
        
      } catch (error) {
        const duration = performance.now() - startTime;
        AnalyticsService.trackEvent('operation_failed', {
          operation: operationName,
          duration,
          error: error.message,
        });
        reject(error);
      }
    });
  }
}
```

### Error Monitoring
```typescript
// Global error handler
class ErrorService {
  static initialize(): void {
    // Catch JavaScript errors
    ErrorUtils.setGlobalHandler(this.handleGlobalError);
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    // Native crash handler
    crashlytics().onError(this.handleNativeCrash);
  }
  
  static logError(
    type: string,
    error: Error,
    metadata?: Record<string, any>
  ): void {
    const errorData = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    
    // Send to multiple targets
    console.error(`[${type}]`, errorData);
    this.sendToSupabase(errorData);
    this.sendToCrashlytics(errorData);
    
    // Show user-friendly message
    if (this.isCriticalError(type)) {
      this.showErrorToUser(type);
    }
  }
  
  private static handleGlobalError = (error: Error, isFatal: boolean) => {
    this.logError('global_js_error', error, { isFatal });
  };
  
  private static handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.logError('unhandled_promise_rejection', new Error(event.reason));
  };
  
  private static isCriticalError(type: string): boolean {
    const criticalTypes = [
      'session_corruption',
      'data_loss',
      'auth_failure',
      'payment_failure'
    ];
    return criticalTypes.includes(type);
  }
}
```

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// TastingFlowService tests
describe('TastingFlowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRealmService();
    mockSupabaseService();
  });
  
  describe('startNewTasting', () => {
    test('should create valid tasting session', async () => {
      const coffeeInfo: CoffeeInfo = {
        coffeeName: 'Test Coffee',
        roastery: 'Test Roastery'
      };
      
      const session = await TastingFlowService.startNewTasting(coffeeInfo);
      
      expect(session).toBeDefined();
      expect(session.coffeeInfo).toEqual(coffeeInfo);
      expect(session.currentStep).toBe(1);
      expect(session.isCompleted).toBe(false);
    });
    
    test('should handle validation errors', async () => {
      const invalidCoffeeInfo = { coffeeName: '', roastery: '' };
      
      await expect(
        TastingFlowService.startNewTasting(invalidCoffeeInfo)
      ).rejects.toThrow(ValidationError);
    });
  });
  
  describe('completeStep', () => {
    test('should update session with step data', async () => {
      const sessionId = 'test-session';
      const flavorSelection: FlavorSelection = {
        selectedFlavors: [
          { id: '1', name: '베리', category: 'fruity', isNew: false }
        ],
        userLevel: 'beginner',
        selectionMethod: 'category',
        newFlavorsDiscovered: [],
        personalLibraryUsed: [],
        recommendationsShown: [],
        recommendationsUsed: [],
        selectionTime: 30000,
        hesitationFlavors: [],
        confidence: 4
      };
      
      const result = await TastingFlowService.completeStep(
        sessionId,
        3,
        flavorSelection
      );
      
      expect(result.isValid).toBe(true);
      expect(mockRealmService.updateTastingSession).toHaveBeenCalled();
    });
  });
});
```

### Integration Testing
```typescript
// Full flow integration test
describe('TastingFlow Integration', () => {
  test('complete full tasting flow', async () => {
    // Step 1: Coffee Info
    const coffeeInfo = {
      coffeeName: 'Ethiopia Yirgacheffe',
      roastery: 'Blue Bottle Coffee'
    };
    
    const session = await TastingFlowService.startNewTasting(coffeeInfo);
    expect(session.currentStep).toBe(1);
    
    // Step 3: Flavor Selection
    const flavorSelection = {
      selectedFlavors: [
        { id: '1', name: '베리', category: 'fruity', isNew: false },
        { id: '2', name: '꽃향', category: 'floral', isNew: true }
      ],
      userLevel: 'beginner',
      selectionMethod: 'category',
      // ... other required fields
    };
    
    await TastingFlowService.completeStep(session.id, 3, flavorSelection);
    
    // Step 6: Complete session
    const results = {
      matchingScore: 0.8,
      newAchievements: ['flavor_explorer'],
      recommendations: []
    };
    
    await TastingFlowService.completeStep(session.id, 6, results);
    
    const finalSession = await RealmService.getTastingSession(session.id);
    expect(finalSession.isCompleted).toBe(true);
  });
});
```

### Performance Testing
```typescript
// Performance benchmarks
describe('TastingFlow Performance', () => {
  test('step navigation should be fast', async () => {
    const startTime = performance.now();
    
    await navigateToStep(3);
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(300); // < 300ms
  });
  
  test('flavor recommendation should be responsive', async () => {
    const coffeeInfo = { coffeeName: 'Test', roastery: 'Test' };
    const startTime = performance.now();
    
    const recommendations = await FlavorRecommendationEngine.recommend({
      coffeeInfo,
      userHistory: [],
      userLevel: 'beginner',
      flavorLibrary: []
    });
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000); // < 1 second
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
```

---

## 🚀 Deployment & DevOps

### CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: TastingFlow CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      
      # Performance tests
      - run: npm run test:performance
      
      # Security audit
      - run: npm audit --production
      
  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      
      # iOS build
      - run: cd ios && pod install
      - run: npx react-native run-ios --configuration Release
      
  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
      
      # Android build
      - run: cd android && ./gradlew assembleRelease
      
  deploy:
    needs: [build-ios, build-android]
    runs-on: ubuntu-latest
    steps:
      # Deploy to App Store Connect & Google Play
      - run: fastlane ios beta
      - run: fastlane android beta
```

### Environment Configuration
```typescript
// config/environment.ts
interface Environment {
  name: 'development' | 'staging' | 'production';
  api: {
    supabase: {
      url: string;
      anonKey: string;
    };
    openai: {
      apiKey: string;
    };
  };
  features: {
    ocr: boolean;
    voiceInput: boolean;
    aiRecommendations: boolean;
    analytics: boolean;
  };
}

const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    api: {
      supabase: {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL_DEV!,
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_DEV!,
      },
      openai: {
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY_DEV!,
      },
    },
    features: {
      ocr: true,
      voiceInput: false, // Disabled in dev for faster testing
      aiRecommendations: true,
      analytics: false,
    },
  },
  
  production: {
    name: 'production',
    api: {
      supabase: {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      },
      openai: {
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
      },
    },
    features: {
      ocr: true,
      voiceInput: true,
      aiRecommendations: true,
      analytics: true,
    },
  },
};

export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env];
};
```

---

이 기술 명세서를 통해 TastingFlow의 완전한 기술적 구현이 가능합니다. 확장 가능한 아키텍처, 견고한 데이터 모델, 그리고 최적화된 성능을 제공합니다.