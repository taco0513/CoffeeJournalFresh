import DataCollectionService from '../services/DataCollectionService';

/**
 * 개발자용 유틸리티 함수들
 * 프로덕션 환경에서는 사용하지 않는 개발/테스트 전용 함수들
 */

// 개발 환경에서만 사용 가능하도록 체크
const isDevelopment = __DEV__;

/**
 * 개발자 콘솔에서 사용할 수 있는 전역 함수들
 * 앱 실행 중 개발자 콘솔에서 호출 가능
 */
export const DevUtils = {
  /**
   * 사용자 데이터 수집 실행
   * 콘솔에서 호출: DevUtils.collectUserData()
   */
  async collectUserData(userId?: string) {
    if (!isDevelopment) {
      // console.warn('이 함수는 개발 환경에서만 사용할 수 있습니다.');
      return;
    }

    // console.log('🔄 데이터 수집 시작...');
    try {
      const service = DataCollectionService.getInstance();
      const result = await service.collectUserData(userId);
      
      if (result.success) {
        // console.log('✅ 데이터 수집 성공:', result.message);
        // console.log(`📊 총 레코드: ${result.totalRecords}, 업로드된 레코드: ${result.uploadedRecords}`);
      } else {
        // console.error('❌ 데이터 수집 실패:', result.message);
      }
      
      return result;
    } catch (error) {
      // console.error('❌ 데이터 수집 중 오류:', error);
      return { success: false, message: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  },

  /**
   * 기간별 데이터 수집
   * 콘솔에서 호출: DevUtils.collectDataByDate('2024-01-01', '2024-01-31')
   */
  async collectDataByDate(startDate: string, endDate: string, userId?: string) {
    if (!isDevelopment) {
      // console.warn('이 함수는 개발 환경에서만 사용할 수 있습니다.');
      return;
    }

    // console.log(`🔄 기간별 데이터 수집 시작: ${startDate} ~ ${endDate}`);
    try {
      const service = DataCollectionService.getInstance();
      const result = await service.collectDataByDateRange(
        new Date(startDate),
        new Date(endDate),
        userId
      );
      
      if (result.success) {
        // console.log('✅ 기간별 데이터 수집 성공:', result.message);
        // console.log(`📊 총 레코드: ${result.totalRecords}, 업로드된 레코드: ${result.uploadedRecords}`);
      } else {
        // console.error('❌ 기간별 데이터 수집 실패:', result.message);
      }
      
      return result;
    } catch (error) {
      // console.error('❌ 기간별 데이터 수집 중 오류:', error);
      return { success: false, message: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  },

  /**
   * 데이터 수집 상태 확인
   * 콘솔에서 호출: DevUtils.checkCollectionStatus()
   */
  async checkCollectionStatus() {
    if (!isDevelopment) {
      // console.warn('이 함수는 개발 환경에서만 사용할 수 있습니다.');
      return;
    }

    // console.log('📊 데이터 수집 상태 확인 중...');
    try {
      const service = DataCollectionService.getInstance();
      const status = await service.getCollectionStatus();
      
      // console.log('📈 데이터 수집 상태:');
      // console.log(`- 로컬 레코드: ${status.localRecords}개`);
      // console.log(`- 대기 중인 레코드: ${status.pendingRecords}개`);
      if (status.lastCollectionDate) {
        // console.log(`- 마지막 수집 일자: ${status.lastCollectionDate}`);
      }
      
      return status;
    } catch (error) {
      // console.error('❌ 상태 확인 중 오류:', error);
      return null;
    }
  },

  /**
   * 테스트 데이터 생성
   * 콘솔에서 호출: DevUtils.generateTestData(10)
   */
  async generateTestData(count: number = 5) {
    if (!isDevelopment) {
      // console.warn('이 함수는 개발 환경에서만 사용할 수 있습니다.');
      return;
    }

    // console.log(`🧪 테스트 데이터 ${count}개 생성 중...`);
    try {
      const service = DataCollectionService.getInstance();
      const result = await service.generateTestData(count);
      
      if (result.success) {
        // console.log('✅ 테스트 데이터 생성 성공:', result.message);
        // console.log(`📊 생성된 레코드: ${result.generatedRecords}개`);
      } else {
        // console.error('❌ 테스트 데이터 생성 실패:', result.message);
      }
      
      return result;
    } catch (error) {
      // console.error('❌ 테스트 데이터 생성 중 오류:', error);
      return { success: false, message: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  },

  /**
   * 개발자 도구 도움말
   * 콘솔에서 호출: DevUtils.help()
   */
  help() {
    // console.log(`
    // 🛠️  개발자 데이터 수집 도구
    //
    // 📖 사용 가능한 함수들:
    //
    // 1. DevUtils.collectUserData(userId?)
    //    - 사용자의 모든 테이스팅 데이터를 Supabase로 전송
    //    - userId는 선택사항 (기본값: 'anonymous')
    //
    // 2. DevUtils.collectDataByDate(startDate, endDate, userId?)
    //    - 특정 기간의 데이터만 수집
    //    - 날짜 형식: 'YYYY-MM-DD'
    //    - 예: DevUtils.collectDataByDate('2024-01-01', '2024-01-31')
    //
    // 3. DevUtils.checkCollectionStatus()
    //    - 로컬 데이터 상태 및 수집 현황 확인
    //
    // 4. DevUtils.generateTestData(count)
    //    - 테스트용 더미 데이터 생성
    //    - count: 생성할 레코드 수 (기본값: 5)
    //
    // 5. DevUtils.help()
    //    - 이 도움말 표시
    //
    // ⚠️  주의사항:
    // - 이 도구들은 개발 환경(__DEV__ = true)에서만 사용 가능합니다
    // - 프로덕션 환경에서는 작동하지 않습니다
    // - 데이터 수집 시 네트워크 연결이 필요합니다
    //
    // 📚 Supabase 테이블 구조:
    // - collected_tastings: 수집된 테이스팅 데이터
    // - collection_logs: 수집 로그 (선택사항)
    // - 다양한 통계 뷰들 (collection_stats, roastery_stats, origin_stats 등)
    // `);
  }
};

// 개발 환경에서만 전역 객체에 등록
if (isDevelopment) {
  // @ts-ignore
  global.DevUtils = DevUtils;
  // console.log('🛠️  개발자 데이터 수집 도구가 로드되었습니다. DevUtils.help()를 입력하여 사용법을 확인하세요.');
}

export default DevUtils;