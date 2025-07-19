import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class CenterCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="센터커피",
            base_url="https://centercoffee.kr",
            use_selenium=True
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        
        categories = [
            "/product/list.html?cate_no=24",
            "/product/list.html?cate_no=43"
        ]
        
        for category in categories:
            page = 1
            while True:
                list_url = f"{self.base_url}{category}&page={page}"
                soup = self.get_page(list_url)
                
                if not soup:
                    break
                
                products = soup.select('ul.prdList li div.name a')
                
                if not products:
                    break
                
                for product in products:
                    href = product.get('href')
                    if href:
                        url = urljoin(self.base_url, href)
                        urls.append(url)
                
                page += 1
                
                if page > 5:
                    break
        
        return list(set(urls))
    
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
            
            info_table = soup.select('table.infoArea tbody tr')
            
            origin = None
            process = None
            tasting_notes = []
            variety = None
            altitude = None
            roast_level = None
            
            for row in info_table:
                th = row.select_one('th')
                td = row.select_one('td')
                
                if th and td:
                    label = self.clean_text(th.text)
                    value = self.clean_text(td.text)
                    
                    if not label or not value:
                        continue
                    
                    if 'Region' in label or '지역' in label or '산지' in label:
                        origin = value
                    elif 'Process' in label or '가공' in label:
                        process = value
                    elif 'Variety' in label or '품종' in label:
                        variety = value
                    elif 'Altitude' in label or '고도' in label:
                        altitude = value
                    elif 'Roast' in label or '로스팅' in label:
                        roast_level = value
            
            detail_content = soup.select_one('div#prdDetail div.cont')
            if detail_content:
                text = detail_content.get_text()
                
                note_patterns = [
                    r'(?:Tasting Notes?|Flavor Notes?|향미|플레이버)[:\s]*([^.\n]+)',
                    r'(?:Cup Notes?|컵노트)[:\s]*([^.\n]+)',
                    r'(?:Aroma|향)[:\s]*([^,\n]+)',
                    r'(?:Flavor|맛)[:\s]*([^,\n]+)',
                    r'(?:Finish|후미)[:\s]*([^,\n]+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        notes = [note.strip() for note in re.split(r'[,&]', match)]
                        tasting_notes.extend(notes)
                
                if not origin:
                    origin_match = re.search(r'(?:Country|Region|국가|지역)[:\s]*([^\n,]+)', text)
                    if origin_match:
                        origin = origin_match.group(1).strip()
                
                if not process:
                    process_match = re.search(r'(?:Process|가공)[:\s]*([^\n,]+)', text)
                    if process_match:
                        process = process_match.group(1).strip()
            
            return Coffee(
                roastery_name=self.roastery_name,
                coffee_name=coffee_name,
                origin=origin,
                process=process,
                tasting_notes=list(set(tasting_notes)) if tasting_notes else None,
                price=price,
                variety=variety,
                altitude=altitude,
                roast_level=roast_level,
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing coffee detail from {url}: {e}")
            return None