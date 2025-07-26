// SCA (Specialty Coffee Association) Flavor Wheel Data
// Based on the official SCA Coffee Taster's Flavor Wheel
// 4-level hierarchical structure

export interface FlavorNode {
  id: string;
  name: string;
  nameKo: string; // Korean translation
  level: number;
  parent?: string;
  color?: string; // For visual representation
  children?: string[]; // Child node IDs
}

export const flavorWheel: Record<string, FlavorNode> = {
  // Level 1 - Main Categories
  'fruity': {
    id: 'fruity',
    name: 'Fruity',
    nameKo: '과일',
    level: 1,
    color: '#FF6B6B',
    children: ['berry', 'dried-fruit', 'other-fruit', 'citrus-fruit']
},
  'sour-fermented': {
    id: 'sour-fermented',
    name: 'Sour/Fermented',
    nameKo: '신맛/발효',
    level: 1,
    color: '#4ECDC4',
    children: ['sour', 'alcohol-fermented']
},
  'green-vegetative': {
    id: 'green-vegetative',
    name: 'Green/Vegetative',
    nameKo: '녹색/식물성',
    level: 1,
    color: '#95E1D3',
    children: ['olive-oil', 'raw', 'green-vegetative-sub', 'beany']
},
  'other': {
    id: 'other',
    name: 'Other',
    nameKo: '기타',
    level: 1,
    color: '#C7CEEA',
    children: ['papery-musty', 'chemical', 'rubber', 'petroleum', 'medicinal', 'skunky', 'meaty-brothy']
},
  'roasted': {
    id: 'roasted',
    name: 'Roasted',
    nameKo: '로스팅',
    level: 1,
    color: '#8B4513',
    children: ['pipe-tobacco', 'tobacco', 'burnt', 'cereal']
},
  'spices': {
    id: 'spices',
    name: 'Spices',
    nameKo: '향신료',
    level: 1,
    color: '#FFA07A',
    children: ['pungent', 'pepper', 'brown-spice', 'anise', 'nutmeg', 'cinnamon', 'clove']
},
  'nutty-cocoa': {
    id: 'nutty-cocoa',
    name: 'Nutty/Cocoa',
    nameKo: '견과류/코코아',
    level: 1,
    color: '#D2691E',
    children: ['nutty', 'cocoa']
},
  'sweet': {
    id: 'sweet',
    name: 'Sweet',
    nameKo: '단맛',
    level: 1,
    color: '#FFB6C1',
    children: ['brown-sugar', 'vanilla', 'vanillin', 'overall-sweet', 'sweet-aromatics']
},
  'floral': {
    id: 'floral',
    name: 'Floral',
    nameKo: '꽃',
    level: 1,
    color: '#DDA0DD',
    children: ['black-tea', 'floral-sub']
},

  // Level 2 - Subcategories
  // Fruity subcategories
  'berry': {
    id: 'berry',
    name: 'Berry',
    nameKo: '베리류',
    level: 2,
    parent: 'fruity',
    children: ['blackberry', 'raspberry', 'blueberry', 'strawberry']
},
  'dried-fruit': {
    id: 'dried-fruit',
    name: 'Dried Fruit',
    nameKo: '건조 과일',
    level: 2,
    parent: 'fruity',
    children: ['raisin', 'prune']
},
  'other-fruit': {
    id: 'other-fruit',
    name: 'Other Fruit',
    nameKo: '기타 과일',
    level: 2,
    parent: 'fruity',
    children: ['coconut', 'cherry', 'pomegranate', 'pineapple', 'grape', 'apple', 'peach', 'pear']
},
  'citrus-fruit': {
    id: 'citrus-fruit',
    name: 'Citrus Fruit',
    nameKo: '감귤류',
    level: 2,
    parent: 'fruity',
    children: ['grapefruit', 'orange', 'lemon', 'lime']
},

  // Sour/Fermented subcategories
  'sour': {
    id: 'sour',
    name: 'Sour',
    nameKo: '신맛',
    level: 2,
    parent: 'sour-fermented',
    children: ['sour-aromatics', 'acetic-acid', 'butyric-acid', 'isovaleric-acid', 'citric-acid', 'malic-acid']
},
  'alcohol-fermented': {
    id: 'alcohol-fermented',
    name: 'Alcohol/Fermented',
    nameKo: '알코올/발효',
    level: 2,
    parent: 'sour-fermented',
    children: ['winey', 'whiskey', 'fermented', 'overripe']
},

  // Green/Vegetative subcategories
  'olive-oil': {
    id: 'olive-oil',
    name: 'Olive Oil',
    nameKo: '올리브 오일',
    level: 2,
    parent: 'green-vegetative'
},
  'raw': {
    id: 'raw',
    name: 'Raw',
    nameKo: '날것',
    level: 2,
    parent: 'green-vegetative'
},
  'green-vegetative-sub': {
    id: 'green-vegetative-sub',
    name: 'Green/Vegetative',
    nameKo: '녹색/식물성',
    level: 2,
    parent: 'green-vegetative',
    children: ['under-ripe', 'peapod', 'fresh', 'dark-green', 'vegetative', 'hay-like', 'herb-like']
},
  'beany': {
    id: 'beany',
    name: 'Beany',
    nameKo: '콩',
    level: 2,
    parent: 'green-vegetative'
},

  // Nutty/Cocoa subcategories
  'nutty': {
    id: 'nutty',
    name: 'Nutty',
    nameKo: '견과류',
    level: 2,
    parent: 'nutty-cocoa',
    children: ['peanuts', 'hazelnut', 'almond']
},
  'cocoa': {
    id: 'cocoa',
    name: 'Cocoa',
    nameKo: '코코아',
    level: 2,
    parent: 'nutty-cocoa',
    children: ['chocolate', 'dark-chocolate']
},

  // Sweet subcategories
  'brown-sugar': {
    id: 'brown-sugar',
    name: 'Brown Sugar',
    nameKo: '흑설탕',
    level: 2,
    parent: 'sweet',
    children: ['molasses', 'maple-syrup', 'caramelized', 'honey']
},
  'vanilla': {
    id: 'vanilla',
    name: 'Vanilla',
    nameKo: '바닐라',
    level: 2,
    parent: 'sweet'
},
  'vanillin': {
    id: 'vanillin',
    name: 'Vanillin',
    nameKo: '바닐린',
    level: 2,
    parent: 'sweet'
},
  'overall-sweet': {
    id: 'overall-sweet',
    name: 'Overall Sweet',
    nameKo: '전반적 단맛',
    level: 2,
    parent: 'sweet'
},
  'sweet-aromatics': {
    id: 'sweet-aromatics',
    name: 'Sweet Aromatics',
    nameKo: '달콤한 향',
    level: 2,
    parent: 'sweet'
},

  // Floral subcategories
  'black-tea': {
    id: 'black-tea',
    name: 'Black Tea',
    nameKo: '홍차',
    level: 2,
    parent: 'floral'
},
  'floral-sub': {
    id: 'floral-sub',
    name: 'Floral',
    nameKo: '꽃',
    level: 2,
    parent: 'floral',
    children: ['chamomile', 'rose', 'jasmine']
},

  // Level 3 - Specific flavors
  // Berry specifics
  'blackberry': {
    id: 'blackberry',
    name: 'Blackberry',
    nameKo: '블랙베리',
    level: 3,
    parent: 'berry'
},
  'raspberry': {
    id: 'raspberry',
    name: 'Raspberry',
    nameKo: '라즈베리',
    level: 3,
    parent: 'berry'
},
  'blueberry': {
    id: 'blueberry',
    name: 'Blueberry',
    nameKo: '블루베리',
    level: 3,
    parent: 'berry'
},
  'strawberry': {
    id: 'strawberry',
    name: 'Strawberry',
    nameKo: '딸기',
    level: 3,
    parent: 'berry'
},

  // Citrus specifics
  'grapefruit': {
    id: 'grapefruit',
    name: 'Grapefruit',
    nameKo: '자몽',
    level: 3,
    parent: 'citrus-fruit'
},
  'orange': {
    id: 'orange',
    name: 'Orange',
    nameKo: '오렌지',
    level: 3,
    parent: 'citrus-fruit'
},
  'lemon': {
    id: 'lemon',
    name: 'Lemon',
    nameKo: '레몬',
    level: 3,
    parent: 'citrus-fruit'
},
  'lime': {
    id: 'lime',
    name: 'Lime',
    nameKo: '라임',
    level: 3,
    parent: 'citrus-fruit'
},

  // Chocolate specifics
  'chocolate': {
    id: 'chocolate',
    name: 'Chocolate',
    nameKo: '초콜릿',
    level: 3,
    parent: 'cocoa'
},
  'dark-chocolate': {
    id: 'dark-chocolate',
    name: 'Dark Chocolate',
    nameKo: '다크 초콜릿',
    level: 3,
    parent: 'cocoa'
},

  // Floral specifics
  'chamomile': {
    id: 'chamomile',
    name: 'Chamomile',
    nameKo: '카모마일',
    level: 3,
    parent: 'floral-sub'
},
  'rose': {
    id: 'rose',
    name: 'Rose',
    nameKo: '장미',
    level: 3,
    parent: 'floral-sub'
},
  'jasmine': {
    id: 'jasmine',
    name: 'Jasmine',
    nameKo: '자스민',
    level: 3,
    parent: 'floral-sub'
}
};

// Helper functions
export function getFlavorsByLevel(level: number): FlavorNode[] {
  return Object.values(flavorWheel).filter(flavor => flavor.level === level);
}

export function getChildFlavors(parentId: string): FlavorNode[] {
  const parent = flavorWheel[parentId];
  if (!parent || !parent.children) return [];
  
  return parent.children
    .map(childId => flavorWheel[childId])
    .filter(Boolean);
}

export function getFlavorPath(flavorId: string): FlavorNode[] {
  const path: FlavorNode[] = [];
  let current: FlavorNode | undefined = flavorWheel[flavorId];
  
  while (current) {
    path.unshift(current);
    current = current.parent ? flavorWheel[current.parent] : undefined;
}
  
  return path;
}

export function getFlavorByName(name: string, locale: 'en' | 'ko' = 'en'): FlavorNode | undefined {
  return Object.values(flavorWheel).find(flavor => 
    locale === 'ko' ? flavor.nameKo === name : flavor.name === name
  );
}