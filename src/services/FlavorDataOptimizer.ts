import { performanceMonitor } from './PerformanceMonitor';
import { flavorWheelKorean } from '../data/flavorWheelKorean';

interface CachedFlavorData {
  data: any;
  timestamp: number;
  version: string;
}

interface FlavorSearchIndex {
  [key: string]: {
    category: string;
    subcategory?: string;
    flavor: string;
    level: number;
    path: string[];
  }[];
}

/**
 * Optimized flavor data service with caching and indexing
 */
class FlavorDataOptimizer {
  private static instance: FlavorDataOptimizer;
  private cache = new Map<string, CachedFlavorData>();
  private searchIndex: FlavorSearchIndex | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): FlavorDataOptimizer {
    if (!FlavorDataOptimizer.instance) {
      FlavorDataOptimizer.instance = new FlavorDataOptimizer();
    }
    return FlavorDataOptimizer.instance;
  }

  /**
   * Get transformed flavor data with caching
   */
  getTransformedFlavorData(): any {
    const cacheKey = 'transformed_flavor_data';
    const cached = this.cache.get(cacheKey);
    
    // Check cache validity
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    const timingId = performanceMonitor.startTiming('flavor_data_transform');
    
    try {
      // Transform the data (existing transformation logic)
      const transformedData = this.transformFlavorData();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now(),
        version: this.VERSION,
      });

      performanceMonitor.endTiming(timingId, 'flavor_data_transform_success', {
        categories: transformedData.length,
        cached: false,
      });

      return transformedData;
    } catch (error) {
      performanceMonitor.endTiming(timingId, 'flavor_data_transform_error');
      performanceMonitor.reportError(error as Error, 'flavor_data_transform', 'medium');
      throw error;
    }
  }

  /**
   * Build search index for fast flavor lookups
   */
  buildSearchIndex(): FlavorSearchIndex {
    if (this.searchIndex) {
      return this.searchIndex;
    }

    const timingId = performanceMonitor.startTiming('flavor_search_index');
    
    try {
      const index: FlavorSearchIndex = {};
      const flavorData = this.getTransformedFlavorData();

      // Build comprehensive search index
      flavorData.forEach((category: any) => {
        const categoryName = category.name;
        
        // Index category name
        this.addToIndex(index, categoryName, {
          category: categoryName,
          flavor: categoryName,
          level: 1,
          path: [categoryName],
        });

        // Index subcategories and flavors
        category.subcategories?.forEach((subcategory: any) => {
          const subcategoryName = subcategory.name;
          
          // Index subcategory name
          this.addToIndex(index, subcategoryName, {
            category: categoryName,
            subcategory: subcategoryName,
            flavor: subcategoryName,
            level: 2,
            path: [categoryName, subcategoryName],
          });

          // Index individual flavors
          subcategory.flavors?.forEach((flavor: any) => {
            const flavorName = flavor.name;
            
            this.addToIndex(index, flavorName, {
              category: categoryName,
              subcategory: subcategoryName,
              flavor: flavorName,
              level: 3,
              path: [categoryName, subcategoryName, flavorName],
            });

            // Index Korean translations if available
            const koreanName = this.getKoreanTranslation(flavorName);
            if (koreanName && koreanName !== flavorName) {
              this.addToIndex(index, koreanName, {
                category: categoryName,
                subcategory: subcategoryName,
                flavor: flavorName,
                level: 3,
                path: [categoryName, subcategoryName, flavorName],
              });
            }
          });
        });
      });

      this.searchIndex = index;
      
      performanceMonitor.endTiming(timingId, 'flavor_search_index_success', {
        indexSize: Object.keys(index).length,
      });

      return index;
    } catch (error) {
      performanceMonitor.endTiming(timingId, 'flavor_search_index_error');
      performanceMonitor.reportError(error as Error, 'flavor_search_index', 'medium');
      throw error;
    }
  }

  /**
   * Fast flavor search using pre-built index
   */
  searchFlavors(query: string, maxResults: number = 20): any[] {
    if (!query.trim()) return [];

    const timingId = performanceMonitor.startTiming('flavor_search');
    
    try {
      const index = this.buildSearchIndex();
      const normalizedQuery = query.toLowerCase();
      const results: any[] = [];
      const seen = new Set<string>();

      // Search through index
      Object.entries(index).forEach(([term, entries]) => {
        if (term.toLowerCase().includes(normalizedQuery) && results.length < maxResults) {
          entries.forEach(entry => {
            const key = entry.path.join('|');
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                ...entry,
                relevance: this.calculateRelevance(term, normalizedQuery),
              });
            }
          });
        }
      });

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      performanceMonitor.endTiming(timingId, 'flavor_search_success', {
        query: query.substring(0, 50), // Limit logged query length
        results: results.length,
      });

      return results.slice(0, maxResults);
    } catch (error) {
      performanceMonitor.endTiming(timingId, 'flavor_search_error');
      performanceMonitor.reportError(error as Error, 'flavor_search', 'low');
      return [];
    }
  }

  /**
   * Get flavor suggestions based on current selection
   */
  getFlavorSuggestions(selectedFlavors: string[], maxSuggestions: number = 5): any[] {
    const timingId = performanceMonitor.startTiming('flavor_suggestions');
    
    try {
      const suggestions: any[] = [];
      // Implementation would analyze selected flavors and suggest complementary ones
      // This is a placeholder for the actual suggestion algorithm
      
      performanceMonitor.endTiming(timingId, 'flavor_suggestions_success', {
        selectedCount: selectedFlavors.length,
        suggestionsCount: suggestions.length,
      });

      return suggestions;
    } catch (error) {
      performanceMonitor.endTiming(timingId, 'flavor_suggestions_error');
      performanceMonitor.reportError(error as Error, 'flavor_suggestions', 'low');
      return [];
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.searchIndex = null;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  // Private helper methods
  private isCacheValid(cached: CachedFlavorData): boolean {
    const age = Date.now() - cached.timestamp;
    return age < this.CACHE_DURATION && cached.version === this.VERSION;
  }

  private addToIndex(index: FlavorSearchIndex, term: string, entry: any): void {
    const normalizedTerm = term.toLowerCase();
    if (!index[normalizedTerm]) {
      index[normalizedTerm] = [];
    }
    index[normalizedTerm].push(entry);
  }

  private calculateRelevance(term: string, query: string): number {
    const termLower = term.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match gets highest score
    if (termLower === queryLower) return 100;
    
    // Starts with query gets high score
    if (termLower.startsWith(queryLower)) return 80;
    
    // Contains query gets medium score
    if (termLower.includes(queryLower)) return 60;
    
    // Default score
    return 40;
  }

  private getKoreanTranslation(englishName: string): string {
    return (flavorWheelKorean.translations as any)[englishName] || englishName;
  }

  private transformFlavorData(): any {
    // This would contain the existing transformation logic
    // Simplified for demo purposes
    return flavorWheelKorean.categories || [];
  }
}

export const flavorDataOptimizer = FlavorDataOptimizer.getInstance();