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

export type TastingMode = 'cafe' | 'home_cafe';

export interface HomeCafeData {
  equipment: {
    grinder?: {
      brand: string;
      model: string;
      setting: string; // "15" or "Medium-Fine"
    };
    brewingMethod: 'V60' | 'Chemex' | 'AeroPress' | 'FrenchPress' | 'Espresso' | 'Other';
    filter?: string;
    other?: string;
  };
  recipe: {
    doseIn: number; // 원두량 (g)
    waterAmount: number; // 물량 (g or ml)
    ratio: string; // "1:15", "1:16"
    waterTemp: number; // 섭씨 온도
    bloomTime?: number; // 블룸 시간 (초)
    totalBrewTime: number; // 총 추출 시간 (초)
    pourPattern?: string; // "3번 나누어 붓기", "센터 포어"
  };
  notes?: {
    previousChange?: string; // "그라인딩 1클릭 더 굵게"
    result?: string; // "산미 증가, 단맛 감소"
    nextExperiment?: string; // "다음엔 물온도 5도 낮춰보기"
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
  
  // Cafe mode specific
  cafeName?: string;
  
  // Home cafe mode specific
  homeCafeData?: HomeCafeData;
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