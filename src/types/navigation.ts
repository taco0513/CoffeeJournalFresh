export type RootStackParamList = {
    Home: undefined;
    HomeMain: undefined;
    ProfileMain: undefined;
    ModeSelection: undefined;
    CoffeeInfo: { ocrText?: string } | undefined;
    HomeCafe: undefined;
    // OCRScan: undefined; // Moved to feature_backlog
    // OCRResult: { parsedInfo: any; rawTexts: string[] }; // Moved to feature_backlog
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
    DataTest: undefined;
    DeveloperScreen: undefined;
  };

// Main tab navigation
export type MainTabParamList = {
    Home: undefined;
    Journal: undefined;
    Profile: undefined;
  };