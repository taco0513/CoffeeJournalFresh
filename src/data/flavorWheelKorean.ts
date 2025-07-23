export const flavorWheelKorean = {
  level1: {
    'Fruity': '과일 향/프루티',
    'Sour/Fermented': '신맛/발효',
    'Nutty/Cocoa': '견과류/너티/코코아',
    'Sweet': '단맛',
    'Floral': '꽃향기/플로럴',
    'Green/Vegetative': '초록/식물성',
    'Roasted': '로스팅',
    'Spices': '향신료',
    'Other': '기타'
  },
  
  level2: {
    'Fruity': ['Berry', 'Dried Fruit', 'Other Fruit', 'Citrus Fruit'],
    'Sour/Fermented': ['Sour', 'Alcohol/Fermented'],
    'Green/Vegetative': ['Olive Oil', 'Raw', 'Green/Vegetative', 'Beany'],
    'Other': ['Papery/Musty', 'Chemical'],
    'Roasted': ['Pipe Tobacco', 'Tobacco', 'Burnt/Smoky', 'Cereal/Bread'],
    'Spices': ['Pungent/Pepper', 'Pepper', 'Brown Spice'],
    'Nutty/Cocoa': ['Nutty', 'Chocolate'],
    'Sweet': ['Caramel/Brown Sugar', 'Vanilla', 'Vanillin', 'Overall Sweet', 'Sweet Aromatics'],
    'Floral': ['Black Tea', 'Floral']
  },
  
  level3: {
    // 과일 향/프루티
    'Berry': ['블랙베리', '라즈베리', '블루베리', '딸기'],
    'Dried Fruit': ['건포도', '자두'],
    'Other Fruit': ['코코넛', '체리', '석류', '파인애플', '포도', '사과', '복숭아', '배'],
    'Citrus Fruit': ['자몽', '오렌지', '레몬', '라임'],
    
    // 신맛/발효
    'Sour': ['신맛 아로마', '아세트산', '뷰티르산', '이소발러산', '구연산', '사과산'],
    'Alcohol/Fermented': ['와인향', '위스키향', '발효', '과숙'],
    
    // 초록/식물성
    'Olive Oil': [],
    'Raw': [],
    'Green/Vegetative': ['덜 익은', '완두콩 꼬투리', '신선한', '진한 녹색', '식물성', '건초', '허브'],
    'Beany': [],
    
    // 기타
    'Papery/Musty': ['묵은', '판지', '종이', '목재 냄새', '곰팡이/습한', '곰팡이/먼지', '곰팡이/흙냄새', '동물 냄새', '고기/육수', '페놀'],
    'Chemical': ['쓴맛', '짠맛', '약품 냄새', '석유', '스컹크', '고무 냄새'],
    
    // 로스팅
    'Pipe Tobacco': [],
    'Tobacco': [],
    'Burnt/Smoky': ['신랄한', '재 냄새', '연기', '브라운 로스트'],
    'Cereal/Bread': ['곡식', '맥아'],
    
    // 향신료
    'Pungent/Pepper': ['후추'],
    'Pepper': [],
    'Brown Spice': ['아니스', '육두구', '계피', '정향'],
    
    // 견과류/너티/코코아
    'Nutty': ['아몬드', '헤이즐넛', '땅콩'],
    'Chocolate': ['초콜릿', '다크 초콜릿'],
    
    // 단맛
    'Caramel/Brown Sugar': ['당밀', '메이플 시럽', '캐러멜', '꿀'],
    'Vanilla': [],
    'Vanillin': [],
    'Overall Sweet': [],
    'Sweet Aromatics': [],
    
    // 꽃향기/플로럴
    'Black Tea': [],
    'Floral': ['카모마일', '장미', '자스민']
  },
  
  translations: {
    // Level 2 한글 번역
    'Berry': '베리류/딸기류',
    'Dried Fruit': '건조과일',
    'Other Fruit': '기타 과일',
    'Citrus Fruit': '감귤 향/시트러스',
    'Sour': '신맛',
    'Alcohol/Fermented': '알코올/발효',
    'Olive Oil': '올리브 오일',
    'Raw': '생것',
    'Green/Vegetative': '허브/식물성',
    'Beany': '콩비린내',
    'Papery/Musty': '종이 냄새/곰팡이 냄새',
    'Chemical': '화학물질 냄새',
    'Pipe Tobacco': '파이프 담배',
    'Tobacco': '담배',
    'Burnt/Smoky': '탄내/스모키',
    'Cereal/Bread': '곡물 냄새/구운 빵 냄새',
    'Pungent/Pepper': '자극적/펀전트',
    'Pepper': '후추',
    'Brown Spice': '갈색 향신료',
    'Nutty': '견과류 냄새',
    'Chocolate': '초콜릿 향',
    'Caramel/Brown Sugar': '캐러멜 향/갈색 설탕',
    'Vanilla': '바닐라',
    'Vanillin': '바닐린',
    'Overall Sweet': '전반적 단맛',
    'Sweet Aromatics': '달콤한 아로마',
    'Black Tea': '홍차',
    'Floral': '꽃향기',
    
    // Level 3 한글은 이미 한글로 되어 있으므로 직접 사용
    // 추가 sensory attributes
    'Body': '바디감',
    'Acidity': '산미',
    'Sweetness': '단맛',
    'Finish': '여운',
    'Mouthfeel': '입안 느낌',
    'Clean': '깔끔한',
    'Creamy': '크리미한',
    'Juicy': '쥬시한',
    'Silky': '실키한',
    'Light': '가벼운',
    'Heavy': '무거운',
    'Low': '약한',
    'High': '강한',
    'Short': '짧은',
    'Long': '긴',
    'None': '없음'
  }
};