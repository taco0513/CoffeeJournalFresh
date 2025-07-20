#!/bin/bash

# Coffee Journal Fresh - 자동 스크린샷 스크립트
# iOS 시뮬레이터에서 자동으로 앱을 조작하며 스크린샷을 찍습니다.

echo "🚀 Coffee Journal Fresh - 자동 스크린샷 시작"
echo "================================================"

# 설정
SCREENSHOTS_DIR="./screenshots"
DELAY=3  # 3초 딜레이

# 디렉토리 생성
mkdir -p $SCREENSHOTS_DIR

# 함수: 스크린샷 찍기
take_screenshot() {
    local filename=$1
    local description=$2
    echo "📸 $description 촬영 중..."
    xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/$filename"
    sleep $DELAY
}

# 함수: 화면 터치
tap_screen() {
    local x=$1
    local y=$2
    local description=$3
    echo "👆 터치: ($x, $y) $description"
    xcrun simctl io booted touch $x $y
    sleep $DELAY
}

# 시뮬레이터 활성화
echo "📱 시뮬레이터 활성화 중..."
osascript -e 'tell application "Simulator" to activate'
sleep 2

# 스크린샷 시퀀스 시작
echo "📸 스크린샷 캡처 시작..."

# 1. 현재 화면 (홈)
take_screenshot "01-current-screen.png" "현재 화면"

# 2. Journal 탭 (하단 탭바 두 번째)
tap_screen 140 870 "Journal 탭"
take_screenshot "02-journal-screen.png" "Journal 화면"

# 3. Stats 탭 (하단 탭바 세 번째)  
tap_screen 210 870 "Stats 탭"
take_screenshot "03-stats-screen.png" "Stats 화면"

# 4. Profile 탭 (하단 탭바 네 번째)
tap_screen 280 870 "Profile 탭"
take_screenshot "04-profile-screen.png" "Profile 화면"

# 5. 취향 분석 카드 클릭
echo "🎯 취향 분석 진입..."
tap_screen 200 520 "취향 분석 카드"
take_screenshot "05-personal-taste.png" "취향 분석 화면"

# 6. 뒤로 가기
tap_screen 50 100 "뒤로 가기"

# 7. 개발자 모드 클릭
echo "⚙️ 개발자 모드 진입..."
tap_screen 200 650 "개발자 모드"
take_screenshot "06-developer-screen.png" "개발자 화면"

# 8. 데이터 테스트 클릭
echo "🧪 데이터 테스트 진입..."
tap_screen 200 750 "데이터 테스트"
take_screenshot "07-data-test.png" "데이터 테스트 화면"

# 9. 홈으로 돌아가기 (여러 번 뒤로)
echo "🏠 홈으로 복귀..."
tap_screen 50 100 "뒤로 가기"
sleep 2
tap_screen 50 100 "뒤로 가기"
sleep 2

# 10. Home 탭
tap_screen 70 870 "Home 탭"

# 11. 테이스팅 시작 (+ 버튼)
echo "☕ 테이스팅 플로우 시작..."
tap_screen 350 800 "+ 테이스팅 시작"
take_screenshot "08-coffee-info.png" "커피 정보 입력"

# 12. 다음 버튼 (로스터 노트)
tap_screen 350 800 "다음 버튼"
take_screenshot "09-roaster-notes.png" "로스터 노트"

# 13. 다음 버튼 (플레이버 레벨1)
tap_screen 350 800 "다음 버튼"
take_screenshot "10-flavor-level1.png" "플레이버 레벨 1"

# 14. 플레이버 선택
tap_screen 200 400 "플레이버 선택"
take_screenshot "11-flavor-level2.png" "플레이버 레벨 2"

# 15. 상세 플레이버 선택
tap_screen 200 400 "상세 플레이버"
take_screenshot "12-flavor-level3.png" "플레이버 레벨 3"

# 16. 다음 (센서리)
tap_screen 350 800 "다음 버튼"
take_screenshot "13-sensory.png" "센서리 평가"

# 17. 다음 (코멘트)
tap_screen 350 800 "다음 버튼"
take_screenshot "14-comment.png" "개인 코멘트"

# 18. 다음 (결과)
tap_screen 350 800 "다음 버튼"
take_screenshot "15-result.png" "테이스팅 결과"

echo ""
echo "🎉 자동 스크린샷 완료!"
echo "================================================"
echo "📁 저장 위치: $SCREENSHOTS_DIR"
echo "📊 총 스크린샷 수: $(ls $SCREENSHOTS_DIR/*.png 2>/dev/null | wc -l)개"
echo ""
echo "💡 팁: 좌표가 맞지 않으면 스크립트를 수정하세요"
echo "   - 시뮬레이터 해상도에 따라 좌표가 달라질 수 있습니다"
echo "   - iPhone 16 시뮬레이터 기준으로 작성되었습니다"