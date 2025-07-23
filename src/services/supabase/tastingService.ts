import { supabase } from './client';

export interface TastingRecord {
  // Supabase 자동 생성 필드
  id?: string;                    // UUID, Supabase가 자동 생성
  user_id?: string;               // 인증 사용자 ID
  created_at?: string;            // Supabase가 자동 설정
  updated_at?: string;            // Supabase가 자동 업데이트
  
  // Realm 연동용 (선택적)
  realm_id?: string;              // Realm 로컬 ID와 매핑
  
  // 커피 정보
  cafe_name?: string;
  roaster_name: string;
  coffee_name: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  temperature: string;
  roaster_notes?: string;
  personal_comment?: string;
  
  // 매칭 점수
  match_score: number;
  
  // 모드
  mode?: 'cafe' | 'home_cafe';
  
  // 홈카페 데이터
  home_cafe_data?: any;
  
  // 선택된 감각 표현
  selected_sensory_expressions?: any[];
}

export interface FlavorNote {
  id?: string;
  tasting_id?: string;
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}

export interface SensoryAttribute {
  id?: string;
  tasting_id?: string;
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: string;
  bitterness?: number;
  balance?: number;
}

export interface CoffeeComparison {
  averageScore: number;
  totalTastings: number;
  popularFlavors: { value: string; percentage: number }[];
  sensoryAverages: {
    body: number;
    acidity: number;
    sweetness: number;
    finish: number;
  };
}

class TastingService {
  async saveTasting(tasting: any): Promise<string> {
    try {
      // 1. 메인 테이스팅 레코드 준비
      // Realm 데이터에서 Supabase에 필요한 필드만 선택적으로 복사
      const supabaseRecord: Partial<TastingRecord> = {
        // realm_id는 제외 - Supabase가 자체 ID를 생성하도록 함
        cafe_name: tasting.cafeName,
        roaster_name: tasting.roastery || tasting.roaster_name,
        coffee_name: tasting.coffeeName,
        origin: tasting.origin,
        variety: tasting.variety,
        altitude: tasting.altitude,
        process: tasting.process,
        temperature: tasting.temperature,
        roaster_notes: tasting.roasterNotes,
        personal_comment: tasting.personalComment,
        match_score: tasting.matchScoreTotal || tasting.matchScore || 0,
        mode: tasting.mode,
        home_cafe_data: tasting.homeCafeData,
        selected_sensory_expressions: tasting.selectedSensoryExpressions,
        // user_id, created_at, updated_at는 Supabase가 자동 처리
      };

      const { data: savedTasting, error: tastingError } = await supabase
        .from('tasting_records')
        .insert(supabaseRecord)
        .select()
        .single();

      if (tastingError) throw tastingError;
      if (!savedTasting) throw new Error('Failed to save tasting record');

      // 2. 맛 노트 저장
      if (tasting.selectedFlavors && tasting.selectedFlavors.length > 0) {
        const flavorNotes: FlavorNote[] = [];
        
        for (const flavor of tasting.selectedFlavors) {
          // Create a single record with all levels
          flavorNotes.push({
            tasting_id: savedTasting.id,
            level1: flavor.level1 || null,
            level2: flavor.level2 || null,
            level3: flavor.level3 || null,
            level4: flavor.level4 || null,
          } as FlavorNote);
        }

        if (flavorNotes.length > 0) {
          const { error: flavorError } = await supabase
            .from('flavor_notes')
            .insert(flavorNotes);

          if (flavorError) throw flavorError;
        }
      }

      // 3. 감각 속성 저장
      const sensoryAttribute: SensoryAttribute = {
        tasting_id: savedTasting.id,
        body: tasting.body || 3,
        acidity: tasting.acidity || 3,
        sweetness: tasting.sweetness || 3,
        finish: tasting.finish || 3,
        mouthfeel: tasting.mouthfeel || 'Clean',
      };

      const { error: sensoryError } = await supabase
        .from('sensory_attributes')
        .insert(sensoryAttribute);

      if (sensoryError) throw sensoryError;

      return savedTasting.id;
    } catch (error) {
      // console.error('Error saving tasting to Supabase:', error);
      throw error;
    }
  }

  async getCoffeeComparison(
    coffeeName: string,
    roaster_name: string
  ): Promise<CoffeeComparison | null> {
    try {
      // 같은 커피의 모든 테이스팅 데이터 조회
      const { data: tastings, error } = await supabase
        .from('tasting_records')
        .select(`
          id,
          match_score,
          flavor_notes (
            level1,
            level2,
            level3,
            level4
          ),
          sensory_attributes (
            body,
            acidity,
            sweetness,
            finish
          )
        `)
        .eq('coffee_name', coffeeName)
        .eq('roaster_name', roaster_name);

      if (error) throw error;
      if (!tastings || tastings.length === 0) return null;

      // 평균 점수 계산
      const totalScore = tastings.reduce((sum, t) => sum + (t.match_score || 0), 0);
      const averageScore = Math.round(totalScore / tastings.length);

      // 인기 맛 노트 계산
      const flavorCounts: { [key: string]: number } = {};
      let totalFlavorNotes = 0;

      tastings.forEach(tasting => {
        if (tasting.flavor_notes) {
          tasting.flavor_notes.forEach((note: any) => {
            // Count each level flavor note
            if (note.level1) {
              flavorCounts[note.level1] = (flavorCounts[note.level1] || 0) + 1;
              totalFlavorNotes++;
            }
            if (note.level2) {
              flavorCounts[note.level2] = (flavorCounts[note.level2] || 0) + 1;
              totalFlavorNotes++;
            }
            if (note.level3) {
              flavorCounts[note.level3] = (flavorCounts[note.level3] || 0) + 1;
              totalFlavorNotes++;
            }
            if (note.level4) {
              flavorCounts[note.level4] = (flavorCounts[note.level4] || 0) + 1;
              totalFlavorNotes++;
            }
          });
        }
      });

      const popularFlavors = Object.entries(flavorCounts)
        .map(([value, count]) => ({
          value,
          percentage: Math.round((count / tastings.length) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      // 감각 평균 계산
      let bodySum = 0, aciditySum = 0, sweetnessSum = 0, finishSum = 0;
      let sensoryCount = 0;

      tastings.forEach(tasting => {
        if (tasting.sensory_attributes && tasting.sensory_attributes.length > 0) {
          const sensory = tasting.sensory_attributes[0];
          bodySum += sensory.body || 3;
          aciditySum += sensory.acidity || 3;
          sweetnessSum += sensory.sweetness || 3;
          finishSum += sensory.finish || 3;
          sensoryCount++;
        }
      });

      const sensoryAverages = {
        body: sensoryCount > 0 ? Number((bodySum / sensoryCount).toFixed(1)) : 3,
        acidity: sensoryCount > 0 ? Number((aciditySum / sensoryCount).toFixed(1)) : 3,
        sweetness: sensoryCount > 0 ? Number((sweetnessSum / sensoryCount).toFixed(1)) : 3,
        finish: sensoryCount > 0 ? Number((finishSum / sensoryCount).toFixed(1)) : 3,
      };

      return {
        averageScore,
        totalTastings: tastings.length,
        popularFlavors,
        sensoryAverages,
      };
    } catch (error) {
      // console.error('Error getting coffee comparison:', error);
      return null;
    }
  }

  async getSimilarCoffees(
    coffeeName: string,
    roaster_name: string,
    origin?: string
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('tasting_records')
        .select('coffee_name, roaster_name, origin, match_score')
        .neq('coffee_name', coffeeName);

      // 원산지가 있으면 같은 원산지 우선
      if (origin) {
        query = query.eq('origin', origin);
      } else {
        // 원산지가 없으면 같은 로스터리
        query = query.eq('roaster_name', roaster_name);
      }

      const { data: tastings, error } = await query;

      if (error) throw error;
      if (!tastings || tastings.length === 0) return [];

      // 커피별로 그룹화하고 평균 계산
      const coffeeMap: { [key: string]: any } = {};

      tastings.forEach(tasting => {
        const key = `${tasting.coffee_name}-${tasting.roaster_name}`;
        if (!coffeeMap[key]) {
          coffeeMap[key] = {
            coffeeName: tasting.coffee_name,
            roaster_name: tasting.roaster_name,
            origin: tasting.origin,
            totalScore: 0,
            tastingCount: 0,
          };
        }
        coffeeMap[key].totalScore += tasting.match_score || 0;
        coffeeMap[key].tastingCount += 1;
      });

      // 평균 점수 계산하고 정렬
      const similarCoffees = Object.values(coffeeMap)
        .map(coffee => ({
          ...coffee,
          averageScore: Math.round(coffee.totalScore / coffee.tastingCount),
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 3);

      return similarCoffees;
    } catch (error) {
      // console.error('Error getting similar coffees:', error);
      return [];
    }
  }
}

export default new TastingService();