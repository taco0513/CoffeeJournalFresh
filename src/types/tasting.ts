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