import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { syncService } from '../services/supabase/sync';
import NetInfo from '@react-native-community/netinfo';
import { ENABLE_SYNC } from '../../App';

interface SyncStatusProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ onPress, style }) => {
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!ENABLE_SYNC) return;

    // Listen to sync status changes
    const interval = setInterval(() => {
      const status = syncService.getSyncStatus();
      setSyncStatus(status);
      setLastSyncTime(status.lastSyncTime);
  }, 1000);

    // Listen to network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setSyncStatus((prev: unknown) => ({ ...prev, isOnline: state.isConnected || false }));
  });

    return () => {
      clearInterval(interval);
      unsubscribe();
  };
}, []);

  if (!ENABLE_SYNC) {
    return null;
}

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return '🔄';
  }
    if (!syncStatus.isOnline) {
      return '📵';
  }
    if (syncStatus.error) {
      return '❌';
  }
    return '✅';
};

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
  }
    if (!syncStatus.isOnline) {
      return 'Offline';
  }
    if (syncStatus.error) {
      return 'Sync Error';
  }
    if (lastSyncTime) {
      const minutes = Math.floor((Date.now() - lastSyncTime.getTime()) / 60000);
      if (minutes < 1) return 'Just synced';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
  }
    return 'Not synced';
};

  const content = (
    <View style={[styles.container, style]}>
      {syncStatus.isSyncing ? (
        <ActivityIndicator size="small" color="#8B4513" />
      ) : (
        <Text style={styles.icon}>{getStatusIcon()}</Text>
      )}
      <Text style={styles.text}>{getStatusText()}</Text>
      {syncStatus.pendingUploads > 0 && (
        <Text style={styles.pending}>({syncStatus.pendingUploads})</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} disabled={syncStatus.isSyncing}>
        {content}
      </TouchableOpacity>
    );
}

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
},
  icon: {
    fontSize: 16,
    marginRight: 6,
},
  text: {
    fontSize: 12,
    color: '#666',
},
  pending: {
    fontSize: 11,
    color: '#8B4513',
    marginLeft: 4,
},
});

export default SyncStatus;