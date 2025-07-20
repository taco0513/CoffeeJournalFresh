import { useEffect, useState } from 'react';
import { coffeeNotificationService, CoffeeApprovalNotification } from '@/services/supabase/coffeeNotifications';
import { useUserStore } from '@/stores/useUserStore';

export const useCoffeeNotifications = () => {
  const [showApprovalAlert, setShowApprovalAlert] = useState(false);
  const [approvalData, setApprovalData] = useState<CoffeeApprovalNotification | null>(null);
  const [discoveryStats, setDiscoveryStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    level: 0,
  });
  
  const { currentUser: user } = useUserStore();

  useEffect(() => {
    if (!user?.id) return;

    // Start listening for approval notifications
    coffeeNotificationService.startListening(user.id, (notification) => {
      setApprovalData(notification);
      setShowApprovalAlert(true);
      
      // Update discovery stats
      loadDiscoveryStats();
    });

    // Load initial stats
    loadDiscoveryStats();

    return () => {
      coffeeNotificationService.stopListening();
    };
  }, [user?.id]);

  const loadDiscoveryStats = async () => {
    if (!user?.id) return;
    
    const stats = await coffeeNotificationService.getCoffeeDiscoveryStats(user.id);
    setDiscoveryStats(stats);
  };

  const dismissApprovalAlert = () => {
    setShowApprovalAlert(false);
    setApprovalData(null);
  };

  return {
    showApprovalAlert,
    approvalData,
    discoveryStats,
    dismissApprovalAlert,
    refreshStats: loadDiscoveryStats,
  };
};