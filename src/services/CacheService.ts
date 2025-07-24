import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './LoggingService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheService {
  private static instance: CacheService;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_PREFIX = '@cache_';
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached items
  
  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Store data in cache with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.DEFAULT_TTL,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      
      Logger.debug('Cache entry stored', 'cache', {
        data: { key, ttl: entry.ttl, size: JSON.stringify(value).length }
      });

      // Clean up old entries periodically
      await this.cleanupExpired();
    } catch (error) {
      Logger.error('Failed to store cache entry', 'cache', { 
        error: error as Error,
        data: { key }
      });
    }
  }

  /**
   * Retrieve data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);
      const storedValue = await AsyncStorage.getItem(cacheKey);
      
      if (!storedValue) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(storedValue);
      const now = Date.now();
      
      // Check if entry has expired
      if (now - entry.timestamp > entry.ttl) {
        await this.remove(key);
        Logger.debug('Cache entry expired', 'cache', {
          data: { key, age: now - entry.timestamp, ttl: entry.ttl }
        });
        return null;
      }

      Logger.debug('Cache hit', 'cache', {
        data: { key, age: now - entry.timestamp }
      });

      return entry.data;
    } catch (error) {
      Logger.error('Failed to retrieve cache entry', 'cache', { 
        error: error as Error,
        data: { key }
      });
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
      
      Logger.debug('Cache entry removed', 'cache', {
        data: { key }
      });
    } catch (error) {
      Logger.error('Failed to remove cache entry', 'cache', { 
        error: error as Error,
        data: { key }
      });
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidate(pattern: string | RegExp): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      const regex = typeof pattern === 'string' 
        ? new RegExp(pattern.replace(/\*/g, '.*'))
        : pattern;

      const keysToRemove = cacheKeys.filter(cacheKey => {
        const originalKey = cacheKey.replace(this.CACHE_PREFIX, '');
        return regex.test(originalKey);
      });

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        
        Logger.info('Cache entries invalidated', 'cache', {
          data: { pattern: pattern.toString(), count: keysToRemove.length }
        });
      }
    } catch (error) {
      Logger.error('Failed to invalidate cache entries', 'cache', { 
        error: error as Error,
        data: { pattern: pattern.toString() }
      });
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        
        Logger.info('All cache entries cleared', 'cache', {
          data: { count: cacheKeys.length }
        });
      }
    } catch (error) {
      Logger.error('Failed to clear cache', 'cache', { 
        error: error as Error
      });
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number; // in bytes
    expiredEntries: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      let expiredEntries = 0;
      const now = Date.now();

      for (const cacheKey of cacheKeys) {
        try {
          const storedValue = await AsyncStorage.getItem(cacheKey);
          if (storedValue) {
            totalSize += storedValue.length;
            
            const entry = JSON.parse(storedValue);
            if (now - entry.timestamp > entry.ttl) {
              expiredEntries++;
            }
          }
        } catch {
          // Skip corrupted entries
        }
      }

      return {
        totalEntries: cacheKeys.length,
        totalSize,
        expiredEntries,
      };
    } catch (error) {
      Logger.error('Failed to get cache stats', 'cache', { 
        error: error as Error
      });
      return {
        totalEntries: 0,
        totalSize: 0,
        expiredEntries: 0,
      };
    }
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpired(): Promise<void> {
    try {
      const stats = await this.getStats();
      
      // Only cleanup if we have expired entries or too many total entries
      if (stats.expiredEntries === 0 && stats.totalEntries < this.MAX_CACHE_SIZE) {
        return;
      }

      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (const cacheKey of cacheKeys) {
        try {
          const storedValue = await AsyncStorage.getItem(cacheKey);
          if (storedValue) {
            const entry = JSON.parse(storedValue);
            if (now - entry.timestamp > entry.ttl) {
              keysToRemove.push(cacheKey);
            }
          }
        } catch {
          // Remove corrupted entries
          keysToRemove.push(cacheKey);
        }
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        
        Logger.info('Expired cache entries cleaned up', 'cache', {
          data: { removed: keysToRemove.length }
        });
      }
    } catch (error) {
      Logger.error('Failed to cleanup expired cache entries', 'cache', { 
        error: error as Error
      });
    }
  }

  /**
   * Generate cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  /**
   * Get cache entry with fallback to async function
   */
  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Cache miss - fetch data
      Logger.debug('Cache miss, fetching data', 'cache', {
        data: { key }
      });

      const data = await fetchFn();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      Logger.error('Failed to get or set cache entry', 'cache', { 
        error: error as Error,
        data: { key }
      });
      
      // Fallback to fetching data without caching
      return await fetchFn();
    }
  }
}

export default CacheService;