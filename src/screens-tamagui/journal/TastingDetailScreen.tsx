// TastingDetailScreen.tsx
// Main tasting detail screen component - now modularized for better build performance

import React, { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView, YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { ITastingRecord } from '../../services/realm/schemas';
import RealmService from '../../services/realm/RealmService';
import { useToastStore } from '../../stores/toastStore';
import { useUserStore } from '../../stores/useUserStore';

// Modular Components
import {
  Container,
} from '../../components/journal/detail';
import { TastingDetailNavigation } from '../../components/journal/detail/TastingDetailNavigation';
import { TastingDetailLoadingState, TastingDetailErrorState } from '../../components/journal/detail/TastingDetailStates';
import { Logger } from '../../services/LoggingService';
import { TastingDetailContent } from '../../components/journal/detail/TastingDetailContent';

// Navigation types
type TastingDetailScreenRouteProp = RouteProp<RootStackParamList, 'TastingDetail'>;
type TastingDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TastingDetail'>;

interface TastingDetailScreenProps {
  hideNavBar?: boolean;
}

export const TastingDetailScreen: React.FC<TastingDetailScreenProps> = ({ hideNavBar = false }) => {
  const navigation = useNavigation<TastingDetailScreenNavigationProp>();
  const route = useRoute<TastingDetailScreenRouteProp>();
  const { showSuccessToast, showErrorToast } = useToastStore();
  const { currentUser } = useUserStore();

  const [tastingRecord, setTastingRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const realmService = RealmService.getInstance();
  const isMountedRef = useRef(true);
  const tastingId = route.params?.tastingId;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
  };
}, []);

  const loadTastingData = async () => {
    if (!tastingId) {
      setError('테이스팅 ID가 제공되지 않았습니다.');
      setLoading(false);
      return;
  }

    try {
      setLoading(true);
      setError(null);
      
      const record = await realmService.getTastingRecord(tastingId);
      
      if (!isMountedRef.current) return;
      
      if (!record || record.isDeleted) {
        setError('테이스팅 기록을 찾을 수 없습니다.');
        return;
    }

      setTastingRecord(record);
  } catch (err) {
      if (!isMountedRef.current) return;
      
      Logger.error('Failed to load tasting record:', 'screen', { component: 'TastingDetailScreen', error: err });
      setError('테이스팅 기록을 불러오는 중 오류가 발생했습니다.');
  } finally {
      if (isMountedRef.current) {
        setLoading(false);
    }
  }
};

  const handleDelete = async () => {
    if (!tastingRecord || isDeleting) return;

    Alert.alert(
      '테이스팅 기록 삭제',
      '이 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await realmService.deleteTastingRecord(tastingRecord.id);
              
              showSuccessToast('테이스팅 기록이 삭제되었습니다.');
              navigation.goBack();
          } catch (err) {
              Logger.error('Failed to delete tasting record:', 'screen', { component: 'TastingDetailScreen', error: err });
              showErrorToast('삭제 중 오류가 발생했습니다.');
          } finally {
              setIsDeleting(false);
          }
        }
      }
      ]
    );
};

  useEffect(() => {
    loadTastingData();
}, [tastingId]);

  // Loading state
  if (loading) {
    return (
      <Container>
        <TastingDetailNavigation 
          hideNavBar={hideNavBar}
          title="테이스팅 상세"
        />
        <TastingDetailLoadingState />
      </Container>
    );
}

  // Error state
  if (error) {
    return (
      <Container>
        <TastingDetailNavigation 
          hideNavBar={hideNavBar}
          title="테이스팅 상세"
        />
        <TastingDetailErrorState 
          error={error}
          onRetry={loadTastingData}
        />
      </Container>
    );
}

  // Not found state
  if (!tastingRecord) {
    return (
      <Container>
        <TastingDetailNavigation 
          hideNavBar={hideNavBar}
          title="테이스팅 상세"
        />
        <TastingDetailErrorState 
          error="테이스팅 기록을 찾을 수 없습니다."
          onRetry={loadTastingData}
        />
      </Container>
    );
}

  // Main content
  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <TastingDetailNavigation 
          hideNavBar={hideNavBar}
          title="테이스팅 상세"
          showDeleteButton={currentUser?.id === tastingRecord.userId}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <TastingDetailContent tastingRecord={tastingRecord} />
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default TastingDetailScreen;