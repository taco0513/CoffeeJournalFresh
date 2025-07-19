import logging
from abc import ABC, abstractmethod
from typing import List, Optional
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

from ..models import Coffee


class BaseCrawler(ABC):
    def __init__(self, roastery_name: str, base_url: str, use_selenium: bool = False):
        self.roastery_name = roastery_name
        self.base_url = base_url
        self.use_selenium = use_selenium
        self.logger = logging.getLogger(self.__class__.__name__)
        
        if use_selenium:
            self.driver = self._setup_driver()
        else:
            self.session = requests.Session()
            self.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
    
    def _setup_driver(self):
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=options)
    
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        try:
            if self.use_selenium:
                self.driver.get(url)
                time.sleep(2)
                html = self.driver.page_source
            else:
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                html = response.text
            
            return BeautifulSoup(html, 'lxml')
        except Exception as e:
            self.logger.error(f"Error fetching {url}: {e}")
            return None
    
    @abstractmethod
    def get_coffee_list_urls(self) -> List[str]:
        pass
    
    @abstractmethod
    def parse_coffee_detail(self, url: str) -> Optional[Coffee]:
        pass
    
    def crawl(self) -> List[Coffee]:
        self.logger.info(f"Starting crawl for {self.roastery_name}")
        coffee_list = []
        
        try:
            urls = self.get_coffee_list_urls()
            self.logger.info(f"Found {len(urls)} coffee URLs")
            
            for i, url in enumerate(urls, 1):
                self.logger.info(f"Crawling {i}/{len(urls)}: {url}")
                coffee = self.parse_coffee_detail(url)
                
                if coffee:
                    coffee_list.append(coffee)
                    self.logger.info(f"Successfully parsed: {coffee.coffee_name}")
                else:
                    self.logger.warning(f"Failed to parse coffee from {url}")
                
                time.sleep(1)
            
        except Exception as e:
            self.logger.error(f"Error during crawl: {e}")
        finally:
            if self.use_selenium:
                self.driver.quit()
        
        self.logger.info(f"Crawl complete. Found {len(coffee_list)} coffees")
        return coffee_list
    
    def clean_text(self, text: Optional[str]) -> Optional[str]:
        if not text:
            return None
        return ' '.join(text.strip().split())
    
    def extract_price(self, text: str) -> Optional[int]:
        import re
        numbers = re.findall(r'[\d,]+', text)
        if numbers:
            try:
                return int(numbers[0].replace(',', ''))
            except:
                return None
        return None