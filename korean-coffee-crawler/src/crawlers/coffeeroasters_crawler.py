import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class CoffeeRoastersCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="콩볶는사람들",
            base_url="https://coffeeroasters.co.kr",
            use_selenium=False
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        
        categories = [
            "/goods/goods_list.php?cateCd=001",
            "/goods/goods_list.php?cateCd=002",
            "/goods/goods_list.php?cateCd=003",
            "/goods/goods_list.php?cateCd=004"
        ]
        
        for category in categories:
            page = 1
            while True:
                list_url = f"{self.base_url}{category}&page={page}"
                soup = self.get_page(list_url)
                
                if not soup:
                    break
                
                products = soup.select('div.goods_list_item div.item_photo_box a')
                
                if not products:
                    break
                
                for product in products:
                    href = product.get('href')
                    if href:
                        url = urljoin(self.base_url, href)
                        if url not in urls and 'goods_view.php' in url:
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
            name_elem = soup.select_one('div.item_detail_tit h3')
            if not name_elem:
                name_elem = soup.select_one('div.goods_name')
            coffee_name = self.clean_text(name_elem.text) if name_elem else None
            
            if not coffee_name:
                return None
            
            price_elem = soup.select_one('span.goods_price strong')
            if not price_elem:
                price_elem = soup.select_one('strong.price')
            price = None
            if price_elem:
                price = self.extract_price(price_elem.text)
            
            info_table = soup.select('div.goods_spec table tbody tr')
            
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
                    
                    if '원산지' in label or '생산지' in label or '산지' in label:
                        origin = value
                    elif '가공' in label or '프로세스' in label:
                        process = value
                    elif '품종' in label:
                        variety = value
                    elif '고도' in label:
                        altitude = value
                    elif '수확' in label:
                        harvest_date = value
                    elif '로스팅' in label:
                        roast_level = value
            
            detail_elem = soup.select_one('div.js_goods_desc')
            if detail_elem:
                text = detail_elem.get_text()
                
                note_patterns = [
                    r'(?:Cup Notes?|컵노트)[:\s]*([^.\n]+)',
                    r'(?:Tasting Notes?|테이스팅 노트)[:\s]*([^.\n]+)',
                    r'(?:Flavor|향미)[:\s]*([^.\n]+)',
                    r'(?:특징|Character)[:\s]*([^.\n]+)',
                    r'(?:맛|Taste)[:\s]*([^.\n]+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        notes = [note.strip() for note in re.split(r'[,&/·]', match)]
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
                    process_match = re.search(r'(?:가공방식|Processing)[:\s]*([^\n,]+)', text)
                    if process_match:
                        process = process_match.group(1).strip()
                
                if not roast_level:
                    roast_patterns = [
                        r'(?:로스팅 포인트|Roast Point)[:\s]*([^\n,]+)',
                        r'(?:로스팅 단계|Roast Level)[:\s]*([^\n,]+)'
                    ]
                    for pattern in roast_patterns:
                        match = re.search(pattern, text)
                        if match:
                            roast_level = match.group(1).strip()
                            break
            
            weight_options = soup.select('select[name="optionSnoInput"] option')
            weight = None
            for option in weight_options:
                weight_match = re.search(r'(\d+g|\d+kg)', option.text)
                if weight_match:
                    weight = weight_match.group(1)
                    break
            
            if not weight:
                weight_elem = soup.select_one('span.weight')
                if weight_elem:
                    weight_match = re.search(r'(\d+g|\d+kg)', weight_elem.text)
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