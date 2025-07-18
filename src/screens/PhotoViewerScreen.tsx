import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Share,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PhotoService from '../services/PhotoService';
import RealmService from '../services/realm/RealmService';
import { HIGConstants, HIGColors } from '../styles/common';

const { width, height } = Dimensions.get('window');

interface PhotoItem {
  id: string;
  uri: string;
  thumbnailUri?: string;
  tastingId: string;
  coffeeName: string;
  roasteryName: string;
  createdAt: Date;
}

interface RouteParams {
  photoItem: PhotoItem;
}

const PhotoViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { photoItem } = route.params as RouteParams;
  const [showControls, setShowControls] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSharePress = async () => {
    try {
      const photoUri = PhotoService.getPhotoUri(photoItem.uri);
      await Share.share({
        title: `${photoItem.coffeeName} - ${photoItem.roasteryName}`,
        message: `${photoItem.coffeeName} (${photoItem.roasteryName}) 테이스팅 사진`,
        url: photoUri,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('오류', '사진을 공유하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePress = () => {
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
              const realmService = RealmService.getInstance();
              const tasting = realmService.getTastingRecord(photoItem.tastingId);
              
              if (tasting && tasting.photoUri) {
                // Delete photo from local storage
                await PhotoService.deletePhotoLocally(tasting.photoUri);
                
                // Update tasting record
                realmService.updateTastingRecord(photoItem.tastingId, {
                  photoUri: undefined,
                  photoThumbnailUri: undefined,
                });
                
                // Go back to gallery
                navigation.goBack();
              }
            } catch (error) {
              console.error('Failed to delete photo:', error);
              Alert.alert('오류', '사진을 삭제하는 중 오류가 발생했습니다.');
            }
          }
        },
      ]
    );
  };

  const handleTastingPress = () => {
    navigation.navigate('TastingDetail' as never, { tastingId: photoItem.tastingId } as never);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      
      {/* Header */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {photoItem.coffeeName}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {photoItem.roasteryName}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleSharePress}
          >
            <Text style={styles.shareButtonText}>↗</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Photo */}
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <Image
          source={{ uri: PhotoService.getPhotoUri(photoItem.uri) }}
          style={styles.photo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomControls}>
          <View style={styles.photoDetails}>
            <Text style={styles.detailDate}>
              {formatDate(photoItem.createdAt)}
            </Text>
            <Text style={styles.detailInfo}>
              {photoItem.coffeeName} • {photoItem.roasteryName}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTastingPress}
            >
              <Text style={styles.actionButtonText}>테이스팅 보기</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeletePress}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                삭제
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: HIGConstants.SPACING_SM,
    marginRight: HIGConstants.SPACING_SM,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  shareButton: {
    padding: HIGConstants.SPACING_SM,
    marginLeft: HIGConstants.SPACING_SM,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: width,
    height: height,
  },
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
    zIndex: 1,
  },
  photoDetails: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  detailDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginBottom: HIGConstants.SPACING_XS,
  },
  detailInfo: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});

export default PhotoViewerScreen;