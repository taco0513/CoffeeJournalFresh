import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class MomosCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="모모스커피",
            base_url="https://momos.co.kr",
            use_selenium=False
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        
        categories = [
            "/goods/goods_list.php?cateCd=037",
            "/goods/goods_list.php?cateCd=036001",
            "/goods/goods_list.php?cateCd=036002"
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
            name_elem = soup.select_one('div.item_detail_tit h3')
            coffee_name = self.clean_text(name_elem.text) if name_elem else None
            
            if not coffee_name:
                return None
            
            price_elem = soup.select_one('span.goods_price strong')
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
                    
                    if '생산지' in label or '원산지' in label or '산지' in label:
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
                    r'(?:Flavor Notes?|플레이버 노트)[:\s]*([^.\n]+)',
                    r'(?:향미|Flavor)[:\s]*([^.\n]+)',
                    r'(?:SCAA Score|점수)[:\s]*(\d+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        if pattern == r'(?:SCAA Score|점수)[:\s]*(\d+)':
                            continue
                        notes = [note.strip() for note in re.split(r'[,&/]', match)]
                        tasting_notes.extend(notes)
                
                if not origin:
                    origin_patterns = [
                        r'(?:Farm|농장)[:\s]*([^\n,]+)',
                        r'(?:Mill|밀)[:\s]*([^\n,]+)',
                        r'(?:Region|지역)[:\s]*([^\n,]+)'
                    ]
                    for pattern in origin_patterns:
                        match = re.search(pattern, text)
                        if match:
                            if origin:
                                origin += f", {match.group(1).strip()}"
                            else:
                                origin = match.group(1).strip()
            
            weight_options = soup.select('select[name="optionSnoInput"] option')
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