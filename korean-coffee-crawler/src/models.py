from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class Coffee:
    roastery_name: str
    coffee_name: str
    origin: Optional[str] = None
    process: Optional[str] = None
    tasting_notes: Optional[List[str]] = None
    price: Optional[int] = None
    weight: Optional[str] = None
    roast_level: Optional[str] = None
    variety: Optional[str] = None
    altitude: Optional[str] = None
    harvest_date: Optional[str] = None
    url: Optional[str] = None
    crawled_at: datetime = None
    
    def __post_init__(self):
        if self.crawled_at is None:
            self.crawled_at = datetime.now()
        if self.tasting_notes is None:
            self.tasting_notes = []
    
    def to_dict(self):
        return {
            '로스터리': self.roastery_name,
            '커피명': self.coffee_name,
            '원산지': self.origin,
            '가공방식': self.process,
            '테이스팅노트': ', '.join(self.tasting_notes) if self.tasting_notes else '',
            '가격': self.price,
            '중량': self.weight,
            '로스팅레벨': self.roast_level,
            '품종': self.variety,
            '고도': self.altitude,
            '수확시기': self.harvest_date,
            'URL': self.url,
            '크롤링시간': self.crawled_at.strftime('%Y-%m-%d %H:%M:%S')
        }