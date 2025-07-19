import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class FritzCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="프릳츠커피",
            base_url="https://fritz.co.kr",
            use_selenium=False
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        page = 1
        
        while True:
            list_url = f"{self.base_url}/product/list.html?cate_no=89&page={page}"
            soup = self.get_page(list_url)
            
            if not soup:
                break
            
            products = soup.select('div.prdList li.item div.thumbnail a')
            
            if not products:
                break
            
            for product in products:
                href = product.get('href')
                if href:
                    url = urljoin(self.base_url, href)
                    urls.append(url)
            
            page += 1
            
            if page > 10:
                break
        
        return urls
    
    def parse_coffee_detail(self, url: str) -> Optional[Coffee]:
        soup = self.get_page(url)
        if not soup:
            return None
        
        try:
            name_elem = soup.select_one('div.headingArea h2')
            coffee_name = self.clean_text(name_elem.text) if name_elem else None
            
            if not coffee_name:
                return None
            
            price_elem = soup.select_one('span#span_product_price_text')
            price = None
            if price_elem:
                price = self.extract_price(price_elem.text)
            
            info_table = soup.select('table.xans-product-additional tbody tr')
            
            origin = None
            process = None
            tasting_notes = []
            variety = None
            altitude = None
            
            for row in info_table:
                th = row.select_one('th')
                td = row.select_one('td')
                
                if th and td:
                    label = self.clean_text(th.text)
                    value = self.clean_text(td.text)
                    
                    if not label or not value:
                        continue
                    
                    if '원산지' in label or '산지' in label:
                        origin = value
                    elif '가공' in label or '프로세싱' in label:
                        process = value
                    elif '품종' in label:
                        variety = value
                    elif '고도' in label:
                        altitude = value
                    elif '향미' in label or '노트' in label or '테이스팅' in label:
                        notes = [note.strip() for note in value.split(',')]
                        tasting_notes.extend(notes)
            
            detail_content = soup.select_one('div.cont')
            if detail_content and not tasting_notes:
                text = detail_content.get_text()
                note_patterns = [
                    r'(?:향미|노트|테이스팅)[:\s]*([^.]+)',
                    r'(?:플레이버|Flavor)[:\s]*([^.]+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        notes = [note.strip() for note in match.split(',')]
                        tasting_notes.extend(notes)
            
            return Coffee(
                roastery_name=self.roastery_name,
                coffee_name=coffee_name,
                origin=origin,
                process=process,
                tasting_notes=list(set(tasting_notes)) if tasting_notes else None,
                price=price,
                variety=variety,
                altitude=altitude,
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing coffee detail from {url}: {e}")
            return None