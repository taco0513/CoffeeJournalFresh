# Coffee Journal - 브랜치 전략

## 현재 브랜치 구조

### 🏷️ Tags
- **v0.3.0** - MVP with Auth & Polish (2025-07-19)
  - Supabase 인증
  - Apple Sign-In
  - 모노크롬 UI
  - 빌드 최적화

### 🌿 Branches

#### main
- 프로덕션 준비 상태의 안정된 코드
- 직접 커밋보다는 PR을 통한 병합 권장

#### stable-v0.3
- v0.3.0의 안정된 상태 보존
- 핫픽스가 필요한 경우 이 브랜치에서 작업
- 오리지널 MVP 상태 유지

#### dev-danang-250719 (현재 브랜치)
- 새로운 방향의 개발 진행
- 실험적 기능 추가 가능
- 자유로운 리팩토링 허용
- 다낭에서 시작한 개발 브랜치 (2025-07-19)

## 브랜치 사용 가이드

### 1. 현재 브랜치 확인
```bash
git branch
```

### 2. 브랜치 전환
```bash
# 안정 버전으로 돌아가기
git checkout stable-v0.3

# 새 개발 브랜치로 전환
git checkout dev-danang-250719

# 메인 브랜치로 전환
git checkout main
```

### 3. 변경사항 병합
```bash
# dev-danang-250719의 변경사항을 main으로 병합
git checkout main
git merge dev-danang-250719

# 충돌 해결 후
git add .
git commit -m "Merge new features from dev-danang-250719"
```

### 4. 핫픽스 적용
```bash
# stable-v0.3에서 버그 수정
git checkout stable-v0.3
# ... 수정 작업 ...
git commit -m "Fix: critical bug"

# main과 dev-danang-250719에 적용
git checkout main
git cherry-pick <commit-hash>

git checkout dev-danang-250719
git cherry-pick <commit-hash>
```

## 개발 방향

### stable-v0.3 (보존용)
- 현재 MVP 상태 그대로 유지
- 크리티컬 버그만 수정
- 새 기능 추가 X

### dev-danang-250719 (실험용)
- 온보딩 프로세스 추가
- Quick Mode 구현
- Achievement 시스템
- UI/UX 대폭 개선
- 커뮤니티 기능 실험

### main (프로덕션)
- 테스트 완료된 기능만 병합
- 항상 빌드 가능한 상태 유지
- 배포 준비 상태

## 버전 태깅 규칙

- **Major (v1.0.0)**: 대규모 변경, 하위 호환성 없음
- **Minor (v0.4.0)**: 새 기능 추가, 하위 호환성 유지
- **Patch (v0.3.1)**: 버그 수정, 작은 개선

## 다음 마일스톤

### v0.4.0 목표 (dev-danang-250719)
- [ ] 온보딩 화면
- [ ] Quick Mode
- [ ] Achievement 시스템
- [ ] 진행 표시기
- [ ] 개선된 홈 화면

### v0.5.0 목표
- [ ] AI 추천 시스템
- [ ] 향미 프로필 시각화
- [ ] 월간 리포트
- [ ] 데이터 내보내기

### v1.0.0 목표
- [ ] 커뮤니티 기능 완성
- [ ] 앱스토어 출시
- [ ] 안정성 확보
- [ ] 성능 최적화