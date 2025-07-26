export type RootStackParamList = {
    // Auth screens
    Auth: undefined;
    Onboarding: undefined;
    
    // Main screens
    Main: undefined;
    Home: undefined;
    HomeMain: undefined;
    ProfileMain: undefined;
    ModeSelection: undefined;
    CoffeeInfo: { ocrText?: string } | undefined;
    HomeCafe: undefined;
    // OCRScan: undefined; // Moved to feature_backlog
    // OCRResult: { parsedInfo: unknown; rawTexts: string[] }; // Moved to feature_backlog
    RoasterNotes: undefined;
    UnifiedFlavor: undefined;
    Sensory: undefined;
    ExperimentalData: undefined;  // New: Home Cafe quantitative data
    SensoryEvaluation: undefined; // New: Home Cafe Korean expressions
    PersonalComment: undefined;
    Result: undefined;
    TastingDetail: { tastingId: string };
    Stats: undefined;
    Search: undefined;
    Export: undefined;
    PersonalTasteDashboard: undefined;
    AchievementGallery: undefined;
    DataTest: undefined;
    DeveloperScreen: undefined;
    MarketConfigurationTester: undefined;
    PerformanceDashboard: undefined;
    I18nValidation: undefined;
    Testing: undefined;
};

// Main tab navigation
export type MainTabParamList = {
    Home: undefined;
    Journal: undefined;
    AddCoffee: undefined;
    Achievements: undefined;
    Profile: undefined;
};