import re
from typing import List, Optional
from urllib.parse import urljoin

from .base_crawler import BaseCrawler
from ..models import Coffee


class AnthraciteCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(
            roastery_name="앤트러사이트",
            base_url="https://anthracitecoffee.com",
            use_selenium=True
        )
    
    def get_coffee_list_urls(self) -> List[str]:
        urls = []
        
        shop_url = f"{self.base_url}/shop"
        soup = self.get_page(shop_url)
        
        if not soup:
            return urls
        
        products = soup.select('div.product-item a.product-link, div.grid-item a')
        
        for product in products:
            href = product.get('href')
            if href:
                if not href.startswith('http'):
                    url = urljoin(self.base_url, href)
                else:
                    url = href
                    
                if 'product' in url and url not in urls:
                    urls.append(url)
        
        categories = soup.select('nav.shop-nav a, div.category-nav a')
        for category in categories:
            href = category.get('href')
            if href and 'coffee' in href.lower():
                cat_url = urljoin(self.base_url, href)
                cat_soup = self.get_page(cat_url)
                
                if cat_soup:
                    cat_products = cat_soup.select('div.product-item a.product-link, div.grid-item a')
                    for product in cat_products:
                        href = product.get('href')
                        if href:
                            url = urljoin(self.base_url, href) if not href.startswith('http') else href
                            if 'product' in url and url not in urls:
                                urls.append(url)
        
        return urls
    
    def parse_coffee_detail(self, url: str) -> Optional[Coffee]:
        soup = self.get_page(url)
        if not soup:
            return None
        
        try:
            name_elem = soup.select_one('h1.product-title, h1.product-name, div.product-info h1')
            coffee_name = self.clean_text(name_elem.text) if name_elem else None
            
            if not coffee_name:
                return None
            
            price_elem = soup.select_one('span.product-price, div.price-amount, span.money')
            price = None
            if price_elem:
                price = self.extract_price(price_elem.text)
            
            detail_elem = soup.select_one('div.product-description, div.product-details, div.description')
            
            origin = None
            process = None
            tasting_notes = []
            variety = None
            altitude = None
            roast_level = None
            
            if detail_elem:
                text = detail_elem.get_text()
                
                info_patterns = {
                    'origin': [
                        r'(?:Origin|산지|원산지)[:\s]*([^\n,]+)',
                        r'(?:Country|국가)[:\s]*([^\n,]+)',
                        r'(?:Region|지역)[:\s]*([^\n,]+)'
                    ],
                    'process': [
                        r'(?:Process|가공|프로세스)[:\s]*([^\n,]+)',
                        r'(?:Processing|가공방식)[:\s]*([^\n,]+)'
                    ],
                    'variety': [
                        r'(?:Variety|품종)[:\s]*([^\n,]+)',
                        r'(?:Varietal|재배품종)[:\s]*([^\n,]+)'
                    ],
                    'altitude': [
                        r'(?:Altitude|고도)[:\s]*([^\n,]+)',
                        r'(?:Elevation|해발)[:\s]*([^\n,]+)'
                    ],
                    'roast': [
                        r'(?:Roast|로스팅)[:\s]*([^\n,]+)',
                        r'(?:Roast Level|로스팅 레벨)[:\s]*([^\n,]+)'
                    ]
                }
                
                for key, patterns in info_patterns.items():
                    for pattern in patterns:
                        match = re.search(pattern, text, re.IGNORECASE)
                        if match:
                            value = match.group(1).strip()
                            if key == 'origin':
                                origin = value
                            elif key == 'process':
                                process = value
                            elif key == 'variety':
                                variety = value
                            elif key == 'altitude':
                                altitude = value
                            elif key == 'roast':
                                roast_level = value
                            break
                
                note_patterns = [
                    r'(?:Tasting Notes?|테이스팅 노트)[:\s]*([^.\n]+)',
                    r'(?:Cup Notes?|컵노트)[:\s]*([^.\n]+)',
                    r'(?:Flavor Notes?|플레이버)[:\s]*([^.\n]+)',
                    r'(?:Notes?|노트)[:\s]*([^.\n]+)'
                ]
                
                for pattern in note_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        notes = [note.strip() for note in re.split(r'[,&/·]', match)]
                        tasting_notes.extend(notes)
            
            info_list = soup.select('ul.product-info li, div.info-item')
            for item in info_list:
                item_text = item.get_text()
                for key, patterns in info_patterns.items():
                    for pattern in patterns:
                        match = re.search(pattern, item_text, re.IGNORECASE)
                        if match and not locals().get(key):
                            value = match.group(1).strip()
                            if key == 'origin':
                                origin = value
                            elif key == 'process':
                                process = value
                            elif key == 'variety':
                                variety = value
                            elif key == 'altitude':
                                altitude = value
                            elif key == 'roast':
                                roast_level = value
            
            weight_elem = soup.select_one('select.product-option option, div.weight-option')
            weight = None
            if weight_elem:
                weight_match = re.search(r'(\d+g)', weight_elem.text)
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
                roast_level=roast_level,
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Error parsing coffee detail from {url}: {e}")
            return None