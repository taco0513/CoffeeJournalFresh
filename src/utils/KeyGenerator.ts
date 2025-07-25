import React from 'react';

/**
 * KeyGenerator Utility - Systematic solution for React key generation
 * 
 * This utility provides consistent, unique key generation for React components
 * to prevent duplicate key errors and improve rendering performance.
 */

export class KeyGenerator {
  private static keyUsageMap = new Map<string, Set<string>>();

  /**
   * Generate a key for a single item
   * @param item - The item to generate a key for
   * @param prefix - Optional prefix for the key
   * @returns A unique key string
   */
  static forItem(item: any, prefix?: string): string {
    if (!item) {
      return `empty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Try to use item.id first (most reliable)
    if (item.id) {
      return prefix ? `${prefix}-${item.id}` : item.id;
    }

    // Fallback to other unique identifiers
    if (item.uuid) {
      return prefix ? `${prefix}-${item.uuid}` : item.uuid;
    }

    if (item._id) {
      return prefix ? `${prefix}-${item._id}` : item._id;
    }

    // Generate a temporary key based on item content
    const contentHash = this.generateContentHash(item);
    const fallbackKey = `temp-${contentHash}-${Date.now()}`;
    
    return prefix ? `${prefix}-${fallbackKey}` : fallbackKey;
  }

  /**
   * Generate keys for a list of items with uniqueness validation
   * @param items - Array of items to generate keys for
   * @param prefix - Optional prefix for all keys
   * @returns Array of unique key strings
   */
  static forList(items: any[], prefix?: string): string[] {
    const seen = new Set<string>();
    const keys: string[] = [];

    items.forEach((item, index) => {
      let key = this.forItem(item, prefix);
      let counter = 0;
      const baseKey = key;
      
      // Handle duplicates by appending counter (prevents infinite loop)
      while (seen.has(key)) {
        counter++;
        key = `${baseKey}-dup-${counter}`;
        
        // Safety valve to prevent infinite loops
        if (counter > 1000) {
          key = `fallback-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          break;
        }
      }
      
      seen.add(key);
      keys.push(key);
    });

    return keys;
  }

  /**
   * Generate a key with guaranteed uniqueness using a counter
   * @param baseKey - Base key string
   * @param context - Context identifier (e.g., component name)
   * @returns Unique key string
   */
  static withUniqueCounter(baseKey: string, context: string = 'default'): string {
    if (!this.keyUsageMap.has(context)) {
      this.keyUsageMap.set(context, new Set());
    }

    const contextKeys = this.keyUsageMap.get(context)!;
    let uniqueKey = baseKey;
    let counter = 0;

    while (contextKeys.has(uniqueKey)) {
      counter++;
      uniqueKey = `${baseKey}-${counter}`;
      
      // Safety valve to prevent infinite loops
      if (counter > 1000) {
        uniqueKey = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        break;
      }
    }

    contextKeys.add(uniqueKey);
    return uniqueKey;
  }

  /**
   * Generate a content-based hash for an item
   * @param item - Item to hash
   * @returns Hash string
   */
  private static generateContentHash(item: any): string {
    try {
      // Create a stable string representation of the item
      const stableProps = ['name', 'title', 'value', 'text', 'label', 'coffeeName', 'roastery'];
      const relevantData = stableProps
        .map(prop => item[prop])
        .filter(val => val !== undefined && val !== null)
        .join('|');

      if (relevantData) {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < relevantData.length; i++) {
          const char = relevantData.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
      }

      // Fallback to random
      return Math.random().toString(36).substr(2, 9);
    } catch (error) {
      return Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Clear key usage tracking for a specific context
   * @param context - Context to clear
   */
  static clearContext(context: string): void {
    this.keyUsageMap.delete(context);
  }

  /**
   * Validate that a list of keys are unique (development helper)
   * @param keys - Array of keys to validate
   * @param context - Context for logging
   */
  static validateUniqueness(keys: string[], context: string = 'unknown'): boolean {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    
    if (duplicates.length > 0 && __DEV__) {
      console.warn(`[KeyGenerator] Duplicate keys detected in ${context}:`, duplicates);
      return false;
    }
    
    return true;
  }

  /**
   * Safe key generator for React components with automatic fallback
   * @param item - Item to generate key for
   * @param index - Array index as fallback
   * @param prefix - Optional prefix
   * @returns Safe key string
   */
  static safe(item: any, index: number, prefix?: string): string {
    try {
      const key = this.forItem(item, prefix);
      return key;
    } catch (error) {
      console.warn('[KeyGenerator] Error generating key, using fallback:', error);
      return `fallback-${index}-${Date.now()}`;
    }
  }

  /**
   * Simple unique key generator (commonly used method)
   * @param prefix - Optional prefix for the key
   * @returns Unique key string
   */
  static generate(prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const uniqueKey = `${timestamp}-${random}`;
    
    return prefix ? `${prefix}-${uniqueKey}` : uniqueKey;
  }
}

/**
 * Hook for generating unique keys in React components
 * @param items - Array of items
 * @param prefix - Optional prefix
 * @returns Array of unique keys
 */
export const useUniqueKeys = (items: any[], prefix?: string): string[] => {
  return React.useMemo(() => {
    const keys = KeyGenerator.forList(items, prefix);
    
    if (__DEV__) {
      KeyGenerator.validateUniqueness(keys, `useUniqueKeys-${prefix || 'default'}`);
    }
    
    return keys;
  }, [items, prefix]);
};

// Development-only key validation
export const validateKeys = (keys: string[], componentName: string): void => {
  if (__DEV__) {
    KeyGenerator.validateUniqueness(keys, componentName);
  }
};