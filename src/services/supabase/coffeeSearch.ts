import { supabase } from '@/services/supabase/client';

export interface RoasterSearchResult {
  id: string;
  name: string;
  location?: string;
  website?: string;
}

export interface CoffeeSearchResult {
  id: string;
  roastery: string;
  coffee_name: string;
  origin?: string;
  region?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  harvest_year?: number;
  avg_rating?: number;
  total_reviews?: number;
}

/**
 * Search for roasters by name
 * Searches both user's personal roaster_info and community coffee_catalog
 */
export async function searchRoasters(query: string): Promise<RoasterSearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    // Search user's personal roasters first
    // Note: roaster_info table might not exist yet, so we'll handle the error
    let userRoasters = [];
    try {
      const { data, error } = await supabase
        .from('roaster_info')
        .select('id, name, location, website')
        .ilike('name', `%${query}%`)
        .eq('is_deleted', false)
        .order('visit_count', { ascending: false })
        .limit(5);
      
      if (!error) {
        userRoasters = data || [];
      }
    } catch (e) {
      // Table might not exist, continue without user roasters
      console.log('roaster_info table not available');
    }

    // Search community coffee catalog for unique roasters
    const { data: catalogRoasters, error: catalogError } = await supabase
      .from('coffee_catalog')
      .select('roastery')
      .ilike('roastery', `%${query}%`)
      .limit(10);

    if (catalogError) throw catalogError;

    // Combine results, removing duplicates
    const roasterMap = new Map<string, RoasterSearchResult>();
    
    // Add user's personal roasters first (higher priority)
    userRoasters?.forEach(roaster => {
      roasterMap.set(roaster.name.toLowerCase(), roaster);
    });

    // Add catalog roasters if not already present
    catalogRoasters?.forEach(item => {
      const key = item.roastery.toLowerCase();
      if (!roasterMap.has(key)) {
        roasterMap.set(key, {
          id: `catalog-${item.roastery}`,
          name: item.roastery,
        });
      }
    });

    return Array.from(roasterMap.values()).slice(0, 10);
  } catch (error) {
    console.error('Error searching roasters:', error);
    return [];
  }
}

/**
 * Search for coffees by roaster and/or coffee name
 */
export async function searchCoffees(
  roasterName: string,
  coffeeQuery?: string
): Promise<CoffeeSearchResult[]> {
  if (!roasterName) return [];

  try {
    let query = supabase
      .from('coffee_catalog')
      .select('*')
      .ilike('roastery', `%${roasterName}%`);

    if (coffeeQuery && coffeeQuery.length >= 2) {
      query = query.ilike('coffee_name', `%${coffeeQuery}%`);
    }

    const { data, error } = await query
      .order('avg_rating', { ascending: false, nullsFirst: false })
      .order('total_reviews', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching coffees:', error);
    return [];
  }
}

/**
 * Get coffee details by ID
 */
export async function getCoffeeDetails(coffeeId: string): Promise<CoffeeSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('coffee_catalog')
      .select('*')
      .eq('id', coffeeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting coffee details:', error);
    return null;
  }
}

/**
 * Add a new coffee to the catalog (for community contribution)
 */
export async function addCoffeeToCatalog(coffee: Omit<CoffeeSearchResult, 'id' | 'avg_rating' | 'total_reviews'>) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Add coffee with user info and pending verification status
    const { data: newCoffee, error } = await supabase
      .from('coffee_catalog')
      .insert([{
        ...coffee,
        first_added_by: user.id,
        verified_by_moderator: false, // Needs admin review
      }])
      .select()
      .single();

    if (error) throw error;

    // Create a notification for admin review (if notifications table exists)
    try {
      await supabase
        .from('admin_notifications')
        .insert([{
          type: 'new_coffee_review',
          title: 'New Coffee Added',
          message: `${user.email} added a new coffee: ${coffee.roastery} - ${coffee.coffee_name}`,
          data: { coffee_id: newCoffee.id },
          created_by: user.id,
        }]);
    } catch (notifError) {
      // Notification table might not exist yet, continue anyway
      console.log('Admin notification skipped:', notifError);
    }

    return newCoffee;
  } catch (error) {
    console.error('Error adding coffee to catalog:', error);
    throw error;
  }
}