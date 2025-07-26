import { PouroverDripper, FilterType, PourTechnique } from '../types/tasting';

// Dripper configurations with Korean names and characteristics
export const dripperConfigs = {
  V60: { 
    name: 'V60', 
    korean: '브이60',
    sizes: ['01 (1-2잔)', '02 (1-4잔)', '03 (3-6잔)'],
    defaultRatio: '1:15',
    icon: ''
},
  KalitaWave: { 
    name: 'Kalita Wave', 
    korean: '칼리타 웨이브',
    sizes: ['155 (1-2잔)', '185 (2-4잔)'],
    defaultRatio: '1:16',
    icon: ''
},
  Origami: { 
    name: 'Origami', 
    korean: '오리가미',
    sizes: ['S (1-2잔)', 'M (1-4잔)'],
    defaultRatio: '1:15',
    icon: ''
},
  Chemex: { 
    name: 'Chemex', 
    korean: '케멕스',
    sizes: ['3컵', '6컵', '8컵', '10컵'],
    defaultRatio: '1:17',
    icon: ''
},
  FellowStagg: { 
    name: 'Fellow Stagg', 
    korean: '펠로우 스태그',
    sizes: ['XF (1-2잔)', 'X (2-4잔)'],
    defaultRatio: '1:16',
    icon: ''
},
  April: { 
    name: 'April', 
    korean: '에이프릴',
    sizes: ['Plastic (1-2잔)', 'Ceramic (2-4잔)'],
    defaultRatio: '1:15',
    icon: ''
},
  Orea: { 
    name: 'Orea', 
    korean: '오레아',
    sizes: ['V3 (1-3잔)', 'Barrel (2-5잔)'],
    defaultRatio: '1:16',
    icon: ''
},
  FlowerDripper: { 
    name: 'Flower Dripper', 
    korean: '플라워 드리퍼',
    sizes: ['1-2잔', '2-4잔'],
    defaultRatio: '1:15',
    icon: ''
},
  BlueBottle: { 
    name: 'Blue Bottle', 
    korean: '블루보틀',
    sizes: ['1-2잔', '2-4잔'],
    defaultRatio: '1:16',
    icon: ''
},
  TimemoreCrystalEye: { 
    name: 'Timemore Crystal Eye', 
    korean: '타임모어 크리스탈아이',
    sizes: ['PC-1 (1-2잔)', 'PC-2 (2-4잔)'],
    defaultRatio: '1:15',
    icon: ''
}
};

export const filterTypes = [
  { id: 'bleached', label: '표백 필터', description: '깔끔한 맛' },
  { id: 'natural', label: '갈색 필터', description: '바디감 있는 맛' },
  { id: 'wave', label: '웨이브 필터', description: '칼리타 전용' },
  { id: 'chemex', label: '케멕스 필터', description: '두꺼운 종이' },
  { id: 'metal', label: '메탈 필터', description: '오일 통과' },
  { id: 'cloth', label: '융 필터', description: '부드러운 맛' },
];

export const pourTechniques = [
  { id: 'center', label: '센터 포어', description: '중앙 집중' },
  { id: 'spiral', label: '스파이럴', description: '나선형 붓기' },
  { id: 'pulse', label: '펄스 포어', description: '단계별 붓기' },
  { id: 'continuous', label: '연속 붓기', description: '끊김 없이' },
  { id: 'multiStage', label: '다단계', description: '여러 번 나눠' },
];

// Recipe presets for different drippers
export const recipePresets = {
  V60: {
    light: {
      name: '라이트 로스트',
      ratio: '1:15',
      waterTemp: 94,
      grindSize: '중세',
      bloomTime: 30,
      totalTime: 180,
      technique: 'spiral',
      description: '밝은 산미를 살리는 레시피'
  },
    medium: {
      name: '미디엄 로스트',
      ratio: '1:15.5',
      waterTemp: 92,
      grindSize: '중간',
      bloomTime: 30,
      totalTime: 200,
      technique: 'pulse',
      description: '균형잡힌 기본 레시피'
  },
    dark: {
      name: '다크 로스트',
      ratio: '1:16',
      waterTemp: 88,
      grindSize: '약간 굵게',
      bloomTime: 45,
      totalTime: 220,
      technique: 'center',
      description: '쓴맛을 줄이는 레시피'
  }
},
  KalitaWave: {
    classic: {
      name: '클래식',
      ratio: '1:16',
      waterTemp: 92,
      grindSize: '중간',
      bloomTime: 45,
      totalTime: 240,
      technique: 'continuous',
      description: '칼리타 기본 레시피'
  },
    sweet: {
      name: '단맛 강조',
      ratio: '1:15.5',
      waterTemp: 90,
      grindSize: '약간 세게',
      bloomTime: 30,
      totalTime: 220,
      technique: 'pulse',
      description: '단맛을 끌어내는 레시피'
  }
},
  Chemex: {
    classic: {
      name: '케멕스 클래식',
      ratio: '1:17',
      waterTemp: 93,
      grindSize: '중굵게',
      bloomTime: 45,
      totalTime: 300,
      technique: 'spiral',
      description: '깔끔한 케멕스 스타일'
  },
    strong: {
      name: '진한 맛',
      ratio: '1:15',
      waterTemp: 94,
      grindSize: '중간',
      bloomTime: 30,
      totalTime: 280,
      technique: 'center',
      description: '농도 있는 케멕스'
  }
}
};

// Default form data
export const defaultHomeCafeData = {
  equipment: {
    dripper: 'V60' as PouroverDripper,
    filter: 'bleached' as FilterType,
},
  recipe: {
    doseIn: 15,
    waterAmount: 225,
    ratio: '1:15',
    waterTemp: 92,
    grindSize: '중간',
    bloomTime: 30,
    bloomWater: 30,
    totalBrewTime: 180,
    pourTechnique: 'spiral' as PourTechnique,
    numberOfPours: 3,
    bloomAgitation: false,
    pourIntervals: [30, 60, 90],
    drawdownTime: 30,
    agitation: 'none' as const,
    agitationTiming: '',
},
  notes: {
    grindAdjustment: '',
    tasteResult: '',
    nextExperiment: '',
}
};

// Helper functions
export const calculateRatio = (doseIn: number, waterAmount: number): string => {
  if (doseIn <= 0) return '1:0';
  const ratio = Math.round((waterAmount / doseIn) * 10) / 10;
  return `1:${ratio}`;
};

export const calculateWaterAmount = (doseIn: number, ratioString: string): number => {
  const ratio = parseFloat(ratioString.split(':')[1] || '15');
  return Math.round(doseIn * ratio);
};

export const getDefaultBloomWater = (doseIn: number): number => {
  return Math.round(doseIn * 2); // 2x dose for bloom
};

export const getDripperConfig = (dripper: PouroverDripper) => {
  return dripperConfigs[dripper as keyof typeof dripperConfigs] || dripperConfigs.V60;
};