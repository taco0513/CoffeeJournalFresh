import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TastingService } from '../services/realm/TastingService';
import PhotoService from '../services/PhotoService';
import { HIGConstants, HIGColors } from '../styles/common';
import { ITastingRecord } from '../services/realm/schemas';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - HIGConstants.SPACING_LG * 3) / 2;

interface PhotoItem {
  id: string;
  uri: string;
  thumbnailUri?: string;
  tastingId: string;
  coffeeName: string;
  roasteryName: string;
  createdAt: Date;
}

const PhotoGalleryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async (limit = 50, offset = 0) => {
    try {
      const tastingService = TastingService.getInstance();
      const tastings = await tastingService.getTastingRecords({ 
        isDeleted: false,
        limit,
        offset
      });
      
      // Filter tastings with photos and create photo items
      const photoItems: PhotoItem[] = [];
      const tastingsArray = Array.from(tastings) as ITastingRecord[];
      for (const tasting of tastingsArray) {
        if (tasting.photoUri) {
          photoItems.push({
            id: `${tasting.id}_photo`,
            uri: tasting.photoUri,
            thumbnailUri: tasting.photoThumbnailUri,
            tastingId: tasting.id,
            coffeeName: tasting.coffeeName || '알 수 없음',
            roasteryName: tasting.roastery || '알 수 없음',
            createdAt: tasting.createdAt,
          });
        }
      }

      // Sort by creation date (newest first)
      photoItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setPhotos(photoItems);
    } catch (error) {
      // console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPhotos();
  };

  const handlePhotoPress = (item: PhotoItem) => {
    // Navigate to full screen photo viewer
    // TODO: PhotoViewer screen needs to be implemented
    // navigation.navigate('PhotoViewer', { photoItem: item });
  };

  const handlePhotoLongPress = (item: PhotoItem) => {
    Alert.alert(
      '사진 옵션',
      `${item.coffeeName} 사진`,
      [
        { text: '취소', style: 'cancel' },
        { text: '테이스팅 보기', onPress: () => navigateToTasting(item.tastingId) },
        { text: '사진 삭제', style: 'destructive', onPress: () => deletePhoto(item) },
      ]
    );
  };

  const navigateToTasting = (tastingId: string) => {
    navigation.navigate('TastingDetail', { tastingId });
  };

  const deletePhoto = async (item: PhotoItem) => {
    Alert.alert(
      '사진 삭제',
      '이 사진을 삭제하시겠습니까? 테이스팅 기록에서도 제거됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const tastingService = TastingService.getInstance();
              const tasting = await tastingService.getTastingRecordById(item.tastingId);
              
              if (tasting && tasting.photoUri) {
                // Delete photo from local storage
                await PhotoService.deletePhotoLocally(tasting.photoUri);
                
                // Update tasting record
                await tastingService.updateTastingRecord(item.tastingId, {
                  photoUri: undefined,
                  photoThumbnailUri: undefined,
                });
                
                // Refresh photos
                loadPhotos();
              }
            } catch (error) {
              // console.error('Failed to delete photo:', error);
              Alert.alert('오류', '사진을 삭제하는 중 오류가 발생했습니다.');
            }
          }
        },
      ]
    );
  };

  const renderPhotoItem = ({ item }: { item: PhotoItem }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
      onLongPress={() => handlePhotoLongPress(item)}
    >
      <Image
        source={{ uri: PhotoService.getPhotoUri(item.thumbnailUri || item.uri) }}
        style={styles.photoImage}
        resizeMode="cover"
      />
      <View style={styles.photoInfo}>
        <Text style={styles.coffeeName} numberOfLines={1}>
          {item.coffeeName}
        </Text>
        <Text style={styles.roasteryName} numberOfLines={1}>
          {item.roasteryName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📸</Text>
      <Text style={styles.emptyText}>아직 사진이 없습니다</Text>
      <Text style={styles.emptySubtext}>
        테이스팅 기록에서 커피 사진을 추가해보세요
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>사진 갤러리</Text>
        <Text style={styles.headerSubtitle}>
          {photos.length}개의 사진
        </Text>
      </View>

      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.galleryContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  headerSubtitle: {
    fontSize: 17,
    color: HIGColors.secondaryLabel,
  },
  galleryContent: {
    padding: HIGConstants.SPACING_LG,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  photoItem: {
    width: ITEM_SIZE,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: ITEM_SIZE,
    backgroundColor: HIGColors.gray5,
  },
  photoInfo: {
    padding: HIGConstants.SPACING_SM,
  },
  coffeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasteryName: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  separator: {
    height: HIGConstants.SPACING_SM,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptySubtext: {
    fontSize: 15,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
  },
});

export default PhotoGalleryScreen;