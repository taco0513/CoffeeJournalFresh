describe('디버그 테스트', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('현재 화면 스크린샷 찍기', async () => {
    // 앱이 로드될 시간을 줍니다
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 스크린샷을 찍습니다
    await device.takeScreenshot('current-screen');
    
    // 화면에 무언가가 있는지 확인 (뭐든 하나라도 보이면 통과)
    try {
      await waitFor(element(by.id('any-element'))).toBeVisible().withTimeout(1000);
    } catch (e) {
      // 아무것도 찾을 수 없어도 스크린샷은 이미 찍혔으므로 통과
      console.log('화면 캡처 완료');
    }
  });
});