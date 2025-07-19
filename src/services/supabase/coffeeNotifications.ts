import { supabase } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CoffeeApprovalNotification {
  coffee_id: string;
  coffee_name: string;
  roastery: string;
  approved_at: string;
}

class CoffeeNotificationService {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private onApprovalCallback: ((notification: CoffeeApprovalNotification) => void) | null = null;

  /**
   * Start listening for coffee approval notifications
   */
  async startListening(
    userId: string,
    onApproval: (notification: CoffeeApprovalNotification) => void
  ) {
    this.userId = userId;
    this.onApprovalCallback = onApproval;

    // Subscribe to changes in coffee_catalog table
    this.channel = supabase
      .channel('coffee-approvals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coffee_catalog',
          filter: `first_added_by=eq.${userId}`,
        },
        (payload) => {
          // Check if the coffee was just approved
          if (
            payload.new.verified_by_moderator === true &&
            payload.old.verified_by_moderator === false
          ) {
            const notification: CoffeeApprovalNotification = {
              coffee_id: payload.new.id,
              coffee_name: payload.new.coffee_name,
              roastery: payload.new.roastery,
              approved_at: new Date().toISOString(),
            };
            
            if (this.onApprovalCallback) {
              this.onApprovalCallback(notification);
            }
          }
        }
      )
      .subscribe();
  }

  /**
   * Stop listening for notifications
   */
  stopListening() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.onApprovalCallback = null;
  }

  /**
   * Get user's pending coffee submissions
   */
  async getPendingCoffees(userId: string) {
    try {
      const { data, error } = await supabase
        .from('coffee_catalog')
        .select('*')
        .eq('first_added_by', userId)
        .eq('verified_by_moderator', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending coffees:', error);
      return [];
    }
  }

  /**
   * Get user's approved coffee submissions
   */
  async getApprovedCoffees(userId: string) {
    try {
      const { data, error } = await supabase
        .from('coffee_catalog')
        .select('*')
        .eq('first_added_by', userId)
        .eq('verified_by_moderator', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching approved coffees:', error);
      return [];
    }
  }

  /**
   * Get coffee discovery statistics for a user
   */
  async getCoffeeDiscoveryStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('coffee_catalog')
        .select('verified_by_moderator')
        .eq('first_added_by', userId);

      if (error) throw error;

      const total = data?.length || 0;
      const approved = data?.filter(c => c.verified_by_moderator).length || 0;
      const pending = total - approved;

      return {
        total,
        approved,
        pending,
        level: this.calculateDiscoveryLevel(approved),
      };
    } catch (error) {
      console.error('Error fetching discovery stats:', error);
      return { total: 0, approved: 0, pending: 0, level: 1 };
    }
  }

  /**
   * Calculate discovery level based on approved coffees
   */
  private calculateDiscoveryLevel(approvedCount: number): number {
    if (approvedCount >= 10) return 3;
    if (approvedCount >= 5) return 2;
    if (approvedCount >= 1) return 1;
    return 0;
  }
}

export const coffeeNotificationService = new CoffeeNotificationService();