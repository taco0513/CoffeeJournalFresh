export type RootStackParamList = {
    Home: undefined;
    HomeMain: undefined;
    ProfileMain: undefined;
    CoffeeInfo: { ocrText?: string } | undefined;
    // OCRScan: undefined; // Moved to feature_backlog
    // OCRResult: { parsedInfo: any; rawTexts: string[] }; // Moved to feature_backlog
    RoasterNotes: undefined;
    UnifiedFlavor: undefined;
    Sensory: undefined;
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