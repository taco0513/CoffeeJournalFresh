import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDevStore } from '../stores/useDevStore';
import { useUserStore } from '../stores/useUserStore';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import RealmService from '../services/realm/RealmService';
import { HIGColors } from '../styles/common';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DebugOverlay: React.FC = () => {
  const { showDebugInfo } = useDevStore();
  const { currentUser } = useUserStore();
  const { isBetaUser } = useFeedbackStore();
  
  const [realmRecordCount, setRealmRecordCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Get Realm record count
    try {
      const realmService = RealmService.getInstance();
      if (realmService.isInitialized) {
        const records = realmService.getTastingRecords({ isDeleted: false });
        setRealmRecordCount(records.length);
      }
    } catch (error) {
      console.error('Failed to get realm records:', error);
    }
    
    setRenderTime(Date.now() - startTime);
  }, []);

  if (!showDebugInfo) return null;

  const debugInfo = {
    '사용자': currentUser?.username || 'Guest',
    '이메일': currentUser?.email || 'N/A',
    'Beta 유저': isBetaUser ? 'Yes' : 'No',
    'Realm 레코드': realmRecordCount,
    '화면 크기': `${SCREEN_WIDTH}x${SCREEN_HEIGHT}`,
    '렌더 시간': `${renderTime}ms`,
    'React Native': '0.80',
    'Platform': 'iOS',
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.debugPanel, isExpanded && styles.expandedPanel]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>🐛 Debug Info</Text>
          <Text style={styles.toggleIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </View>
        
        {isExpanded && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {Object.entries(debugInfo).map(([key, value]) => (
              <View key={key} style={styles.infoRow}>
                <Text style={styles.infoKey}>{key}:</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    zIndex: 9999,
  },
  debugPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 10,
    minWidth: 150,
    maxWidth: 250,
  },
  expandedPanel: {
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 10,
  },
  content: {
    marginTop: 10,
    maxHeight: 250,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoKey: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
});