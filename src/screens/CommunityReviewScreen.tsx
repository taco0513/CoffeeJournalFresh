import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../styles/common';
import { useUserStore } from '../stores/useUserStore';

interface Comment {
  id: string;
  username: string;
  text: string;
  createdAt: Date;
  isOwner: boolean;
}

interface CommunityReview {
  id: string;
  username: string;
  avatar?: string;
  coffeeName: string;
  roasteryName: string;
  brewMethod: string;
  rating: number;
  reviewText: string;
  photoUri?: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  flavorNotes: string[];
  brewingDetails: {
    grindSize: string;
    waterTemp: string;
    brewTime: string;
    ratio: string;
  };
}

interface RouteParams {
  reviewId: string;
}

const CommunityReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reviewId } = route.params as RouteParams;
  const { currentUser } = useUserStore();

  const [review, setReview] = useState<CommunityReview | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviewDetails();
    loadComments();
  }, [reviewId]);

  const loadReviewDetails = async () => {
    try {
      // TODO: Replace with actual Supabase API call
      // Mock data for now
      const mockReview: CommunityReview = {
        id: reviewId,
        username: 'coffee_lover',
        coffeeName: 'Colombia Huila',
        roasteryName: 'Blue Bottle',
        brewMethod: 'V60',
        rating: 4.5,
        reviewText: '정말 맛있는 커피였습니다! 초콜릿과 견과류 향이 뛰어나고 산미가 균형잡혀 있어요. 아침에 마시기 완벽한 커피라고 생각합니다.',
        createdAt: new Date('2024-01-15'),
        likesCount: 12,
        commentsCount: 3,
        isLiked: false,
        flavorNotes: ['초콜릿', '견과류', '캐러멜', '오렌지'],
        brewingDetails: {
          grindSize: '중간',
          waterTemp: '93°C',
          brewTime: '3분 30초',
          ratio: '1:15',
        },
      };

      setReview(mockReview);
    } catch (error) {
      // console.error('Failed to load review details:', error);
      Alert.alert('오류', '리뷰 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // TODO: Replace with actual Supabase API call
      // Mock data for now
      const mockComments: Comment[] = [
        {
          id: '1',
          username: 'barista_kim',
          text: '좋은 리뷰 감사합니다! 저도 이 커피 마셔봤는데 정말 맛있더라구요.',
          createdAt: new Date('2024-01-15T10:30:00'),
          isOwner: false,
        },
        {
          id: '2',
          username: 'coffee_explorer',
          text: '브루잉 디테일도 공유해주셔서 참고가 많이 되었습니다 👍',
          createdAt: new Date('2024-01-15T14:20:00'),
          isOwner: false,
        },
        {
          id: '3',
          username: 'coffee_lover',
          text: '도움이 되셨다니 기쁩니다! 다른 추천하고 싶은 커피도 있으면 알려드릴게요.',
          createdAt: new Date('2024-01-15T15:45:00'),
          isOwner: true,
        },
      ];

      setComments(mockComments);
    } catch (error) {
      // console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    if (!review) return;

    // TODO: Implement like functionality with Supabase
    setReview(prev => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
    } : prev);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // TODO: Implement comment functionality with Supabase
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        username: currentUser?.username || 'anonymous',
        text: newComment.trim(),
        createdAt: new Date(),
        isOwner: false,
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      
      // Update review comment count
      if (review) {
        setReview(prev => prev ? {
          ...prev,
          commentsCount: prev.commentsCount + 1
        } : prev);
      }
    } catch (error) {
      // console.error('Failed to add comment:', error);
      Alert.alert('오류', '댓글을 추가하는 중 오류가 발생했습니다.');
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment) => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {comment.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.commentInfo}>
          <Text style={[styles.commentUsername, comment.isOwner && styles.ownerUsername]}>
            {comment.username}
            {comment.isOwner && <Text style={styles.ownerBadge}> 작성자</Text>}
          </Text>
          <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
    </View>
  );

  if (loading || !review) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.reviewHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {review.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.username}>{review.username}</Text>
                <Text style={styles.timeAgo}>{formatDate(review.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Coffee Info */}
          <View style={styles.coffeeSection}>
            <Text style={styles.coffeeName}>{review.coffeeName}</Text>
            <Text style={styles.roasteryName}>{review.roasteryName}</Text>
            
            <View style={styles.brewMethodContainer}>
              <Text style={styles.brewMethod}>{review.brewMethod}</Text>
            </View>

            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.ratingText}>{review.rating}</Text>
            </View>
          </View>

          {/* Review Text */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewText}>{review.reviewText}</Text>
          </View>

          {/* Photo */}
          {review.photoUri && (
            <View style={styles.photoSection}>
              <Image source={{ uri: review.photoUri }} style={styles.reviewPhoto} />
            </View>
          )}

          {/* Flavor Notes */}
          <View style={styles.flavorSection}>
            <Text style={styles.sectionTitle}>맛 노트</Text>
            <View style={styles.flavorTags}>
              {review.flavorNotes.map((flavor, index) => (
                <View key={index} style={styles.flavorTag}>
                  <Text style={styles.flavorTagText}>{flavor}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Brewing Details */}
          <View style={styles.brewingSection}>
            <Text style={styles.sectionTitle}>브루잉 디테일</Text>
            <View style={styles.brewingDetails}>
              <View style={styles.brewingDetail}>
                <Text style={styles.brewingLabel}>분쇄도</Text>
                <Text style={styles.brewingValue}>{review.brewingDetails.grindSize}</Text>
              </View>
              <View style={styles.brewingDetail}>
                <Text style={styles.brewingLabel}>물 온도</Text>
                <Text style={styles.brewingValue}>{review.brewingDetails.waterTemp}</Text>
              </View>
              <View style={styles.brewingDetail}>
                <Text style={styles.brewingLabel}>브루 시간</Text>
                <Text style={styles.brewingValue}>{review.brewingDetails.brewTime}</Text>
              </View>
              <View style={styles.brewingDetail}>
                <Text style={styles.brewingLabel}>비율</Text>
                <Text style={styles.brewingValue}>{review.brewingDetails.ratio}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Text style={[styles.actionIcon, review.isLiked && styles.likedIcon]}>
                {review.isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={styles.actionText}>{review.likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{review.commentsCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>↗️</Text>
              <Text style={styles.actionText}>공유</Text>
            </TouchableOpacity>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>댓글 ({comments.length})</Text>
            {comments.map(renderComment)}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.sendButtonText}>전송</Text>
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
  reviewHeader: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: HIGColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  coffeeSection: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  coffeeName: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasteryName: {
    fontSize: 18,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  brewMethodContainer: {
    alignSelf: 'flex-start',
    marginBottom: HIGConstants.SPACING_MD,
  },
  brewMethod: {
    fontSize: 14,
    color: HIGColors.blue,
    backgroundColor: HIGColors.systemBackground,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
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
    fontSize: 20,
    color: '#FFD700',
  },
  emptyStar: {
    fontSize: 20,
    color: HIGColors.gray4,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
  },
  reviewSection: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  reviewText: {
    fontSize: 17,
    lineHeight: 26,
    color: HIGColors.label,
  },
  photoSection: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  reviewPhoto: {
    width: '100%',
    height: 300,
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.gray5,
  },
  flavorSection: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  flavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  flavorTag: {
    backgroundColor: HIGColors.secondarySystemBackground,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  flavorTagText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  brewingSection: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  brewingDetails: {
    gap: HIGConstants.SPACING_MD,
  },
  brewingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brewingLabel: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  brewingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_XS,
  },
  likedIcon: {
    // Additional styles for liked state
  },
  actionText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  commentsSection: {
    padding: HIGConstants.SPACING_LG,
  },
  commentItem: {
    marginBottom: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray5,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HIGColors.gray3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_SM,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  commentInfo: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
  },
  ownerUsername: {
    color: HIGColors.blue,
  },
  ownerBadge: {
    fontSize: 12,
    color: HIGColors.blue,
    fontWeight: '400',
  },
  commentDate: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: HIGColors.label,
    marginLeft: 40,
  },
  commentInputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: HIGConstants.SPACING_LG,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
    backgroundColor: HIGColors.systemBackground,
  },
  commentInput: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    marginRight: HIGConstants.SPACING_SM,
    fontSize: 16,
    color: HIGColors.label,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: HIGColors.blue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  sendButtonDisabled: {
    backgroundColor: HIGColors.gray4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityReviewScreen;