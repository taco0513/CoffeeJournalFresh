import { useTastingStore } from '../stores/tastingStore';
import { FlavorPath, SelectedSensoryExpression } from '../types/tasting';
import { MouthfeelType } from '../types/sensory';

// Sample dummy data collections
const COFFEE_NAMES = [
  '에티오피아 예가체프',
  '콜롬비아 수프레모',
  '케냐 AA',
  '과테말라 안티구아',
  '브라질 산토스',
  '코스타리카 따라주',
  '파나마 게이샤',
  '하와이 코나',
];

const ROASTERS = [
  '커피 리브레',
  '테라로사',
  '앤트러사이트',
  '센터커피',
  '프릳츠',
  '커피몽타주',
  '커피볶는곰',
  '나무사이로',
];

const ORIGINS = [
  '에티오피아',
  '콜롬비아',
  '브라질',
  '케냐',
  '과테말라',
  '코스타리카',
  '파나마',
  '페루',
];

const VARIETIES = [
  '버번',
  '타이피카',
  '게이샤',
  '카투아이',
  '카투라',
  'SL28',
  'SL34',
  '파카마라',
];

const PROCESSES = [
  'Washed',
  'Natural',
  'Honey',
  'Anaerobic',
  'Semi-Washed',
  'Carbonic Maceration',
];

const ROAST_LEVELS = [
  'Light',
  'Medium Light',
  'Medium',
  'Medium Dark',
  'Dark',
];

const ROASTER_NOTES = [
  '오렌지, 베르가못, 꿀의 향미가 조화롭게 어우러집니다',
  '다크 초콜릿과 캐러멜의 달콤함, 은은한 견과류 향',
  '밝은 산미와 함께 느껴지는 열대과일의 상큼함',
  '부드러운 바디감과 함께 느껴지는 브라운 슈가의 단맛',
  '플로럴한 향과 함께 복숭아, 살구의 과일향이 매력적',
];

const PERSONAL_COMMENTS = [
  '정말 맛있는 커피! 산미가 적당하고 바디감이 좋아요',
  '향이 너무 좋네요. 다음에 또 마시고 싶은 커피',
  '첫 모금부터 인상적이었어요. 과일향이 매력적',
  '부드럽고 균형잡힌 맛. 매일 마셔도 질리지 않을 것 같아요',
  '특별한 날에 마시기 좋은 커피. 향미가 복잡하고 흥미로워요',
];

const KOREAN_EXPRESSIONS = {
  acidity: ['싱그러운', '발랄한', '톡 쏘는'],
  sweetness: ['달콤한', '꿀 같은', '부드러운'],
  bitterness: ['고소한', '스모키한', '묵직한'],
  body: ['크리미한', '벨벳 같은', '가벼운'],
  aftertaste: ['깔끔한', '길게 남는', '산뜻한'],
  balance: ['조화로운', '균형잡힌', '자연스러운'],
};

const HOME_CAFE_EQUIPMENT = {
  grinders: [
    { brand: '1Zpresso', model: 'K-Plus' },
    { brand: '커맨던트', model: 'C40' },
    { brand: '바라짜', model: 'Encore' },
    { brand: '펠로우', model: 'Ode' },
  ],
  brewingMethods: ['V60', 'Chemex', 'Aeropress', 'French Press', 'Origami'],
  filters: ['하리오 표백', '카페크 애비드', '칼리타 웨이브', '하리오 미표백'],
};

export class DummyDataService {
  // Coffee Info screen
  static async fillCoffeeInfo() {
    const store = useTastingStore.getState();
    const randomIndex = Math.floor(Math.random() * COFFEE_NAMES.length);
    
    // Check if we're in cafe mode (need to fill cafe name)
    if (store.currentTasting.mode === 'cafe') {
      const cafeNames = ['블루보틀 카페', '스타벅스', '앤트러사이트', '프릳츠 매장', '테라로사', 'Home'];
      store.updateField('cafeName', cafeNames[Math.floor(Math.random() * cafeNames.length)]);
    }
    
    store.updateField('roastery', ROASTERS[Math.floor(Math.random() * ROASTERS.length)]);
    store.updateField('coffeeName', COFFEE_NAMES[randomIndex]);
    store.updateField('origin', ORIGINS[Math.floor(Math.random() * ORIGINS.length)]);
    store.updateField('variety', VARIETIES[Math.floor(Math.random() * VARIETIES.length)]);
    store.updateField('process', PROCESSES[Math.floor(Math.random() * PROCESSES.length)]);
    store.updateField('altitude', `${1200 + Math.floor(Math.random() * 800)}m`);
    store.updateField('roastLevel', ROAST_LEVELS[Math.floor(Math.random() * ROAST_LEVELS.length)]);
    store.updateField('temperature', Math.random() > 0.5 ? 'hot' : 'cold');
  }

  // Home Cafe screen
  static async fillHomeCafeData() {
    const store = useTastingStore.getState();
    const grinder = HOME_CAFE_EQUIPMENT.grinders[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.grinders.length)];
    
    store.updateHomeCafeData({
      equipment: {
        grinder: {
          brand: grinder.brand,
          model: grinder.model,
          setting: `${15 + Math.floor(Math.random() * 10)}`,
        },
        brewingMethod: HOME_CAFE_EQUIPMENT.brewingMethods[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.brewingMethods.length)],
        filter: HOME_CAFE_EQUIPMENT.filters[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.filters.length)],
        water: '삼다수',
        other: '',
      },
      recipe: {
        doseIn: 15 + Math.floor(Math.random() * 5),
        waterAmount: 240 + Math.floor(Math.random() * 60),
        ratio: '1:16',
        waterTemp: 88 + Math.floor(Math.random() * 8),
        bloomTime: 30 + Math.floor(Math.random() * 15),
        totalBrewTime: 180 + Math.floor(Math.random() * 60),
        pourPattern: '30-70-70-70',
      },
      notes: {
        previousChange: '그라인더 세팅을 조금 더 굵게 조정',
        result: '추출 시간이 줄어들고 산미가 더 밝아짐',
        nextExperiment: '물 온도를 2도 낮춰서 테스트 예정',
      },
    });
  }

  // Flavor selection screen
  static async selectRandomFlavors() {
    const store = useTastingStore.getState();
    const flavors: FlavorPath[] = [
      { level1: 'fruity', level2: 'berry', level3: 'blueberry' },
      { level1: 'sweet', level2: 'chocolate', level3: 'dark_chocolate' },
      { level1: 'nutty', level2: 'nutty', level3: 'almond' },
    ];
    
    // Randomly select 2-3 flavors
    const count = 2 + Math.floor(Math.random() * 2);
    const selectedFlavors = flavors.slice(0, count);
    store.setSelectedFlavors(selectedFlavors);
  }

  // Sensory evaluation screens
  static async fillSensoryData() {
    const store = useTastingStore.getState();
    
    store.updateField('body', 2 + Math.floor(Math.random() * 4));
    store.updateField('acidity', 2 + Math.floor(Math.random() * 4));
    store.updateField('sweetness', 2 + Math.floor(Math.random() * 4));
    store.updateField('finish', 2 + Math.floor(Math.random() * 4));
    store.updateField('bitterness', 1 + Math.floor(Math.random() * 3));
    store.updateField('balance', 3 + Math.floor(Math.random() * 3));
    
    const mouthfeelOptions: MouthfeelType[] = ['Clean', 'Creamy', 'Juicy', 'Silky'];
    store.updateField('mouthfeel', mouthfeelOptions[Math.floor(Math.random() * mouthfeelOptions.length)]);
  }

  // Korean sensory expressions
  static async selectKoreanExpressions() {
    const store = useTastingStore.getState();
    const expressions: SelectedSensoryExpression[] = [];
    
    // Select 2-3 expressions from different categories
    const categories = Object.keys(KOREAN_EXPRESSIONS);
    const selectedCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    selectedCategories.forEach((category) => {
      const categoryExpressions = KOREAN_EXPRESSIONS[category as keyof typeof KOREAN_EXPRESSIONS];
      const randomExpression = categoryExpressions[Math.floor(Math.random() * categoryExpressions.length)];
      
      expressions.push({
        categoryId: category,
        expressionId: `${category}_${Math.floor(Math.random() * 10)}`,
        korean: randomExpression,
        english: '',
      });
    });
    
    store.setSelectedSensoryExpressions(expressions);
  }

  // Personal comment screen
  static async fillPersonalComment() {
    const store = useTastingStore.getState();
    const comment = PERSONAL_COMMENTS[Math.floor(Math.random() * PERSONAL_COMMENTS.length)];
    store.updateField('personalComment', comment);
  }

  // Roaster notes screen
  static async fillRoasterNotes() {
    const store = useTastingStore.getState();
    const notes = ROASTER_NOTES[Math.floor(Math.random() * ROASTER_NOTES.length)];
    store.updateField('roasterNotes', notes);
  }

  // Generate complete tasting record
  static async generateCompleteTastingRecord() {
    await this.fillCoffeeInfo();
    await this.selectRandomFlavors();
    await this.fillSensoryData();
    await this.selectKoreanExpressions();
    await this.fillPersonalComment();
    await this.fillRoasterNotes();
    
    // If home cafe mode, add home cafe data
    const store = useTastingStore.getState();
    if (store.currentTasting.mode === 'home_cafe') {
      await this.fillHomeCafeData();
    }
  }
}