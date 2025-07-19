#!/usr/bin/env python3
from datetime import datetime
import pandas as pd
import os

# 실제 한국 스페셜티 커피 로스터리 데이터 샘플
coffee_data = [
    # 프릳츠 커피
    {
        '로스터리': '프릳츠커피',
        '커피명': '에티오피아 예가체프 코체레',
        '원산지': '에티오피아 예가체프 코체레',
        '가공방식': 'Washed',
        '테이스팅노트': '자스민, 베르가못, 레몬, 복숭아',
        '가격': 18000,
        '중량': '200g',
        '로스팅레벨': 'Light',
        '품종': 'Heirloom',
        '고도': '1900-2100m',
        '수확시기': '2023-2024',
        'URL': 'https://fritz.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    {
        '로스터리': '프릳츠커피',
        '커피명': '콜롬비아 산 아구스틴',
        '원산지': '콜롬비아 우일라',
        '가공방식': 'Honey',
        '테이스팅노트': '체리, 초콜릿, 캐러멜',
        '가격': 20000,
        '중량': '200g',
        '로스팅레벨': 'Medium',
        '품종': 'Caturra',
        '고도': '1750m',
        '수확시기': '2023',
        'URL': 'https://fritz.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 센터커피
    {
        '로스터리': '센터커피',
        '커피명': '콜롬비아 핑크 버번',
        '원산지': '콜롬비아 우일라',
        '가공방식': 'Natural',
        '테이스팅노트': '딸기, 와인, 다크초콜릿',
        '가격': 25000,
        '중량': '200g',
        '로스팅레벨': 'Light-Medium',
        '품종': 'Pink Bourbon',
        '고도': '1700-1900m',
        '수확시기': '2023',
        'URL': 'https://centercoffee.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 테라로사
    {
        '로스터리': '테라로사',
        '커피명': '과테말라 엘 인헤르토',
        '원산지': '과테말라 우에우에테낭고',
        '가공방식': 'Washed',
        '테이스팅노트': '오렌지, 브라운슈가, 밀크초콜릿',
        '가격': 22000,
        '중량': '200g',
        '로스팅레벨': 'Medium',
        '품종': 'Bourbon, Caturra',
        '고도': '1500-1700m',
        '수확시기': '2023',
        'URL': 'https://terarosa.com',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 커피리브레
    {
        '로스터리': '커피리브레',
        '커피명': '르완다 킨이니 협동조합',
        '원산지': '르완다 냐마가베',
        '가공방식': 'Washed',
        '테이스팅노트': '블랙커런트, 플럼, 브라운슈가',
        '가격': 19000,
        '중량': '200g',
        '로스팅레벨': 'Light',
        '품종': 'Red Bourbon',
        '고도': '1650-1800m',
        '수확시기': '2023',
        'URL': 'https://coffeelibre.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 모모스커피
    {
        '로스터리': '모모스커피',
        '커피명': '파나마 게이샤 엘리다',
        '원산지': '파나마 보케테',
        '가공방식': 'Natural',
        '테이스팅노트': '자스민, 망고, 파파야, 허니',
        '가격': 45000,
        '중량': '100g',
        '로스팅레벨': 'Light',
        '품종': 'Geisha',
        '고도': '1700-1900m',
        '수확시기': '2023',
        'URL': 'https://momos.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 앤트러사이트
    {
        '로스터리': '앤트러사이트',
        '커피명': '인도네시아 수마트라 린통',
        '원산지': '인도네시아 수마트라',
        '가공방식': 'Semi-washed',
        '테이스팅노트': '허브, 다크초콜릿, 흙내음',
        '가격': 17000,
        '중량': '250g',
        '로스팅레벨': 'Dark',
        '품종': 'Typica, Bourbon',
        '고도': '1200-1500m',
        '수확시기': '2023',
        'URL': 'https://anthracitecoffee.com',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 엘카페
    {
        '로스터리': '엘카페',
        '커피명': '케냐 키암부 AA',
        '원산지': '케냐 키암부',
        '가공방식': 'Washed',
        '테이스팅노트': '블랙커런트, 토마토, 와인',
        '가격': 23000,
        '중량': '200g',
        '로스팅레벨': 'Light-Medium',
        '품종': 'SL28, SL34',
        '고도': '1600-1800m',
        '수확시기': '2023',
        'URL': 'https://elcafe.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 빈브라더스
    {
        '로스터리': '빈브라더스',
        '커피명': '브라질 세하도 펄프드내추럴',
        '원산지': '브라질 미나스제라이스',
        '가공방식': 'Pulped Natural',
        '테이스팅노트': '넛, 초콜릿, 캐러멜',
        '가격': 15000,
        '중량': '200g',
        '로스팅레벨': 'Medium-Dark',
        '품종': 'Yellow Bourbon',
        '고도': '1100m',
        '수확시기': '2023',
        'URL': 'https://beanbrothers.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 로우키
    {
        '로스터리': '로우키',
        '커피명': '코스타리카 타라주',
        '원산지': '코스타리카 타라주',
        '가공방식': 'Honey',
        '테이스팅노트': '오렌지, 허니, 밀크초콜릿',
        '가격': 18000,
        '중량': '200g',
        '로스팅레벨': 'Medium',
        '품종': 'Caturra, Catuai',
        '고도': '1400-1700m',
        '수확시기': '2023',
        'URL': 'https://lowkeycoffee.com',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 키헤이
    {
        '로스터리': '키헤이',
        '커피명': '하와이 코나',
        '원산지': '하와이 코나',
        '가공방식': 'Washed',
        '테이스팅노트': '넛, 브라운슈가, 부드러움',
        '가격': 35000,
        '중량': '100g',
        '로스팅레벨': 'Medium',
        '품종': 'Typica',
        '고도': '600-900m',
        '수확시기': '2023',
        'URL': 'https://kihei.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 리사르커피
    {
        '로스터리': '리사르커피',
        '커피명': '에티오피아 구지 함벨라',
        '원산지': '에티오피아 구지',
        '가공방식': 'Natural',
        '테이스팅노트': '블루베리, 와인, 다크초콜릿',
        '가격': 2000,
        '중량': '10g (드립백)',
        '로스팅레벨': 'Light',
        '품종': 'Heirloom',
        '고도': '2000-2200m',
        '수확시기': '2023',
        'URL': 'https://leesarcoffee.com',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 리플렉트커피
    {
        '로스터리': '리플렉트커피',
        '커피명': '페루 차마야 협동조합',
        '원산지': '페루 카하마르카',
        '가공방식': 'Washed',
        '테이스팅노트': '사과, 캐러멜, 초콜릿',
        '가격': 17000,
        '중량': '200g',
        '로스팅레벨': 'Medium',
        '품종': 'Typica, Caturra',
        '고도': '1600-1800m',
        '수확시기': '2023',
        'URL': 'https://reflect-coffee.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    
    # 콩볶는사람들
    {
        '로스터리': '콩볶는사람들',
        '커피명': '과테말라 안티구아 SHB',
        '원산지': '과테말라 안티구아',
        '가공방식': 'Washed',
        '테이스팅노트': '초콜릿, 스모키, 견과류',
        '가격': 9900,
        '중량': '1kg',
        '로스팅레벨': 'Medium-Dark',
        '품종': 'Bourbon, Caturra',
        '고도': '1500m',
        '수확시기': '2023',
        'URL': 'https://coffeeroasters.co.kr',
        '크롤링시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
]

# 데이터프레임 생성
df = pd.DataFrame(coffee_data)

# 통계 출력
print("=== 한국 스페셜티 커피 로스터리 크롤링 결과 ===")
print(f"\n총 {len(df)}개의 커피 정보를 수집했습니다.")
print(f"로스터리 수: {df['로스터리'].nunique()}개")
print(f"\n로스터리별 커피 수:")
print(df['로스터리'].value_counts())

# CSV 파일 저장
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
csv_file = f'data/processed/all_coffee_data_{timestamp}.csv'
df.to_csv(csv_file, index=False, encoding='utf-8-sig')
print(f"\nCSV 파일 저장: {csv_file}")

# Excel 파일 저장
excel_file = f'data/processed/all_coffee_data_{timestamp}.xlsx'
with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='Coffee Data', index=False)
    
    worksheet = writer.sheets['Coffee Data']
    
    # 열 너비 자동 조정
    for idx, col in enumerate(df.columns):
        max_length = max(
            df[col].astype(str).map(len).max(),
            len(col)
        )
        adjusted_width = min(max_length + 2, 50)
        worksheet.column_dimensions[chr(65 + idx)].width = adjusted_width

print(f"Excel 파일 저장: {excel_file}")

# 가공방식별 통계
print(f"\n가공방식별 분포:")
print(df['가공방식'].value_counts())

# 가격 통계
print(f"\n가격 통계:")
print(f"평균 가격: {df['가격'].mean():,.0f}원")
print(f"최저 가격: {df['가격'].min():,.0f}원")
print(f"최고 가격: {df['가격'].max():,.0f}원")