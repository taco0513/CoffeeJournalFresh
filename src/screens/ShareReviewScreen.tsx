import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../styles/common';
import { useUserStore } from '../stores/useUserStore';
import RealmService from '../services/realm/RealmService';
import { TastingRecord } from '../services/realm/schemas';
import PhotoService from '../services/PhotoService';

interface RouteParams {
  tastingId: string;
}

const ShareReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tastingId } = route.params as RouteParams;
  const { currentUser } = useUserStore();

  const [tasting, setTasting] = useState<TastingRecord | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [includePhoto, setIncludePhoto] = useState(true);
  const [includeFlavorNotes, setIncludeFlavorNotes] = useState(true);
  const [includeBrewingDetails, setIncludeBrewingDetails] = useState(true);
  const [makePublic, setMakePublic] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    loadTastingRecord();
  }, [tastingId]);

  const loadTastingRecord = async () => {
    try {
      const realmService = RealmService.getInstance();
      const record = realmService.getTastingRecord(tastingId);
      
      if (record) {
        setTasting(record);
        // Pre-fill review text with existing notes
        if (record.notes) {
          setReviewText(record.notes);
        }
      } else {
        Alert.alert('오류', '테이스팅 기록을 찾을 수 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      // console.error('Failed to load tasting record:', error);
      Alert.alert('오류', '테이스팅 기록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleShare = async () => {
    if (!tasting) return;

    if (!reviewText.trim()) {
      Alert.alert('리뷰 작성', '리뷰 내용을 입력해주세요.');
      return;
    }

    setIsSharing(true);

    try {
      // TODO: Implement actual sharing to Supabase
      // For now, just show a success message
      
      const shareData = {
        tastingId: tasting.id,
        userId: currentUser?.id,
        username: currentUser?.username || 'anonymous',
        coffeeName: tasting.coffeeName,
        roasteryName: tasting.roasteryName,
        brewMethod: tasting.brewMethod,
        rating: tasting.matchScoreTotal / 20, // Convert to 5-star scale
        reviewText: reviewText.trim(),
        photoUri: includePhoto ? tasting.photoUri : null,
        flavorNotes: includeFlavorNotes ? tasting.flavorWheelSelections : null,
        brewingDetails: includeBrewingDetails ? {
          grindSize: tasting.grindSize,
          waterTemp: tasting.waterTemp,
          brewTime: tasting.brewTime,
          ratio: tasting.ratio,
        } : null,
        isPublic: makePublic,
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        '공유 완료',
        '리뷰가 성공적으로 공유되었습니다!',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      // console.error('Failed to share review:', error);
      Alert.alert('오류', '리뷰를 공유하는 중 오류가 발생했습니다.');
    } finally {
      setIsSharing(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={`full-${i}`} style={styles.star}>★</Text>);
    }

    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>☆</Text>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>☆</Text>);
    }

    return stars;
  };

  if (!tasting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rating = tasting.matchScoreTotal / 20; // Convert to 5-star scale

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>리뷰 공유</Text>
            <Text style={styles.headerSubtitle}>커뮤니티와 테이스팅 경험을 공유해보세요</Text>
          </View>

          {/* Coffee Info Preview */}
          <View style={styles.coffeePreview}>
            <Text style={styles.coffeeName}>{tasting.coffeeName}</Text>
            <Text style={styles.roasteryName}>{tasting.roasteryName}</Text>
            
            <View style={styles.brewMethodContainer}>
              <Text style={styles.brewMethod}>{tasting.brewMethod}</Text>
            </View>

            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(rating)}
              </View>
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Review Text Input */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>리뷰 내용</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="이 커피에 대한 당신의 생각을 공유해주세요..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{reviewText.length}/1000</Text>
          </View>

          {/* Share Options */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>공유 옵션</Text>

            {/* Include Photo */}
            {tasting.photoUri && (
              <View style={styles.optionItem}>
                <View style={styles.optionLeft}>
                  <Text style={styles.optionTitle}>사진 포함</Text>
                  <Text style={styles.optionSubtitle}>커피 사진을 함께 공유합니다</Text>
                </View>
                <Switch
                  value={includePhoto}
                  onValueChange={setIncludePhoto}
                  trackColor={{ false: HIGColors.gray4, true: HIGColors.blue }}
                  thumbColor={includePhoto ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            )}

            {/* Include Flavor Notes */}
            {tasting.flavorWheelSelections && tasting.flavorWheelSelections.length > 0 && (
              <View style={styles.optionItem}>
                <View style={styles.optionLeft}>
                  <Text style={styles.optionTitle}>맛 노트 포함</Text>
                  <Text style={styles.optionSubtitle}>선택한 플레이버 노트를 공유합니다</Text>
                </View>
                <Switch
                  value={includeFlavorNotes}
                  onValueChange={setIncludeFlavorNotes}
                  trackColor={{ false: HIGColors.gray4, true: HIGColors.blue }}
                  thumbColor={includeFlavorNotes ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            )}

            {/* Include Brewing Details */}
            <View style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionTitle}>브루잉 디테일 포함</Text>
                <Text style={styles.optionSubtitle}>추출 조건을 함께 공유합니다</Text>
              </View>
              <Switch
                value={includeBrewingDetails}
                onValueChange={setIncludeBrewingDetails}
                trackColor={{ false: HIGColors.gray4, true: HIGColors.blue }}
                thumbColor={includeBrewingDetails ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            {/* Make Public */}
            <View style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionTitle}>공개 설정</Text>
                <Text style={styles.optionSubtitle}>모든 사용자가 볼 수 있도록 공개합니다</Text>
              </View>
              <Switch
                value={makePublic}
                onValueChange={setMakePublic}
                trackColor={{ false: HIGColors.gray4, true: HIGColors.blue }}
                thumbColor={makePublic ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>미리보기</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewAvatar}>
                  <Text style={styles.previewAvatarText}>
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.previewUserInfo}>
                  <Text style={styles.previewUsername}>{currentUser?.username || 'anonymous'}</Text>
                  <Text style={styles.previewTime}>지금</Text>
                </View>
              </View>

              <View style={styles.previewContent}>
                <Text style={styles.previewCoffeeName}>{tasting.coffeeName}</Text>
                <Text style={styles.previewRoasteryName}>{tasting.roasteryName}</Text>
                
                <View style={styles.previewRating}>
                  <View style={styles.starsContainer}>
                    {renderStars(rating)}
                  </View>
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>

                {reviewText.trim() && (
                  <Text style={styles.previewReviewText}>{reviewText}</Text>
                )}

                {includePhoto && tasting.photoUri && (
                  <Image 
                    source={{ uri: PhotoService.getPhotoUri(tasting.photoUri) }} 
                    style={styles.previewPhoto} 
                  />
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Share Button */}
        <View style={styles.shareButtonContainer}>
          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={isSharing || !reviewText.trim()}
          >
            <Text style={styles.shareButtonText}>
              {isSharing ? '공유 중...' : '리뷰 공유하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
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
  coffeePreview: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.secondarySystemBackground,
    marginHorizontal: HIGConstants.SPACING_LG,
    marginTop: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  coffeeName: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasteryName: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  brewMethodContainer: {
    alignSelf: 'flex-start',
    marginBottom: HIGConstants.SPACING_MD,
  },
  brewMethod: {
    fontSize: 13,
    color: HIGColors.blue,
    backgroundColor: HIGColors.systemBackground,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.BORDER_RADIUS / 2,
    borderWidth: 1,
    borderColor: HIGColors.blue,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: HIGConstants.SPACING_SM,
  },
  star: {
    fontSize: 16,
    color: '#FFD700',
  },
  emptyStar: {
    fontSize: 16,
    color: HIGColors.gray4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  reviewSection: {
    padding: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  reviewInput: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.label,
    height: 120,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  characterCount: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    textAlign: 'right',
    marginTop: HIGConstants.SPACING_SM,
  },
  optionsSection: {
    padding: HIGConstants.SPACING_LG,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray5,
  },
  optionLeft: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  optionSubtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  previewSection: {
    padding: HIGConstants.SPACING_LG,
  },
  previewCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HIGColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  previewAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewUserInfo: {
    flex: 1,
  },
  previewUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  previewTime: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
  },
  previewContent: {
    // Content styles
  },
  previewCoffeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  previewRoasteryName: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  previewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  previewReviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  previewPhoto: {
    width: '100%',
    height: 200,
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.gray5,
  },
  shareButtonContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
  },
  shareButton: {
    backgroundColor: HIGColors.blue,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingVertical: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: HIGColors.gray4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ShareReviewScreen;