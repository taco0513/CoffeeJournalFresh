import uuid from 'react-native-uuid';
import RealmService from './realm/RealmService';
import { Logger } from './LoggingService';

/**
 * DummyDataCard Service - 카드 생성기
 * 3개의 다양한 테스트 커피 카드를 빠르게 생성
 * 통계, 저널, 성과 테스트를 위한 최소 필수 데이터 제공
 */
export class DummyDataCardService {
  
  /**
   * 3개의 단순한 테스트 기록 생성
   */
  static async createSimpleRecords(): Promise<number> {
    try {
      Logger.info('Creating 3 simple mock records', 'service');
      
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      const realm = realmService.getRealm();
      
      // 3개의 다양한 테스트 데이터 준비
      const testData = [
        {
          roastery: '블루보틀',
          coffeeName: '에티오피아 예가체프',
          temperature: 'hot' as const,
          matchScoreTotal: 85,
          flavorNotes: [
            { level: 1, value: 'Fruity', koreanValue: '과일향' },
            { level: 1, value: 'Floral', koreanValue: '꽃향' }
          ]
        },
        {
          roastery: '테라로사',
          coffeeName: '콜롬비아 수프레모',
          temperature: 'cold' as const,
          matchScoreTotal: 78,
          flavorNotes: [
            { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
            { level: 1, value: 'Nutty', koreanValue: '견과류' }
          ]
        },
        {
          roastery: '커피리브레',
          coffeeName: '브라질 산토스',
          temperature: 'hot' as const,
          matchScoreTotal: 72,
          flavorNotes: [
            { level: 1, value: 'Sweet', koreanValue: '달콤한' },
            { level: 1, value: 'Caramel', koreanValue: '카라멜' }
          ]
        }
      ];
      
      let successCount = 0;
      
      realm.write(() => {
        testData.forEach((data, index) => {
          const now = new Date();
          // 시간을 조금씩 다르게 설정 (1분씩 차이)
          now.setMinutes(now.getMinutes() - index);
          
          const testRecord = {
            id: String(uuid.v4()),
            createdAt: now,
            updatedAt: now,
            
            // 기본 커피 정보 (필수)
            roastery: data.roastery,
            coffeeName: data.coffeeName,
            temperature: data.temperature,
            
            // 점수 (필수)
            matchScoreTotal: data.matchScoreTotal,
            matchScoreFlavor: Math.floor(data.matchScoreTotal * 0.5),
            matchScoreSensory: Math.floor(data.matchScoreTotal * 0.5),
            
            // 기본 향미
            flavorNotes: data.flavorNotes,
            
            // 기본 감각 평가
            sensoryAttribute: {
              body: 3 + Math.floor(Math.random() * 2),
              acidity: 2 + Math.floor(Math.random() * 3),
              sweetness: 3 + Math.floor(Math.random() * 2),
              finish: 3 + Math.floor(Math.random() * 2),
              mouthfeel: 'Clean' as const
            },
            
            // 기본 설정
            isSynced: false,
            isDeleted: false,
            mode: 'cafe' as const
          };
          
          try {
            realm.create('TastingRecord', testRecord);
            successCount++;
          } catch (error) {
            Logger.error(`Failed to create record ${index + 1}`, 'service', { error });
          }
        });
      });
      
      Logger.info(` Created ${successCount} simple mock records`, 'service');
      return successCount;
      
    } catch (error) {
      Logger.error('Failed to create simple mock records', 'service', { error });
      return 0;
    }
  }
  
  /**
   * 전체 데이터 삭제
   */
  static async clearAllData(): Promise<boolean> {
    try {
      Logger.info('Clearing all data', 'service');
      
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      const realm = realmService.getRealm();
      
      realm.write(() => {
        const allRecords = realm.objects('TastingRecord');
        realm.delete(allRecords);
      });
      
      Logger.info(' All data cleared successfully', 'service');
      return true;
      
    } catch (error) {
      Logger.error('Failed to clear data', 'service', { error });
      return false;
    }
  }
  
  /**
   * 현재 데이터 개수 확인
   */
  static async getDataCount(): Promise<number> {
    try {
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      const realm = realmService.getRealm();
      const records = realm.objects('TastingRecord').filtered('isDeleted = false');
      return records.length;
      
    } catch (error) {
      Logger.error('Failed to get data count', 'service', { error });
      return 0;
    }
  }
}