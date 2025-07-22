export interface ParsedCoffeeInfo {
  roastery?: string;
  coffeeName?: string;
  origin?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  roasterNotes?: string;
  farm?: string;
  producer?: string;
  harvest?: string;
}

// OCR 오류 자동 수정 함수 - 향상된 버전
const fixCommonOCRErrors = (text: string): string => {
  return text
    // 커피 품종 관련 - 더 많은 패턴 추가
    .replace(/s[Il](\d+)/gi, 'SL$1')  // sI28, sl28, SI28 → SL28
    .replace(/K7/g, 'K7')              // K7 품종
    .replace(/Ruiru\s*11/gi, 'Ruiru 11')
    .replace(/Batian/gi, 'Batian')
    // 숫자/문자 혼동 - 더 정확한 패턴
    .replace(/(?<![\d])O(\d)/g, '0$1')  // O4 → 04 (앞에 숫자가 없을 때만)
    .replace(/(\d)O(?![a-zA-Z])/g, '$10') // 4O → 40 (뒤에 문자가 없을 때만)
    .replace(/(?<![\d])l(\d)/g, '1$1')   // l0 → 10
    .replace(/(?<![\d])I(\d)/g, '1$1')   // I0 → 10
    // 고도 관련
    .replace(/(\d+)\s*m(?!\w)/gi, '$1m')  // 1500 m → 1500m
    .replace(/(\d+)\s*masl/gi, '$1 masl') // 1500masl → 1500 masl
    // 공통 로스터리 이름
    .replace(/STE[RO]+SCOPE/gi, 'STEREOSCOPE')
    .replace(/Coff[e3]+\s*C[o0]llective/gi, 'Coffee Collective')
    .replace(/[Bb]lue\s*[Bb]ottle/g, 'Blue Bottle')
    // 프로세싱 방법
    .replace(/Wash[e3]d/gi, 'Washed')
    .replace(/Natural[1l]y/gi, 'Naturally')
    .replace(/H[o0]ney/gi, 'Honey')
    .replace(/An[ae]+r[o0]bic/gi, 'Anaerobic')
    .replace(/Carb[o0]nic/gi, 'Carbonic')
    // 지역명 수정
    .replace(/Yirg[ae]ch[ae]ff[ae]/gi, 'Yirgacheffe')
    .replace(/G[ue]ji/gi, 'Guji')
    .replace(/Sidamo/gi, 'Sidama')
    .replace(/Huil[ae]/gi, 'Huila')
    .replace(/Nari[nñ]o/gi, 'Nariño');
};

export const parseOCRResult = (texts: string[]): ParsedCoffeeInfo => {
  // 모든 텍스트에 자동 수정 적용
  const correctedTexts = texts.map(text => fixCommonOCRErrors(text.trim()));
  
  const result: ParsedCoffeeInfo = {};
  
  // 전체 텍스트를 줄바꿈으로 합치기 (컨텍스트 유지)
  const fullText = correctedTexts.join('\n');
  
  // 향상된 키워드 기반 파싱
  correctedTexts.forEach((text, index) => {
    const lowerText = text.toLowerCase();
    const nextText = correctedTexts[index + 1];
    const prevText = index > 0 ? correctedTexts[index - 1] : '';
    
    // Process 찾기 - 더 유연한 매칭
    if (lowerText.match(/^process(ing)?:?$/i) && nextText) {
      result.process = nextText;
    } else if (text.match(/^(Washed|Natural|Honey|Anaerobic|Carbonic)/i) && !result.process) {
      result.process = text;
    }
    
    // Varietal/Variety 찾기 - 패턴 개선
    if (lowerText.match(/^variet(al|y|ies)?:?$/i) && nextText) {
      result.variety = nextText;
    } else if (text.match(/^(SL\d+|Bourbon|Typica|Caturra|Catuai|Geisha|Heirloom)/i) && !result.variety) {
      result.variety = text;
    }
    
    // Origin/Region 찾기 - 더 많은 패턴
    if (lowerText.match(/^(region|origin|from|country):?$/i) && nextText) {
      result.origin = nextText;
    }
    
    // Farm/Producer 찾기
    if (lowerText.match(/^(farm|finca|estate|producer):?$/i) && nextText) {
      result.farm = nextText;
    }
    
    // Altitude 찾기 - 패턴 개선
    if (lowerText.match(/^(altitude|elevation|height):?$/i) && nextText) {
      result.altitude = nextText;
    } else if (text.match(/^\d{3,4}\s*(-|~|to)?\s*\d{0,4}\s*(m|masl|meters|ft)/i)) {
      result.altitude = text;
    }
    
    // Harvest 찾기
    if (lowerText.match(/^harvest(ed)?:?$/i) && nextText) {
      result.harvest = nextText;
    } else if (text.match(/^(20\d{2}|\d{4})\s*(-|~|to|\/)\s*(20\d{2}|\d{4})?$/)) {
      result.harvest = text;
    }
    
    // 국가명 찾기 - 알려진 커피 생산국 목록 사용
    const coffeeCountries = ['ETHIOPIA', 'KENYA', 'COLOMBIA', 'BRAZIL', 'GUATEMALA', 
                            'COSTA RICA', 'PANAMA', 'PERU', 'BOLIVIA', 'HONDURAS', 
                            'NICARAGUA', 'EL SALVADOR', 'RWANDA', 'BURUNDI', 'YEMEN'];
    if (coffeeCountries.includes(text.toUpperCase()) && !result.origin) {
      result.origin = text;
    }
    
    // 로스터리 찾기 - 패턴 개선
    if (text.match(/(COFFEE|ROASTERS?|COLLECTIVE|LAB|CO\.|COMPANY)$/i) || 
        lowerText.match(/^roaster(y|ies)?:?$/i)) {
      if (lowerText.match(/^roaster(y|ies)?:?$/i) && nextText) {
        result.roastery = nextText;
      } else if (!lowerText.match(/^roaster(y|ies)?:?$/i)) {
        result.roastery = text;
      }
    }
  });
  
  // 커피 이름 찾기 - 더 지능적인 방법
  if (!result.coffeeName && correctedTexts.length > 0) {
    // 키워드를 제외한 라인 중에서 찾기
    const excludeKeywords = ['Region', 'Process', 'Varietal', 'Variety', 'Origin', 
                           'Altitude', 'Farm', 'Producer', 'Harvest', 'Roastery',
                           'From', 'Country', 'Elevation', 'Height'];
    
    // 보통 첫 번째나 두 번째 줄이 커피 이름인 경우가 많음
    for (let i = 0; i < Math.min(5, correctedTexts.length); i++) {
      const text = correctedTexts[i];
      const isKeyword = excludeKeywords.some(kw => 
        text.toLowerCase().startsWith(kw.toLowerCase()));
      
      // 커피 이름 가능성이 높은 패턴
      if (!isKeyword && 
          text.length > 3 && 
          text.length < 60 &&
          !text.match(/^\d+$/) && // 숫자만 있는 것 제외
          !text.match(/^\d{3,4}\s*(m|masl)/i) && // 고도 제외
          !text.match(/^(20\d{2}|\d{4})/i) && // 연도 제외
          (text.match(/[a-zA-Z]{3,}/) || text.match(/[가-힣]{2,}/))) { // 최소 3글자 이상의 문자 포함
        
        // 로스터리 이름이 아닌지 확인
        if (result.roastery && text === result.roastery) {
          continue;
        }
        
        result.coffeeName = text;
        break;
      }
    }
  }
  
  // 컵노트 찾기 - 크게 개선된 버전
  const flavorKeywords = [
    // 과일류
    'fruit', 'berry', 'cherry', 'apple', 'pear', 'peach', 'apricot', 'plum',
    'grape', 'raisin', 'fig', 'date', 'prune', 'blackberry', 'blueberry', 
    'raspberry', 'strawberry', 'cranberry', 'currant', 'citrus', 'orange', 
    'lemon', 'lime', 'grapefruit', 'tangerine', 'pineapple', 'mango', 'papaya',
    'passion', 'lychee', 'melon', 'watermelon', 'banana', 'coconut',
    // 초콜릿/견과류
    'chocolate', 'cocoa', 'cacao', 'nutty', 'almond', 'hazelnut', 'walnut',
    'peanut', 'cashew', 'pecan',
    // 꽃/허브
    'floral', 'jasmine', 'rose', 'lavender', 'hibiscus', 'chamomile', 'tea',
    'herbal', 'mint', 'basil', 'sage',
    // 단맛/캐러멜
    'sweet', 'sugar', 'honey', 'caramel', 'toffee', 'butterscotch', 'vanilla',
    'maple', 'molasses', 'brown sugar',
    // 기타 향미
    'creamy', 'buttery', 'silky', 'smooth', 'clean', 'bright', 'crisp',
    'juicy', 'wine', 'winey', 'fermented', 'funky', 'earthy', 'woody',
    'spicy', 'cinnamon', 'clove', 'pepper', 'tobacco', 'leather'
  ];
  
  // Notes/Tasting Notes 키워드 뒤의 텍스트 찾기
  let notesIndex = -1;
  correctedTexts.forEach((text, index) => {
    if (text.toLowerCase().match(/^(tasting\s*)?notes?:?$/i) ||
        text.toLowerCase().match(/^(cup\s*)?notes?:?$/i) ||
        text.toLowerCase().match(/^flavou?rs?:?$/i)) {
      notesIndex = index;
    }
  });
  
  if (notesIndex >= 0 && notesIndex < correctedTexts.length - 1) {
    // Notes 키워드 다음부터 수집
    const notesTexts = [];
    for (let i = notesIndex + 1; i < correctedTexts.length; i++) {
      const text = correctedTexts[i];
      // 다른 섹션 시작이면 중단
      if (text.match(/^(Region|Process|Varietal|Origin|Altitude|Farm|Producer|Harvest):?$/i)) {
        break;
      }
      notesTexts.push(text);
    }
    if (notesTexts.length > 0) {
      result.roasterNotes = notesTexts.join(', ');
    }
  }
  
  // Notes 키워드가 없으면 향미 키워드로 찾기
  if (!result.roasterNotes) {
    const noteTexts = correctedTexts.filter(text => {
      const lowerText = text.toLowerCase();
      // 콤마로 구분된 리스트거나 향미 키워드가 2개 이상 포함
      const commaCount = (text.match(/,/g) || []).length;
      const flavorCount = flavorKeywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      ).length;
      
      return (commaCount >= 2 && text.length > 10) || 
             (flavorCount >= 2) ||
             (commaCount >= 1 && flavorCount >= 1);
    });
    
    if (noteTexts.length > 0) {
      // 연속된 노트 텍스트 합치기
      result.roasterNotes = noteTexts.join(', ');
    }
  }
  
  // 결과 정리 - 빈 값 제거 및 트림
  Object.keys(result).forEach(key => {
    if (result[key]) {
      result[key] = result[key].trim();
      if (result[key].length === 0) {
        delete result[key];
      }
    }
  });
  
  return result;
};

// ML Kit 텍스트 인식 결과를 처리하는 새로운 함수
export const parseMLKitResult = (mlKitBlocks: any[]): ParsedCoffeeInfo => {
  // ML Kit은 텍스트 블록과 라인 정보를 제공
  const texts: string[] = [];
  
  // 블록을 Y 좌표로 정렬하여 위에서 아래 순서로 처리
  const sortedBlocks = mlKitBlocks.sort((a, b) => {
    const aY = a.frame?.origin?.y || 0;
    const bY = b.frame?.origin?.y || 0;
    return aY - bY;
  });
  
  // 각 블록의 텍스트 추출
  sortedBlocks.forEach(block => {
    if (block.text) {
      // 라인별로 분리
      const lines = block.text.split('\n');
      lines.forEach((line: string) => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          texts.push(trimmed);
        }
      });
    }
  });
  
  // 기존 파서 사용
  return parseOCRResult(texts);
};