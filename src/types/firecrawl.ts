/**
 * Firecrawl API type definitions
 */

export interface FirecrawlScrapeOptions {
  formats?: ('markdown' | 'structured' | 'html' | 'text')[];
  extract?: {
    [key: string]: 'string' | 'array' | 'object' | 'number' | 'boolean';
};
  extract_products?: boolean;
  extract_pricing?: boolean;
  extract_flavor_descriptions?: boolean;
  extract_company_info?: boolean;
}

export interface FirecrawlAnalysisOptions {
  extract_products: boolean;
  extract_pricing: boolean;
  extract_flavor_descriptions: boolean;
  extract_company_info: boolean;
}

export interface FirecrawlCrawlOptions {
  depth?: number;
  limit?: number;
  include_patterns?: string[];
  exclude_patterns?: string[];
}

export interface FirecrawlScrapeResult {
  url: string;
  data: RoasterData | MarketAnalysisData | CoffeeProductData;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface RoasterData {
  roaster_name: string;
  location: string;
  specialty_coffees: string[];
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
};
  about_description: string;
}

export interface MarketAnalysisData {
  products: CoffeeProduct[];
  pricing: PriceRange[];
  flavors: string[];
  company: CompanyInfo;
}

export interface CoffeeProduct {
  name: string;
  origin: string;
  price: number;
  roast_level: string;
  tasting_notes: string[];
  processing_method?: string;
  availability: boolean;
}

export interface PriceRange {
  category: string;
  min: number;
  max: number;
  average: number;
}

export interface CompanyInfo {
  name: string;
  founded?: string;
  locations?: string[];
  specialties?: string[];
}

export interface CoffeeProductData {
  name: string;
  roaster: string;
  origin: string;
  price: number;
  tasting_notes: string[];
  roast_date?: string;
  processing?: string;
  variety?: string;
  altitude?: string;
  producer?: string;
}

export interface CrawlResult {
  pages_crawled: number;
  products_found: CoffeeProductData[];
  timestamp: Date;
}

export interface MarketIntelligenceData {
  roasters: RoasterData[];
  trendingFlavors: string[];
  priceRanges: PriceRange[];
  newProducts: CoffeeProduct[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevance_score: number;
}