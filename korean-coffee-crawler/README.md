# Korean Coffee Crawler

한국 스페셜티 커피 로스터리들의 커피 정보를 크롤링하는 Python 프로젝트입니다.

## 기능

- 주요 로스터리 웹사이트에서 커피 정보 크롤링
- 커피명, 원산지, 가공방식, 테이스팅 노트 등 추출
- CSV와 Excel 파일로 저장

## 지원 로스터리

현재 구현된 로스터리 (13개):
- 프릳츠 커피 (fritz)
- 센터커피 (center)
- 테라로사 (terarosa)
- 커피리브레 (coffeelibre)
- 모모스커피 (momos)
- 앤트러사이트 (anthracite)
- 엘카페 (elcafe)
- 빈브라더스 (beanbrothers)
- 로우키 (lowkey)
- 키헤이 (kihei)
- 리사르커피 (leesar)
- 리플렉트커피 (reflect)
- 콩볶는사람들 (coffeeroasters)

## 설치

```bash
pip install -r requirements.txt
```

## 사용법

### 모든 로스터리 크롤링
```bash
python main.py
```

### 특정 로스터리만 크롤링
```bash
python main.py --roasteries fritz center terarosa

# 현재 사용 가능한 로스터리:
# fritz, center, terarosa, coffeelibre, momos, anthracite, elcafe, 
# beanbrothers, lowkey, kihei, leesar, reflect, coffeeroasters
```

### 저장 옵션
```bash
# 로스터리별로 분리해서 저장
python main.py --save-mode separate

# 하나의 파일로 통합해서 저장
python main.py --save-mode combined

# 둘 다 저장 (기본값)
python main.py --save-mode both
```

## 데이터 구조

크롤링된 데이터는 다음 정보를 포함합니다:
- 로스터리명
- 커피명
- 원산지
- 가공방식
- 테이스팅 노트
- 가격
- 중량
- 로스팅 레벨
- 품종
- 고도
- 수확시기
- URL
- 크롤링 시간

## 출력 파일

- `data/processed/` 폴더에 저장됨
- CSV와 Excel 형식으로 저장
- 파일명에 타임스탬프 포함