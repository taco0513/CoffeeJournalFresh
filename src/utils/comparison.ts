import { TastingService } from '../services/realm/TastingService';
import { RealmService } from '../services/realm/RealmService';
import { performanceMonitor } from '../services/PerformanceMonitor';
import { Logger } from '../services/LoggingService';
import { TastingComparisonData } from '../types';

// TODO: Move to constants/config when created
const ENABLE_SYNC = true;

/**
 * Loads comparison data for a coffee tasting
 * Shared utility function to avoid code duplication
 */
export async function loadCoffeeComparisonData(
  coffeeName: string | undefined,
  roastery: string | undefined
): Promise<TastingComparisonData | null> {
  if (!coffeeName || !roastery) {
    return null;
}

  const comparisonTimingId = performanceMonitor.startTiming('comparison_load');
  
  try {
    if (ENABLE_SYNC) {
      try {
        const tastingService = TastingService.getInstance();
        const supabaseComparison = await tastingService.getCoffeeComparison(
          coffeeName,
          roastery
        );
        
        if (supabaseComparison) {
          await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_complete', {
            coffee: coffeeName,
            roastery: roastery,
            syncEnabled: ENABLE_SYNC,
            source: 'supabase'
        });
          return supabaseComparison;
      } else {
          const realmService = RealmService.getInstance();
          const comparisonData = realmService.getSameCoffeeComparison(
            coffeeName,
            roastery
          );
          
          await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_complete', {
            coffee: coffeeName,
            roastery: roastery,
            syncEnabled: ENABLE_SYNC,
            source: 'realm_fallback'
        });
          return comparisonData;
      }
    } catch (error) {
        Logger.warn('Supabase comparison failed, falling back to Realm', 'utils', {
          component: 'loadCoffeeComparisonData',
          error: error
      });
        
        try {
          const realmService = RealmService.getInstance();
          const comparisonData = realmService.getSameCoffeeComparison(
            coffeeName,
            roastery
          );
          
          await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_complete', {
            coffee: coffeeName,
            roastery: roastery,
            syncEnabled: ENABLE_SYNC,
            source: 'realm_error_fallback'
        });
          return comparisonData;
      } catch (realmError) {
          Logger.error('Realm comparison also failed', 'utils', {
            component: 'loadCoffeeComparisonData',
            error: realmError
        });
          throw realmError;
      }
    }
  } else {
      const realmService = RealmService.getInstance();
      const comparisonData = realmService.getSameCoffeeComparison(
        coffeeName,
        roastery
      );
      
      await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_complete', {
        coffee: coffeeName,
        roastery: roastery,
        syncEnabled: ENABLE_SYNC,
        source: 'realm_only'
    });
      return comparisonData;
  }
} catch (error) {
    await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_error', {
      coffee: coffeeName,
      roastery: roastery,
      error: (error as Error).message
  });
    throw error;
}
}