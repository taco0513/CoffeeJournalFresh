import React, { useEffect, useState } from 'react';
import { SafeAreaView, Image, Dimensions, Alert, RefreshControl } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  Spinner,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TastingService } from '../../services/realm/TastingService';
import PhotoService from '../../services/PhotoService';
import { ITastingRecord } from '../../services/realm/schemas';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2; // 48 = 16px padding * 3

interface PhotoItem {
  id: string;
  uri: string;
  thumbnailUri?: string;
  tastingId: string;
  coffeeName: string;
  roasteryName: string;
  createdAt: Date;
}

// Styled Components
const Container = styled(View, {
  name: 'PhotoGalleryContainer',
  flex: 1,
  backgroundColor: '$background',
});

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  padding: '$lg',
  paddingTop: '$sm',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const HeaderTitle = styled(H1, {
  name: 'HeaderTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$xs',
});

const HeaderSubtitle = styled(Text, {
  name: 'HeaderSubtitle',
  fontSize: '$5',
  color: '$gray11',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$md',
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$gray11',
});

const GalleryContainer = styled(ScrollView, {
  name: 'GalleryContainer',
  flex: 1,
  padding: '$lg',
});

const PhotoGrid = styled(XStack, {
  name: 'PhotoGrid',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '$sm',
});

const PhotoItem = styled(Card, {
  name: 'PhotoItem',
  width: ITEM_SIZE,
  backgroundColor: '$backgroundStrong',
  borderRadius: '$3',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  overflow: 'hidden',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  pressStyle: {
    scale: 0.98,
  },
});

const PhotoImage = styled(Image, {
  name: 'PhotoImage',
  width: '100%',
  height: ITEM_SIZE,
  backgroundColor: '$gray4',
});

const PhotoInfo = styled(YStack, {
  name: 'PhotoInfo',
  padding: '$sm',
});

const CoffeeName = styled(Text, {
  name: 'CoffeeName',
  fontSize: '$3',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
});

const RoasteryName = styled(Text, {
  name: 'RoasteryName',
  fontSize: '$2',
  color: '$gray11',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '$lg',
  gap: '$md',
});

const EmptyIcon = styled(Text, {
  name: 'EmptyIcon',
  fontSize: 48,
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: '$5',
  fontWeight: '600',
  color: '$gray11',
  textAlign: 'center',
});

const EmptySubtext = styled(Text, {
  name: 'EmptySubtext',
  fontSize: '$4',
  color: '$gray10',
  textAlign: 'center',
});

const PhotoModalContainer = styled(Card, {
  name: 'PhotoModalContainer',
  position: 'absolute',
  top: '10%',
  left: '$lg',
  right: '$lg',
  backgroundColor: '$background',
  borderRadius: '$4',
  padding: '$lg',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  zIndex: 1000,
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    scale: 0.8,
    y: -50,
  },
  exitStyle: {
    opacity: 0,
    scale: 0.8,
    y: -50,
  },
});

const ModalTitle = styled(H3, {
  name: 'ModalTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
  textAlign: 'center',
});

const ModalActions = styled(YStack, {
  name: 'ModalActions',
  gap: '$sm',
});

const ModalButton = styled(Button, {
  name: 'ModalButton',
  borderRadius: '$3',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '500',
  animation: 'quick',
  variants: {
    type: {
      primary: {
        backgroundColor: '$cupBlue',
        color: 'white',
      },
      secondary: {
        backgroundColor: '$gray4',
        color: '$color',
      },
      destructive: {
        backgroundColor: '$red9',
        color: 'white',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
  },
});

export type PhotoGalleryScreenProps = GetProps<typeof Container>;

const PhotoGalleryScreen: React.FC<PhotoGalleryScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

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
    setSelectedPhoto(item);
  };

  const navigateToTasting = (tastingId: string) => {
    navigation.navigate('TastingDetail', { tastingId });
    setSelectedPhoto(null);
  };

  const deletePhoto = async (item: PhotoItem) => {
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
    } finally {
      setSelectedPhoto(null);
    }
  };

  const renderPhotoGrid = () => {
    if (photos.length === 0) {
      return (
        <EmptyContainer>
          <EmptyIcon>📸</EmptyIcon>
          <EmptyText>아직 사진이 없습니다</EmptyText>
          <EmptySubtext>
            테이스팅 기록에서 커피 사진을 추가해보세요
          </EmptySubtext>
        </EmptyContainer>
      );
    }

    const photoRows = [];
    for (let i = 0; i < photos.length; i += 2) {
      const row = photos.slice(i, i + 2);
      photoRows.push(
        <XStack key={i} justifyContent="space-between" marginBottom="$sm">
          {row.map((item, index) => (
            <PhotoItem
              key={`photo-${item.id}-${index}`}
              onPress={() => handlePhotoPress(item)}
              onLongPress={() => handlePhotoLongPress(item)}
              animation="lazy"
              enterStyle={{
                opacity: 0,
                scale: 0.9,
                y: 20 + (i + index) * 5,
              }}
              animateOnly={['opacity', 'transform']}
              pressStyle={{ scale: 0.98 }}
            >
              <PhotoImage
                source={{ uri: PhotoService.getPhotoUri(item.thumbnailUri || item.uri) }}
                resizeMode="cover"
              />
              <PhotoInfo>
                <CoffeeName numberOfLines={1}>
                  {item.coffeeName}
                </CoffeeName>
                <RoasteryName numberOfLines={1}>
                  {item.roasteryName}
                </RoasteryName>
              </PhotoInfo>
            </PhotoItem>
          ))}
          {/* Add empty space if odd number of items */}
          {row.length === 1 && <View width={ITEM_SIZE} />}
        </XStack>
      );
    }

    return (
      <AnimatePresence>
        {photoRows}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <HeaderSection>
            <HeaderTitle>사진 갤러리</HeaderTitle>
            <HeaderSubtitle>사진을 불러오는 중...</HeaderSubtitle>
          </HeaderSection>
          
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>사진을 불러오는 중...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <AnimatePresence>
          {/* Header */}
          <HeaderSection
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -30,
            }}
            animateOnly={['opacity', 'transform']}
          >
            <HeaderTitle>사진 갤러리</HeaderTitle>
            <HeaderSubtitle>
              {photos.length}개의 사진
            </HeaderSubtitle>
          </HeaderSection>

          {/* Gallery Content */}
          <GalleryContainer
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: 30,
            }}
            animateOnly={['opacity', 'transform']}
          >
            {renderPhotoGrid()}
          </GalleryContainer>
        </AnimatePresence>

        {/* Photo Options Modal */}
        {selectedPhoto && (
          <AnimatePresence>
            <View
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0,0,0,0.5)"
              zIndex={999}
              onPress={() => setSelectedPhoto(null)}
              animation="quick"
              enterStyle={{
                opacity: 0,
              }}
              exitStyle={{
                opacity: 0,
              }}
            />
            <PhotoModalContainer>
              <ModalTitle>사진 옵션</ModalTitle>
              <Text fontSize="$4" color="$gray11" textAlign="center" marginBottom="$lg">
                {selectedPhoto.coffeeName}
              </Text>
              <ModalActions>
                <ModalButton
                  type="primary"
                  onPress={() => navigateToTasting(selectedPhoto.tastingId)}
                >
                  테이스팅 보기
                </ModalButton>
                <ModalButton
                  type="destructive"
                  onPress={() => {
                    Alert.alert(
                      '사진 삭제',
                      '이 사진을 삭제하시겠습니까? 테이스팅 기록에서도 제거됩니다.',
                      [
                        { text: '취소', style: 'cancel' },
                        { 
                          text: '삭제', 
                          style: 'destructive', 
                          onPress: () => deletePhoto(selectedPhoto)
                        },
                      ]
                    );
                  }}
                >
                  사진 삭제
                </ModalButton>
                <ModalButton
                  type="secondary"
                  onPress={() => setSelectedPhoto(null)}
                >
                  취소
                </ModalButton>
              </ModalActions>
            </PhotoModalContainer>
          </AnimatePresence>
        )}
      </SafeAreaView>
    </Container>
  );
};

export default PhotoGalleryScreen;