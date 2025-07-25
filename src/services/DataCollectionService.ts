import { supabase } from './supabase/client';
import RealmService from './realm/RealmService';
import { ITastingRecord } from './realm/schemas';

/**
 * 개발자/운영자용 데이터 수집 서비스
 * 사용자의 로컬 Realm 데이터를 Supabase로 전송하는 기능
 */
class DataCollectionService {
  private static instance: DataCollectionService;

  private constructor() {}

  static getInstance(): DataCollectionService {
    if (!DataCollectionService.instance) {
      DataCollectionService.instance = new DataCollectionService();
    }
    return DataCollectionService.instance;
  }

  /**
   * 사용자의 모든 테이스팅 데이터를 Supabase로 전송
   * 개발자/운영자가 호출하는 함수
   */
  async collectUserData(userId?: string): Promise<{
    success: boolean;
    message: string;
    totalRecords?: number;
    uploadedRecords?: number;
  }> {
    try {
      const realmService = RealmService.getInstance();
      
      // Realm 초기화 확인
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      // 모든 비삭제 테이스팅 레코드 가져오기
      const localTastings = await realmService.getTastingRecords({ isDeleted: false });
      
      if (localTastings.length === 0) {
        return {
          success: true,
          message: '전송할 데이터가 없습니다.',
          totalRecords: 0,
          uploadedRecords: 0
        };
      }

      // 데이터 변환 및 업로드
      // Results를 배열로 변환
      const tastingsArray = Array.from(localTastings);
      const uploadedRecords = await this.uploadTastingsToSupabase(tastingsArray, userId);

      return {
        success: true,
        message: `데이터 수집 완료: ${uploadedRecords}/${localTastings.length} 레코드 업로드`,
        totalRecords: localTastings.length,
        uploadedRecords: uploadedRecords
      };

    } catch (error) {
      // console.error('데이터 수집 중 오류:', error);
      return {
        success: false,
        message: `데이터 수집 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  /**
   * 테이스팅 데이터를 Supabase로 업로드
   */
  private async uploadTastingsToSupabase(tastings: ITastingRecord[], userId?: string): Promise<number> {
    let uploadedCount = 0;

    for (const tasting of tastings) {
      try {
        // Supabase 테이블 구조에 맞게 데이터 변환
        const supabaseData = {
          // 기본 정보
          id: tasting.id,
          user_id: userId || 'anonymous',
          created_at: tasting.createdAt.toISOString(),
          updated_at: tasting.updatedAt.toISOString(),
          
          // 커피 정보
          coffee_name: tasting.coffeeName,
          roastery: tasting.roastery,
          cafe_name: tasting.cafeName,
          origin: tasting.origin,
          variety: tasting.variety,
          process: tasting.process,
          roaster_notes: tasting.roasterNotes,
          
          // 테이스팅 정보
          temperature: tasting.temperature,
          match_score_total: tasting.matchScoreTotal,
          
          // 감각 평가
          sensory_body: tasting.sensoryAttribute?.body,
          sensory_acidity: tasting.sensoryAttribute?.acidity,
          sensory_sweetness: tasting.sensoryAttribute?.sweetness,
          sensory_finish: tasting.sensoryAttribute?.finish,
          
          // 플레이버 노트 (JSON 형태로 저장)
          flavor_notes: tasting.flavorNotes.map(note => ({
            level: note.level,
            value: note.value
          })),
          
          // 메타데이터
          is_deleted: tasting.isDeleted,
          device_info: {
            platform: 'mobile',
            collection_date: new Date().toISOString()
          }
        };

        // Supabase에 데이터 삽입 (upsert 사용)
        const { error } = await supabase
          .from('collected_tastings')
          .upsert(supabaseData, {
            onConflict: 'id'
          });

        if (error) {
          // console.error(`레코드 ${tasting.id} 업로드 실패:`, error);
          continue;
        }

        uploadedCount++;
        
        // 네트워크 부하 방지를 위한 작은 딜레이
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        // console.error(`레코드 ${tasting.id} 처리 중 오류:`, error);
        continue;
      }
    }

    return uploadedCount;
  }

  /**
   * 특정 기간의 데이터만 수집
   */
  async collectDataByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    totalRecords?: number;
    uploadedRecords?: number;
  }> {
    try {
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      // 날짜 범위로 필터링된 테이스팅 레코드 가져오기
      const allTastings = await realmService.getTastingRecords({ isDeleted: false });
      const filteredTastings = allTastings.filter((tasting: ITastingRecord) => {
        const tastingDate = tasting.createdAt;
        return tastingDate >= startDate && tastingDate <= endDate;
      });

      if (filteredTastings.length === 0) {
        return {
          success: true,
          message: '지정된 기간에 데이터가 없습니다.',
          totalRecords: 0,
          uploadedRecords: 0
        };
      }

      // Results를 배열로 변환
      const tastingsArray = Array.from(filteredTastings);
      const uploadedRecords = await this.uploadTastingsToSupabase(tastingsArray, userId);

      return {
        success: true,
        message: `기간별 데이터 수집 완료: ${uploadedRecords}/${filteredTastings.length} 레코드 업로드`,
        totalRecords: filteredTastings.length,
        uploadedRecords: uploadedRecords
      };

    } catch (error) {
      // console.error('기간별 데이터 수집 중 오류:', error);
      return {
        success: false,
        message: `기간별 데이터 수집 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  /**
   * 데이터 수집 상태 확인
   */
  async getCollectionStatus(): Promise<{
    localRecords: number;
    lastCollectionDate?: string;
    pendingRecords: number;
  }> {
    try {
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      const localTastings = await realmService.getTastingRecords({ isDeleted: false });
      
      // 마지막 수집 날짜는 별도 저장소에서 관리하거나 Supabase에서 조회
      // 여기서는 간단히 로컬 레코드 수만 반환
      return {
        localRecords: localTastings.length,
        pendingRecords: localTastings.length, // 실제로는 아직 수집되지 않은 레코드 수
      };

    } catch (error) {
      // console.error('데이터 수집 상태 확인 중 오류:', error);
      return {
        localRecords: 0,
        pendingRecords: 0
      };
    }
  }

  /**
   * 개발자 전용: 테스트 데이터 생성
   * 개발/테스트 환경에서만 사용
   */
  async generateTestData(count: number = 5): Promise<{
    success: boolean;
    message: string;
    generatedRecords?: number;
  }> {
    try {
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      const testRoasteries = ['로스터리 A', '로스터리 B', '로스터리 C'];
      const testCoffees = ['에티오피아 예가체프', '콜롬비아 수프리모', '브라질 산토스'];
      const testOrigins = ['에티오피아', '콜롬비아', '브라질'];

      for (let i = 0; i < count; i++) {
        const testData = {
          coffeeName: testCoffees[i % testCoffees.length],
          roastery: testRoasteries[i % testRoasteries.length],
          cafeName: `테스트 카페 ${i + 1}`,
          origin: testOrigins[i % testOrigins.length],
          variety: 'Arabica',
          process: 'Washed',
          roasterNotes: `테스트 로스터 노트 ${i + 1}`,
          temperature: 'hot' as const,
          sensoryAttribute: {
            body: Math.floor(Math.random() * 5) + 1,
            acidity: Math.floor(Math.random() * 5) + 1,
            sweetness: Math.floor(Math.random() * 5) + 1,
            finish: Math.floor(Math.random() * 5) + 1,
            mouthfeel: 'Clean' as const,
            bitterness: Math.floor(Math.random() * 5) + 1,
            balance: Math.floor(Math.random() * 5) + 1
          },
          flavorNotes: [
            { level: 1, value: 'Fruity' },
            { level: 2, value: 'Berry' }
          ],
          matchScoreTotal: Math.floor(Math.random() * 100) + 1,
          matchScoreFlavor: Math.floor(Math.random() * 100) + 1,
          matchScoreSensory: Math.floor(Math.random() * 100) + 1,
          isSynced: false,
          isDeleted: false,
          mode: 'cafe' as const
        };

        realmService.saveTastingRecord(testData);
      }

      return {
        success: true,
        message: `테스트 데이터 ${count}개 생성 완료`,
        generatedRecords: count
      };

    } catch (error) {
      // console.error('테스트 데이터 생성 중 오류:', error);
      return {
        success: false,
        message: `테스트 데이터 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }
}

export default DataCollectionService;