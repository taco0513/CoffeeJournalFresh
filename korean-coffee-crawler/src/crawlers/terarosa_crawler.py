import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class TerarosaCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="테라로사",
            base_url="https://www.terarosa.com",
            use_selenium=True
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        
        categories = [
            "/product/list.html?cate_no=50",
            "/product/list.html?cate_no=61",
            "/product/list.html?cate_no=62"
        ]
        
        for category in categories:
            page = 1
            while True:
                list_url = f"{self.base_url}{category}&page={page}"
                soup = self.get_page(list_url)
                
                if not soup:
                    break
                
                products = soup.select('div.xans-product-normalpackage li.item div.thumbnail a')
                
                if not products:
                    break
                
                for product in products:
                    href = product.get('href')
                    if href:
                        url = urljoin(self.base_url, href)
                        if url not in urls:
                            urls.append(url)
                
                page += 1
                
                if page > 5:
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
            
            info_area = soup.select('div.xans-product-detaildesign table tbody tr')
            
            origin = None
            process = None
            tasting_notes = []
            variety = None
            altitude = None
            harvest_date = None
            roast_level = None
            
            for row in info_area:
                th = row.select_one('th')
                td = row.select_one('td')
                
                if th and td:
                    label = self.clean_text(th.text)
                    value = self.clean_text(td.text)
                    
                    if not label or not value:
                        continue
                    
                    if 'Country' in label or '국가' in label or '산지' in label:
                        origin = value
                    elif 'Process' in label or '가공' in label or '프로세스' in label:
                        process = value
                    elif 'Variety' in label or '품종' in label:
                        variety = value
                    elif 'Altitude' in label or '고도' in label:
                        altitude = value
                    elif 'Harvest' in label or '수확' in label:
                        harvest_date = value
                    elif 'Roast' in label or '로스팅' in label:
                        roast_level = value
            
            detail_content = soup.select_one('div.cont')
            if detail_content:
                text = detail_content.get_text()
                
                note_patterns = [
                    r'(?:Cupping Notes?|컵핑 노트)[:\s]*([^.\n]+)',
                    r'(?:Tasting Notes?|테이스팅 노트)[:\s]*([^.\n]+)',
                    r'(?:Flavor|향미)[:\s]*([^.\n]+)',
                    r'(?:Cup Profile|컵 프로파일)[:\s]*([^.\n]+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        notes = [note.strip() for note in re.split(r'[,&]', match)]
                        tasting_notes.extend(notes)
                
                if not origin:
                    origin_patterns = [
                        r'(?:Farm|농장)[:\s]*([^\n,]+)',
                        r'(?:Region|지역)[:\s]*([^\n,]+)'
                    ]
                    for pattern in origin_patterns:
                        match = re.search(pattern, text)
                        if match:
                            origin = match.group(1).strip()
                            break
            
            weight_elem = soup.select_one('select[name="option1"] option')
            weight = None
            if weight_elem:
                weight_text = weight_elem.text
                weight_match = re.search(r'(\d+g)', weight_text)
                if weight_match:
                    weight = weight_match.group(1)
            
            return Coffee(
                roastery_name=self.roastery_name,
                coffee_name=coffee_name,
                origin=origin,
                process=process,
                tasting_notes=list(set(tasting_notes)) if tasting_notes else None,
                price=price,
                weight=weight,
                variety=variety,
                altitude=altitude,
                harvest_date=harvest_date,
                roast_level=roast_level,
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing coffee detail from {url}: {e}")
            return None