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

export interface CurrentTasting {
  cafeName: string;
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