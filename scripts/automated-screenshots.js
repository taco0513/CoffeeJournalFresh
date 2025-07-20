const { execSync } = require('child_process');
const fs = require('fs');

// UI 자동화를 위한 AppleScript 기반 스크린샷 스크립트
class AutomatedScreenshots {
  constructor() {
    this.screenshotsDir = './screenshots';
    this.delay = 2000; // 2초 딜레이
    this.screenshots = [];
    
    // screenshots 디렉토리 생성
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir);
    }
  }

  // AppleScript를 사용해서 시뮬레이터 제어
  executeAppleScript(script) {
    try {
      const result = execSync(`osascript -e '${script}'`, { encoding: 'utf8' });
      return result.trim();
    } catch (error) {
      console.error('AppleScript 실행 오류:', error.message);
      return null;
    }
  }

  // 시뮬레이터 활성화
  activateSimulator() {
    console.log('📱 시뮬레이터 활성화 중...');
    this.executeAppleScript('tell application "Simulator" to activate');
    this.wait(1000);
  }

  // 딜레이
  wait(ms) {
    execSync(`sleep ${ms / 1000}`);
  }

  // 스크린샷 찍기
  takeScreenshot(filename, description) {
    console.log(`📸 ${description} 스크린샷 촬영 중...`);
    const filepath = `${this.screenshotsDir}/${filename}`;
    
    try {
      execSync(`xcrun simctl io booted screenshot "${filepath}"`);
      this.screenshots.push({ filename, description, filepath });
      console.log(`✅ 저장됨: ${filepath}`);
    } catch (error) {
      console.error(`❌ 스크린샷 실패: ${error.message}`);
    }
    
    this.wait(this.delay);
  }

  // 화면의 특정 좌표 탭
  tapAtCoordinate(x, y, description = '') {
    console.log(`👆 터치: (${x}, ${y}) ${description}`);
    
    // iOS 시뮬레이터의 xcrun simctl 사용
    try {
      execSync(`xcrun simctl io booted touch ${x} ${y}`);
      this.wait(this.delay);
    } catch (error) {
      console.error(`❌ 터치 실패: ${error.message}`);
    }
  }

  // 뒤로 가기 (왼쪽 상단 버튼)
  goBack() {
    console.log('⬅️ 뒤로 가기');
    this.tapAtCoordinate(50, 100, '뒤로 가기 버튼');
  }

  // 다음 버튼 (오른쪽 하단)
  tapNext() {
    console.log('➡️ 다음 버튼');
    this.tapAtCoordinate(350, 800, '다음 버튼');
  }

  // 홈으로 돌아가기
  goHome() {
    console.log('🏠 홈으로 돌아가기');
    // 여러 번 뒤로 가기를 눌러서 홈으로
    for (let i = 0; i < 5; i++) {
      this.goBack();
      this.wait(1000);
    }
  }

  // 메인 스크린샷 캡처 실행
  async captureAllScreens() {
    console.log('🚀 Coffee Journal Fresh - 자동 스크린샷 시작');
    console.log('=' .repeat(50));

    this.activateSimulator();

    // 1. 홈 화면
    this.takeScreenshot('01-home-screen.png', '홈 화면');

    // 2. Journal 탭
    this.tapAtCoordinate(140, 870, 'Journal 탭'); // 하단 탭바 Journal
    this.takeScreenshot('02-journal-screen.png', 'Journal 화면');

    // 3. Stats 탭
    this.tapAtCoordinate(210, 870, 'Stats 탭'); // 하단 탭바 Stats
    this.takeScreenshot('03-stats-screen.png', 'Stats 화면');

    // 4. Profile 탭
    this.tapAtCoordinate(280, 870, 'Profile 탭'); // 하단 탭바 Profile
    this.takeScreenshot('04-profile-screen.png', 'Profile 화면');

    // 5. 취향 분석 버튼
    this.tapAtCoordinate(200, 500, '취향 분석 카드'); // 취향 분석 카드
    this.takeScreenshot('05-personal-taste-dashboard.png', '취향 분석 대시보드');

    // 6. 뒤로 가서 개발자 모드
    this.goBack();
    this.tapAtCoordinate(200, 650, '개발자 모드'); // 개발자 모드 버튼
    this.takeScreenshot('06-developer-screen.png', '개발자 화면');

    // 7. 데이터 테스트 화면
    this.tapAtCoordinate(200, 750, '데이터 테스트 화면'); // 데이터 테스트 버튼
    this.takeScreenshot('07-data-test-screen.png', '데이터 테스트 화면');

    // 8. 홈으로 돌아가서 테이스팅 플로우 시작
    this.goHome();
    this.tapAtCoordinate(70, 870, 'Home 탭'); // 홈 탭
    this.wait(1000);
    
    // 9. + 버튼으로 테이스팅 시작
    this.tapAtCoordinate(350, 800, '+ 테이스팅 시작 버튼'); // + 버튼
    this.takeScreenshot('08-coffee-info-entry.png', '커피 정보 입력');

    // 10. 다음 단계들
    this.tapNext(); // 로스터 노트로
    this.takeScreenshot('09-roaster-notes.png', '로스터 노트');

    this.tapNext(); // 플레이버 레벨1로
    this.takeScreenshot('10-flavor-level1.png', '플레이버 레벨 1');

    // 플레이버 선택
    this.tapAtCoordinate(200, 400, '플레이버 선택');
    this.takeScreenshot('11-flavor-level2.png', '플레이버 레벨 2');

    // 상세 플레이버 선택
    this.tapAtCoordinate(200, 400, '상세 플레이버 선택');
    this.takeScreenshot('12-flavor-level3.png', '플레이버 레벨 3');

    this.tapNext(); // 센서리로
    this.takeScreenshot('13-sensory-evaluation.png', '센서리 평가');

    this.tapNext(); // 개인 코멘트로
    this.takeScreenshot('14-personal-comment.png', '개인 코멘트');

    this.tapNext(); // 결과로
    this.takeScreenshot('15-tasting-result.png', '테이스팅 결과');

    // 완료 메시지
    console.log('');
    console.log('🎉 스크린샷 캡처 완료!');
    console.log('=' .repeat(50));
    console.log(`📁 총 ${this.screenshots.length}개 스크린샷 저장됨:`);
    this.screenshots.forEach((shot, index) => {
      console.log(`${index + 1}. ${shot.description} → ${shot.filename}`);
    });
    console.log(`📂 저장 위치: ${this.screenshotsDir}`);
  }
}

// 실행
const screenshotTaker = new AutomatedScreenshots();
screenshotTaker.captureAllScreens().catch(console.error);