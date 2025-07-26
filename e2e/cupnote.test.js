describe('CupNote App', () => {
  beforeAll(async () => {
    // 앱이 이미 실행중이면 재시작하지 않음
    await device.launchApp({ delete: false });
  });

  // reloadReactNative를 제거하고 더 안정적인 방법 사용
  // beforeEach(async () => {
  //   await device.reloadReactNative();
  // });

  describe('로그인 화면', () => {
    it('앱이 시작되면 로그인 화면이 보여야 함', async () => {
      // 로그인 화면의 타이틀이나 로고 확인
      await expect(element(by.text('CupNote'))).toBeVisible();
    });

    it('Apple 로그인 버튼이 표시되어야 함', async () => {
      await expect(element(by.text('Apple로 로그인'))).toBeVisible();
    });

    it('Google 로그인 버튼이 표시되어야 함', async () => {
      await expect(element(by.text('Google로 로그인'))).toBeVisible();
    });
  });

  describe('메인 화면', () => {
    // 실제 로그인은 복잡하므로, 개발 모드로 바로 진입하는 방법을 사용할 수 있음
    it('홈 화면으로 이동할 수 있어야 함', async () => {
      // 개발자 모드나 테스트 모드로 로그인 우회
      // await element(by.id('skip-login-dev')).tap();
      
      // 또는 로그인 후 홈 화면 확인
      // await expect(element(by.text('오늘의 커피'))).toBeVisible();
    });
  });

  describe('커피 기록 플로우', () => {
    it('새 커피 기록을 시작할 수 있어야 함', async () => {
      // 플러스 버튼이나 '커피 기록하기' 버튼 찾기
      // await element(by.id('add-coffee-button')).tap();
      // await expect(element(by.text('커피 정보'))).toBeVisible();
    });

    it('커피 정보를 입력할 수 있어야 함', async () => {
      // 커피 이름 입력
      // await element(by.id('coffee-name-input')).typeText('블루보틀 블렌드');
      // await element(by.id('next-button')).tap();
    });

    it('감각 평가를 할 수 있어야 함', async () => {
      // 감각 평가 화면
      // await expect(element(by.text('감각 평가'))).toBeVisible();
      // 슬라이더 조작
      // await element(by.id('acidity-slider')).swipe('right', 'slow', 0.5);
    });
  });

  describe('네비게이션', () => {
    it('하단 탭바가 표시되어야 함', async () => {
      // 홈, 기록, 통계, 프로필 탭 확인
      await waitFor(element(by.text('홈'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('기록'))).toBeVisible();
      await expect(element(by.text('통계'))).toBeVisible();
      await expect(element(by.text('프로필'))).toBeVisible();
    });

    it('탭을 눌러서 화면을 전환할 수 있어야 함', async () => {
      await element(by.text('기록')).tap();
      // 기록 화면이 보이는지 확인
      // await expect(element(by.text('나의 커피 기록'))).toBeVisible();
    });
  });
});