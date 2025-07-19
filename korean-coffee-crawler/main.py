#!/usr/bin/env python3
import logging
import sys
from datetime import datetime
import argparse

from src.crawlers.fritz_crawler import FritzCrawler
from src.crawlers.center_crawler import CenterCrawler
from src.crawlers.terarosa_crawler import TerarosaCrawler
from src.crawlers.coffeelibre_crawler import CoffeeLibreCrawler
from src.crawlers.momos_crawler import MomosCrawler
from src.crawlers.anthracite_crawler import AnthraciteCrawler
from src.crawlers.elcafe_crawler import ElCafeCrawler
from src.crawlers.beanbrothers_crawler import BeanBrothersCrawler
from src.crawlers.lowkey_crawler import LowkeyCrawler
from src.crawlers.kihei_crawler import KiheiCrawler
from src.crawlers.leesar_crawler import LeesarCrawler
from src.crawlers.reflect_crawler import ReflectCrawler
from src.crawlers.coffeeroasters_crawler import CoffeeRoastersCrawler
from src.utils.data_saver import DataSaver


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'crawl_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


CRAWLERS = {
    'fritz': FritzCrawler,
    'center': CenterCrawler,
    'terarosa': TerarosaCrawler,
    'coffeelibre': CoffeeLibreCrawler,
    'momos': MomosCrawler,
    'anthracite': AnthraciteCrawler,
    'elcafe': ElCafeCrawler,
    'beanbrothers': BeanBrothersCrawler,
    'lowkey': LowkeyCrawler,
    'kihei': KiheiCrawler,
    'leesar': LeesarCrawler,
    'reflect': ReflectCrawler,
    'coffeeroasters': CoffeeRoastersCrawler,
}


def main():
    parser = argparse.ArgumentParser(description='Korean Coffee Roastery Crawler')
    parser.add_argument(
        '--roasteries', 
        nargs='+', 
        choices=list(CRAWLERS.keys()) + ['all'],
        default=['all'],
        help='Select roasteries to crawl'
    )
    parser.add_argument(
        '--save-mode',
        choices=['combined', 'separate', 'both'],
        default='both',
        help='How to save the data'
    )
    
    args = parser.parse_args()
    
    if 'all' in args.roasteries:
        selected_crawlers = list(CRAWLERS.keys())
    else:
        selected_crawlers = args.roasteries
    
    all_coffees = []
    
    for crawler_name in selected_crawlers:
        logger.info(f"\n{'='*50}")
        logger.info(f"Starting crawl for {crawler_name}")
        logger.info(f"{'='*50}")
        
        try:
            crawler_class = CRAWLERS[crawler_name]
            crawler = crawler_class()
            coffees = crawler.crawl()
            
            if coffees:
                all_coffees.extend(coffees)
                logger.info(f"Successfully crawled {len(coffees)} coffees from {crawler_name}")
            else:
                logger.warning(f"No coffees found for {crawler_name}")
                
        except Exception as e:
            logger.error(f"Failed to crawl {crawler_name}: {e}")
    
    if all_coffees:
        logger.info(f"\n{'='*50}")
        logger.info(f"Total coffees crawled: {len(all_coffees)}")
        logger.info(f"{'='*50}")
        
        saver = DataSaver()
        
        if args.save_mode in ['combined', 'both']:
            files = saver.save_combined(all_coffees)
            logger.info(f"Saved combined data: {files}")
        
        if args.save_mode in ['separate', 'both']:
            files = saver.save_by_roastery(all_coffees)
            logger.info(f"Saved separate files: {files}")
    else:
        logger.warning("No coffee data was collected")


if __name__ == "__main__":
    main()