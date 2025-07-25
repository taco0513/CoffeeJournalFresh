export interface FlavorPath {
  level1?: string;
  level2?: string;
  level3?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  error: string | null;
}

export interface SelectedFlavors extends FlavorPath {}

export interface SensoryAttributes {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: string;
  bitterness?: number;
  balance?: number;
}

export interface SelectedSensoryExpression {
  categoryId: string;
  expressionId: string;
  korean: string;
  english: string;
  emoji: string;
  intensity: number;
  selected: boolean;
}

export type TastingMode = 'cafe' | 'home_cafe' | 'lab';

export type PouroverDripper = 
  | 'V60' 
  | 'KalitaWave' 
  | 'Origami' 
  | 'Chemex' 
  | 'FellowStagg' 
  | 'April' 
  | 'Orea' 
  | 'FlowerDripper'
  | 'BluebottleDripper'
  | 'TimemoreCrystalEye'
  | 'Other';

// Simplified dripper options for HomeCafe mode
export type SimpleDripper = 'V60' | 'KalitaWave' | 'Chemex' | 'Other';

export type PourTechnique = 
  | 'center' // 센터 포어
  | 'spiral' // 스파이럴
  | 'pulse' // 펄스 포어
  | 'continuous' // 연속 붓기
  | 'multiStage'; // 다단계 붓기

export type FilterType = 
  | 'bleached' // 표백 필터
  | 'natural' // 갈색 필터
  | 'wave' // 웨이브 필터
  | 'chemex' // 케멕스 전용
  | 'metal' // 메탈 필터
  | 'cloth'; // 융 필터

// Simplified HomeCafe data for hobby users
export interface SimpleHomeCafeData {
  dripper: SimpleDripper;
  recipe: {
    coffeeAmount: number;  // g
    waterAmount: number;   // ml
    brewTime?: number;     // seconds (자동 타이머)
    lapTimes?: { time: number; label: string }[]; // 랩 타임 기록
  };
  waterTemp?: number;      // °C (선택)
  grindNote?: string;      // "2클릭 더 굵게" (선택)
  quickNote?: string;      // 추출 노트 (선택)
}

// Advanced HomeCafe data (current full version)
export interface HomeCafeData {
  equipment: {
    grinder?: {
      brand: string;
      model: string;
      setting: string; // "15클릭" or "중간-굵게"
    };
    dripper: PouroverDripper;
    dripperSize?: string; // "01", "02", "03" for V60, "155", "185" for Wave
    filter: FilterType;
    server?: string; // 서버/저그 브랜드
    scale?: string; // 저울 브랜드
    kettle?: string; // 주전자 브랜드
  };
  recipe: {
    doseIn: number; // 원두량 (g)
    waterAmount: number; // 물량 (g)
    ratio: string; // "1:15", "1:16"
    waterTemp: number; // 물 온도 (°C)
    grindSize?: string; // 그라인드 사이즈
    
    // Bloom phase
    bloomWater: number; // 블룸 물량 (g)
    bloomTime: number; // 블룸 시간 (초)
    bloomAgitation?: boolean; // 블룸 교반 여부
    
    // Pour details
    pourTechnique: PourTechnique;
    numberOfPours: number; // 붓기 횟수
    pourIntervals?: number[]; // 각 붓기 시간 간격 (초)
    
    // Time
    totalBrewTime: number; // 총 추출 시간 (초)
    drawdownTime?: number; // 드로우다운 시간 (초)
    
    // Technique
    agitation?: 'stir' | 'swirl' | 'tap' | 'none'; // 교반 방법
    agitationTiming?: string; // "블룸 후", "마지막 붓기 후"
  };
  notes?: {
    grindAdjustment?: string; // "1클릭 더 굵게"
    channeling?: boolean; // 채널링 발생 여부
    mudBed?: boolean; // 머드베드 발생 여부
    tasteResult?: string; // "밸런스 좋음, 단맛 증가"
    nextExperiment?: string; // "다음엔 물온도 2도 낮춰보기"
  };
}

// Lab mode data (extends HomeCafe with professional features)
export interface LabModeData extends HomeCafeData {
  tds?: number;
  extractionYield?: number;
  comparison?: {
    variable: string;
    previousValue: any;
    currentValue: any;
    result: string;
  };
  agitation?: {
    method: 'none' | 'stir' | 'swirl' | 'tap';
    timing: string[];
  };
}

export interface CurrentTasting {
  // Mode selection
  mode: TastingMode;
  
  // Common fields
  roastery: string;
  coffeeName: string;
  origin: string;
  variety: string;
  process: string;
  altitude: string;
  roastLevel: string;
  temperature: 'hot' | 'cold';
  roasterNotes: string;
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  bitterness: number;
  balance: number;
  mouthfeel: string;
  personalComment: string;
  selectedFlavors?: FlavorPath[];
  
  // Additional derived properties
  flavorProfile?: string[];
  overallScore?: number;
  matchScoreTotal?: number;
  brewingMethod?: string;
  
  // Cafe mode specific
  cafeName?: string;
  
  // Home cafe mode specific
  homeCafeData?: HomeCafeData;
  simpleHomeCafeData?: SimpleHomeCafeData;
  
  // Lab mode specific
  labModeData?: LabModeData;
}

export interface MatchScore {
  total: number;
  flavorScore: number;
  sensoryScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  category: string;
  icon?: string;
}