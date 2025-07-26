import uuid from 'react-native-uuid';
import RealmService from './realm/RealmService';
import { Logger } from './LoggingService';

/**
 * 매우 단순한 Mock Data 생성 서비스
 * 복잡한 로직 없이 기본 필수 필드만 채워서 테스트 데이터 생성
 */
export class SimpleMockDataService {
  
  /**
   * 1개의 단순한 테스트 기록 생성
   */
  static async createOneSimpleRecord(): Promise<boolean> {
    try {
      Logger.info('🎯 Creating one simple mock record', 'service');
      
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      const realm = realmService.getRealm();
      const now = new Date();
      
      const testRecord = {
        id: String(uuid.v4()),
        createdAt: now,
        updatedAt: now,
        
        // 기본 커피 정보 (필수)
        roastery: '테스트 로스터리',
        coffeeName: '테스트 커피',
        temperature: 'hot' as const,
        
        // 점수 (필수)
        matchScoreTotal: 75,
        matchScoreFlavor: 38,
        matchScoreSensory: 37,
        
        // 기본 향미
        flavorNotes: [
          { level: 1, value: 'Sweet', koreanValue: '달콤한' }
        ],
        
        // 기본 감각 평가
        sensoryAttribute: {
          body: 3,
          acidity: 3,
          sweetness: 3,
          finish: 3,
          mouthfeel: 'Clean' as const
        },
        
        // 기본 설정
        isSynced: false,
        isDeleted: false,
        mode: 'cafe' as const
      };
      
      realm.write(() => {
        realm.create('TastingRecord', testRecord);
      });
      
      Logger.info('✅ Simple mock record created successfully', 'service');
      return true;
      
    } catch (error) {
      Logger.error('❌ Failed to create simple mock record', 'service', { error });
      return false;
    }
  }
  
  /**
   * 전체 데이터 삭제
   */
  static async clearAllData(): Promise<boolean> {
    try {
      Logger.info('🗑️ Clearing all data', 'service');
      
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      const realm = realmService.getRealm();
      
      realm.write(() => {
        const allRecords = realm.objects('TastingRecord');
        realm.delete(allRecords);
      });
      
      Logger.info('✅ All data cleared successfully', 'service');
      return true;
      
    } catch (error) {
      Logger.error('❌ Failed to clear data', 'service', { error });
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
      Logger.error('❌ Failed to get data count', 'service', { error });
      return 0;
    }
  }
}