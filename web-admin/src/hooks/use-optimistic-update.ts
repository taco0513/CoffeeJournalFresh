import { useState, useCallback } from 'react';

export interface OptimisticUpdateConfig<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

export function useOptimisticUpdate<T = any>() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async <R = T>(
    optimisticUpdate: () => void,
    actualUpdate: () => Promise<R>,
    revertUpdate: () => void,
    config?: OptimisticUpdateConfig<R>
  ): Promise<R | undefined> => {
    setIsLoading(true);
    
    // Apply optimistic update immediately
    optimisticUpdate();
    
    try {
      // Perform actual update
      const result = await actualUpdate();
      config?.onSuccess?.(result);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      revertUpdate();
      config?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
      config?.onFinally?.();
    }
  }, []);

  return { execute, isLoading };
}

// Helper hook for bulk operations
export function useBulkOptimisticUpdate<T extends { id: string }>() {
  const [isLoading, setIsLoading] = useState(false);

  const executeBulk = useCallback(async <R = T[]>(
    items: T[],
    selectedIds: Set<string>,
    updateFunction: (item: T) => T,
    apiCall: () => Promise<R>,
    config?: OptimisticUpdateConfig<R>
  ): Promise<R | undefined> => {
    setIsLoading(true);
    
    // Store original items for potential revert
    const originalItems = [...items];
    
    // Apply optimistic updates
    const optimisticItems = items.map(item => 
      selectedIds.has(item.id) ? updateFunction(item) : item
    );
    
    try {
      // Perform actual API call
      const result = await apiCall();
      config?.onSuccess?.(result);
      return result;
    } catch (error) {
      // Revert to original state on error
      config?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
      config?.onFinally?.();
    }
  }, []);

  return { executeBulk, isLoading };
}