export type RootStackParamList = {
    Home: undefined;
    HomeMain: undefined;
    ProfileMain: undefined;
    CoffeeInfo: { ocrText?: string } | undefined;
    OCRScan: undefined;
    OCRResult: { parsedInfo: any; rawTexts: string[] };
    RoasterNotes: undefined;
    UnifiedFlavor: undefined;
    FlavorLevel1: undefined;
    FlavorLevel2: undefined;
    FlavorLevel3: undefined;
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