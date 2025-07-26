import Realm from 'realm';

// =============================================
// Personal Taste Discovery Schemas for Realm
// =============================================

export const UserTasteProfileSchema: Realm.ObjectSchema = {
  name: 'UserTasteProfile',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: 'string',
    
    // Flavor preferences (stored as JSON string in Realm)
    flavorPreferences: { type: 'string', default: '{}' }, // JSON string
    
    // Basic taste preferences (0-10 scale)
    sweetnessPreference: { type: 'float', default: 5.0 },
    acidityPreference: { type: 'float', default: 5.0 },
    bitternessPreference: { type: 'float', default: 5.0 },
    bodyPreference: { type: 'float', default: 5.0 },
    balancePreference: { type: 'float', default: 5.0 },
    
    // Personal statistics
    totalTastings: { type: 'int', default: 0 },
    uniqueFlavorsTried: { type: 'int', default: 0 },
    vocabularyLevel: { type: 'int', default: 1 },
    tasteDiscoveryRate: { type: 'float', default: 0.0 },
    
    // Metadata
    lastAnalysisAt: 'date?',
    createdAt: { type: 'date', default: new Date() },
    updatedAt: { type: 'date', default: new Date() },
    
    // Sync status
    isSynced: { type: 'bool', default: false },
}
};

export const FlavorLearningProgressSchema: Realm.ObjectSchema = {
  name: 'FlavorLearningProgress',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: 'string',
    
    // Flavor information
    flavorCategory: 'string', // 'fruity', 'nutty', 'floral', etc.
    flavorSubcategory: 'string?', // 'citrus', 'berry', 'stone_fruit', etc.
    specificFlavor: 'string?', // 'lemon', 'orange', 'grapefruit', etc.
    
    // Learning statistics
    exposureCount: { type: 'int', default: 0 },
    identificationCount: { type: 'int', default: 0 },
    accuracyRate: { type: 'float', default: 0.0 },
    confidenceLevel: { type: 'int', default: 1 },
    
    // Learning timestamps
    firstEncounteredAt: 'date?',
    lastPracticedAt: 'date?',
    masteryAchievedAt: 'date?',
    
    createdAt: { type: 'date', default: new Date() },
    
    // Sync status
    isSynced: { type: 'bool', default: false },
}
};

export const UserAchievementSchema: Realm.ObjectSchema = {
  name: 'UserAchievement',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: 'string',
    
    achievementType: 'string', // 'first_tasting', 'flavor_explorer', etc.
    achievementLevel: { type: 'int', default: 1 },
    achievementData: { type: 'string', default: '{}' }, // JSON string
    
    unlockedAt: { type: 'date', default: new Date() },
    progress: { type: 'float', default: 1.0 },
    
    // Sync status
    isSynced: { type: 'bool', default: false },
}
};

export const DailyTasteStatSchema: Realm.ObjectSchema = {
  name: 'DailyTasteStat',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: 'string',
    
    statDate: 'date',
    tastingsCount: { type: 'int', default: 0 },
    newFlavorsDiscovered: { type: 'int', default: 0 },
    vocabularyWordsUsed: { type: 'int', default: 0 },
    tasteAccuracyScore: { type: 'float', default: 0.0 },
    
    createdAt: { type: 'date', default: new Date() },
    
    // Sync status
    isSynced: { type: 'bool', default: false },
}
};

export const AchievementDefinitionSchema: Realm.ObjectSchema = {
  name: 'AchievementDefinition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    
    achievementType: { type: 'string', indexed: true },
    title: 'string',
    description: 'string',
    icon: 'string',
    rarity: 'string', // 'common', 'rare', 'epic', 'legendary'
    category: 'string', // 'first_steps', 'consistency', 'flavor_explorer', etc.
    
    requirements: 'string', // JSON string
    rewards: 'string', // JSON string
    
    isActive: { type: 'bool', default: true },
    createdAt: { type: 'date', default: new Date() },
}
};

// Update existing TastingRecord schema
export const TastingRecordSchemaUpdate = {
  personalInsights: { type: 'string', default: '{}' }, // JSON string
  vocabularyUsed: { type: 'list', objectType: 'string', default: [] },
  difficultyLevel: { type: 'int', default: 1 },
  learningPoints: { type: 'int', default: 0 },
  tasteConfidence: { type: 'float', default: 0.5 },
};

// Helper functions for JSON serialization
export const parseFlavorPreferences = (jsonString: string): Record<string, number> => {
  try {
    return JSON.parse(jsonString);
} catch {
    return {};
}
};

export const stringifyFlavorPreferences = (preferences: Record<string, number>): string => {
  return JSON.stringify(preferences);
};

export const parseAchievementData = (jsonString: string): unknown => {
  try {
    return JSON.parse(jsonString);
} catch {
    return {};
}
};

export const stringifyAchievementData = (data: unknown): string => {
  return JSON.stringify(data);
};

// All schemas to be added to Realm configuration
export const PersonalTasteSchemas = [
  UserTasteProfileSchema,
  FlavorLearningProgressSchema,
  UserAchievementSchema,
  DailyTasteStatSchema,
  AchievementDefinitionSchema,
];