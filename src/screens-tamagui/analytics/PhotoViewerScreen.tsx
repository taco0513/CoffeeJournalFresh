import React, { useState } from 'react';
import { SafeAreaView, Image, Dimensions, Alert, Share, StatusBar } from 'react-native';
import {
  View,
  Text,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PhotoService from '../../services/PhotoService';
import { TastingService } from '../../services/realm/TastingService';

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

// Styled Components
const Container = styled(View, {
  name: 'PhotoViewerContainer',
  flex: 1,
  backgroundColor: 'black',
});

const HeaderOverlay = styled(XStack, {
  name: 'HeaderOverlay',
  alignItems: 'center',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  animation: 'quick',
  variants: {
    visible: {
      true: {
        opacity: 1,
        y: 0,
      },
      false: {
        opacity: 0,
        y: -50,
      },
    },
  } as const,
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: '$sm',
  marginRight: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const BackButtonText = styled(Text, {
  name: 'BackButtonText',
  color: 'white',
  fontSize: 24,
  fontWeight: '300',
});

const HeaderInfo = styled(YStack, {
  name: 'HeaderInfo',
  flex: 1,
});

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  color: 'white',
  fontSize: '$5',
  fontWeight: '600',
  marginBottom: '$xs',
});

const HeaderSubtitle = styled(Text, {
  name: 'HeaderSubtitle',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '$3',
});

const ShareButton = styled(Button, {
  name: 'ShareButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: '$sm',
  marginLeft: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const ShareButtonText = styled(Text, {
  name: 'ShareButtonText',
  color: 'white',
  fontSize: 18,
  fontWeight: '500',
});

const PhotoContainer = styled(View, {
  name: 'PhotoContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const PhotoImage = styled(Image, {
  name: 'PhotoImage',
  width: width,
  height: height,
});

const BottomOverlay = styled(YStack, {
  name: 'BottomOverlay',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  zIndex: 1,
  animation: 'quick',
  variants: {
    visible: {
      true: {
        opacity: 1,
        y: 0,
      },
      false: {
        opacity: 0,
        y: 50,
      },
    },
  } as const,
});

const PhotoDetails = styled(YStack, {
  name: 'PhotoDetails',
  marginBottom: '$lg',
});

const DetailDate = styled(Text, {
  name: 'DetailDate',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '$3',
  marginBottom: '$xs',
});

const DetailInfo = styled(Text, {
  name: 'DetailInfo',
  color: 'white',
  fontSize: '$5',
  fontWeight: '600',
});

const ActionButtons = styled(XStack, {
  name: 'ActionButtons',
  gap: '$md',
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '$3',
  paddingVertical: '$md',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  animation: 'quick',
  variants: {
    type: {
      primary: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      destructive: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        borderColor: 'rgba(255, 59, 48, 0.5)',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
    opacity: 0.8,
  },
});

const ActionButtonText = styled(Text, {
  name: 'ActionButtonText',
  fontSize: '$4',
  fontWeight: '500',
  textAlign: 'center',
  variants: {
    type: {
      primary: {
        color: 'white',
      },
      destructive: {
        color: '#FF3B30',
      },
    },
  } as const,
});

const TouchablePhotoContainer = styled(View, {
  name: 'TouchablePhotoContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  pressStyle: {
    opacity: 0.9,
  },
});

export type PhotoViewerScreenProps = GetProps<typeof Container>;

const PhotoViewerScreen: React.FC<PhotoViewerScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
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
      // console.error('Share error:', error);
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
              const tastingService = TastingService.getInstance();
              const tasting = await tastingService.getTastingRecordById(photoItem.tastingId);
              
              if (tasting && tasting.photoUri) {
                // Delete photo from local storage
                await PhotoService.deletePhotoLocally(tasting.photoUri);
                
                // Update tasting record
                await tastingService.updateTastingRecord(photoItem.tastingId, {
                  photoUri: undefined,
                  photoThumbnailUri: undefined,
                });
                
                // Go back to gallery
                navigation.goBack();
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

  const handleTastingPress = () => {
    navigation.navigate('TastingDetail', { tastingId: photoItem.tastingId });
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
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        
        <AnimatePresence>
          {/* Header Overlay */}
          {showControls && (
            <HeaderOverlay
              visible={showControls}
              animation="quick"
              animateOnly={['opacity', 'transform']}
            >
              <BackButton unstyled onPress={handleBackPress}>
                <BackButtonText>‹</BackButtonText>
              </BackButton>
              
              <HeaderInfo>
                <HeaderTitle numberOfLines={1}>
                  {photoItem.coffeeName}
                </HeaderTitle>
                <HeaderSubtitle numberOfLines={1}>
                  {photoItem.roasteryName}
                </HeaderSubtitle>
              </HeaderInfo>
              
              <ShareButton unstyled onPress={handleSharePress}>
                <ShareButtonText>↗</ShareButtonText>
              </ShareButton>
            </HeaderOverlay>
          )}
        </AnimatePresence>

        {/* Photo Container */}
        <TouchablePhotoContainer
          onPress={toggleControls}
        >
          <PhotoImage
            source={{ uri: PhotoService.getPhotoUri(photoItem.uri) }}
            resizeMode="contain"
          />
        </TouchablePhotoContainer>

        <AnimatePresence>
          {/* Bottom Controls */}
          {showControls && (
            <BottomOverlay
              visible={showControls}
              animation="quick"
              animateOnly={['opacity', 'transform']}
            >
              <PhotoDetails>
                <DetailDate>
                  {formatDate(photoItem.createdAt)}
                </DetailDate>
                <DetailInfo>
                  {photoItem.coffeeName} • {photoItem.roasteryName}
                </DetailInfo>
              </PhotoDetails>
              
              <ActionButtons>
                <ActionButton
                  type="primary"
                  onPress={handleTastingPress}
                  unstyled
                >
                  <ActionButtonText type="primary">
                    테이스팅 보기
                  </ActionButtonText>
                </ActionButton>
                
                <ActionButton
                  type="destructive"
                  onPress={handleDeletePress}
                  unstyled
                >
                  <ActionButtonText type="destructive">
                    삭제
                  </ActionButtonText>
                </ActionButton>
              </ActionButtons>
            </BottomOverlay>
          )}
        </AnimatePresence>
      </SafeAreaView>
    </Container>
  );
};

export default PhotoViewerScreen;