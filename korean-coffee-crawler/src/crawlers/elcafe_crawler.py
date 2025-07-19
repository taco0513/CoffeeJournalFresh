import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class ElCafeCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="엘카페",
            base_url="https://elcafe.co.kr",
            use_selenium=False
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        
        categories = [
            "/product/list.html?cate_no=58",
            "/product/list.html?cate_no=59",
            "/product/list.html?cate_no=60"
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
            
            info_table = soup.select('table.xans-product-additional tbody tr')
            
            origin = None
            process = None
            tasting_notes = []
            variety = None
            altitude = None
            harvest_date = None
            roast_level = None
            
            for row in info_table:
                th = row.select_one('th')
                td = row.select_one('td')
                
                if th and td:
                    label = self.clean_text(th.text)
                    value = self.clean_text(td.text)
                    
                    if not label or not value:
                        continue
                    
                    if '원산지' in label or 'Origin' in label or '생산지' in label:
                        origin = value
                    elif '가공' in label or 'Process' in label or '프로세싱' in label:
                        process = value
                    elif '품종' in label or 'Variety' in label:
                        variety = value
                    elif '고도' in label or 'Altitude' in label:
                        altitude = value
                    elif '수확' in label or 'Harvest' in label:
                        harvest_date = value
                    elif '로스팅' in label or 'Roast' in label:
                        roast_level = value
            
            detail_content = soup.select_one('div#prdDetail div.cont')
            if detail_content:
                text = detail_content.get_text()
                
                note_patterns = [
                    r'(?:Cupping Notes?|컵핑 노트)[:\s]*([^.\n]+)',
                    r'(?:Tasting Notes?|테이스팅 노트)[:\s]*([^.\n]+)',
                    r'(?:Flavor Profile|플레이버 프로파일)[:\s]*([^.\n]+)',
                    r'(?:향미|Flavor)[:\s]*([^.\n]+)',
                    r'(?:컵 특징|Cup Character)[:\s]*([^.\n]+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        notes = [note.strip() for note in re.split(r'[,&/]', match)]
                        tasting_notes.extend(notes)
                
                if not origin:
                    origin_patterns = [
                        r'(?:농장|Farm)[:\s]*([^\n,]+)',
                        r'(?:지역|Region)[:\s]*([^\n,]+)',
                        r'(?:협동조합|Cooperative)[:\s]*([^\n,]+)'
                    ]
                    for pattern in origin_patterns:
                        match = re.search(pattern, text)
                        if match:
                            if origin:
                                origin += f", {match.group(1).strip()}"
                            else:
                                origin = match.group(1).strip()
                
                if not process:
                    process_match = re.search(r'(?:Processing Method|가공방식)[:\s]*([^\n,]+)', text)
                    if process_match:
                        process = process_match.group(1).strip()
            
            weight_options = soup.select('select[name="option1"] option, ul.xans-product-option li')
            weight = None
            for option in weight_options:
                weight_match = re.search(r'(\d+g)', option.text)
                if weight_match:
                    weight = weight_match.group(1)
                    break
            
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