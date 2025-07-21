import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';

export interface BookmarkedFlavor {
  id: string;
  flavor: string;
  count: number;
  lastUsed: Date;
  personalNote?: string;
  associatedFlavors: string[];
}

interface PersonalFlavorLibraryProps {
  bookmarkedFlavors: BookmarkedFlavor[];
  onSelectFlavor?: (flavor: string) => void;
  onUpdateNote?: (flavorId: string, note: string) => void;
  onRemoveBookmark?: (flavorId: string) => void;
  showSelectionMode?: boolean;
}

export const PersonalFlavorLibrary: React.FC<PersonalFlavorLibraryProps> = ({
  bookmarkedFlavors,
  onSelectFlavor,
  onUpdateNote,
  onRemoveBookmark,
  showSelectionMode = false,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<BookmarkedFlavor | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [sortBy, setSortBy] = useState<'frequency' | 'recent' | 'alphabetical'>('frequency');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const sortedFlavors = [...bookmarkedFlavors].sort((a, b) => {
    switch (sortBy) {
      case 'frequency':
        return b.count - a.count;
      case 'recent':
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      case 'alphabetical':
        return a.flavor.localeCompare(b.flavor);
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'fruity', name: 'Fruity', emoji: '🍓' },
    { id: 'nutty', name: 'Nutty', emoji: '🥜' },
    { id: 'chocolate', name: 'Chocolate', emoji: '🍫' },
    { id: 'floral', name: 'Floral', emoji: '🌸' },
    { id: 'other', name: 'Other', emoji: '✨' },
  ];

  const getCategoryForFlavor = (flavor: string): string => {
    const fruitKeywords = ['berry', 'citrus', 'fruit', 'apple', 'grape'];
    const nutKeywords = ['nut', 'almond', 'hazel', 'walnut'];
    const chocolateKeywords = ['chocolate', 'cocoa', 'cacao'];
    const floralKeywords = ['flower', 'floral', 'rose', 'jasmine'];
    
    const lowerFlavor = flavor.toLowerCase();
    
    if (fruitKeywords.some(k => lowerFlavor.includes(k))) return 'fruity';
    if (nutKeywords.some(k => lowerFlavor.includes(k))) return 'nutty';
    if (chocolateKeywords.some(k => lowerFlavor.includes(k))) return 'chocolate';
    if (floralKeywords.some(k => lowerFlavor.includes(k))) return 'floral';
    return 'other';
  };

  const filteredFlavors = filterCategory
    ? sortedFlavors.filter(f => getCategoryForFlavor(f.flavor) === filterCategory)
    : sortedFlavors;

  const handleFlavorPress = (flavor: BookmarkedFlavor) => {
    if (showSelectionMode && onSelectFlavor) {
      onSelectFlavor(flavor.flavor);
    } else {
      setSelectedFlavor(flavor);
      setNoteText(flavor.personalNote || '');
      setShowNoteModal(true);
    }
  };

  const handleSaveNote = () => {
    if (selectedFlavor && onUpdateNote) {
      onUpdateNote(selectedFlavor.id, noteText);
    }
    setShowNoteModal(false);
    setSelectedFlavor(null);
    setNoteText('');
  };

  const getUsageLevel = (count: number): { label: string; color: string } => {
    if (count >= 10) return { label: '자주 사용', color: HIGColors.systemGreen };
    if (count >= 5) return { label: '가끔 사용', color: HIGColors.systemBlue };
    return { label: '최근 발견', color: HIGColors.systemGray3 };
  };

  const formatLastUsed = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    return `${Math.floor(diffInDays / 30)}개월 전`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>내 향미 라이브러리</Text>
        <Text style={styles.subtitle}>
          {bookmarkedFlavors.length}개의 향미를 저장했어요
        </Text>
      </View>

      {/* Sort Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sortContainer}
      >
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'frequency' && styles.activeSortChip]}
          onPress={() => setSortBy('frequency')}
        >
          <Text style={[styles.sortChipText, sortBy === 'frequency' && styles.activeSortChipText]}>
            자주 사용한 순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'recent' && styles.activeSortChip]}
          onPress={() => setSortBy('recent')}
        >
          <Text style={[styles.sortChipText, sortBy === 'recent' && styles.activeSortChipText]}>
            최근 사용한 순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'alphabetical' && styles.activeSortChip]}
          onPress={() => setSortBy('alphabetical')}
        >
          <Text style={[styles.sortChipText, sortBy === 'alphabetical' && styles.activeSortChipText]}>
            가나다 순
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !filterCategory && styles.activeCategoryChip]}
          onPress={() => setFilterCategory(null)}
        >
          <Text style={styles.categoryEmoji}>📚</Text>
          <Text style={[styles.categoryText, !filterCategory && styles.activeCategoryText]}>
            전체
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              filterCategory === category.id && styles.activeCategoryChip
            ]}
            onPress={() => setFilterCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[
              styles.categoryText,
              filterCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Flavor List */}
      <ScrollView style={styles.flavorList}>
        {filteredFlavors.map((flavor) => {
          const usageLevel = getUsageLevel(flavor.count);
          return (
            <TouchableOpacity
              key={flavor.id}
              style={styles.flavorCard}
              onPress={() => handleFlavorPress(flavor)}
              activeOpacity={0.7}
            >
              <View style={styles.flavorCardContent}>
                <View style={styles.flavorInfo}>
                  <Text style={styles.flavorName}>{flavor.flavor}</Text>
                  <View style={styles.flavorMetadata}>
                    <View style={[styles.usageBadge, { backgroundColor: usageLevel.color + '20' }]}>
                      <Text style={[styles.usageText, { color: usageLevel.color }]}>
                        {usageLevel.label}
                      </Text>
                    </View>
                    <Text style={styles.countText}>×{flavor.count}</Text>
                    <Text style={styles.lastUsedText}>
                      {formatLastUsed(flavor.lastUsed)}
                    </Text>
                  </View>
                  {flavor.personalNote && (
                    <Text style={styles.notePreview} numberOfLines={1}>
                      💭 {flavor.personalNote}
                    </Text>
                  )}
                  {flavor.associatedFlavors.length > 0 && (
                    <View style={styles.associatedFlavors}>
                      <Text style={styles.associatedLabel}>함께 사용한 향미:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.associatedList}>
                          {flavor.associatedFlavors.slice(0, 3).map((associated, index) => (
                            <View key={index} style={styles.associatedChip}>
                              <Text style={styles.associatedText}>{associated}</Text>
                            </View>
                          ))}
                          {flavor.associatedFlavors.length > 3 && (
                            <Text style={styles.moreText}>+{flavor.associatedFlavors.length - 3}</Text>
                          )}
                        </View>
                      </ScrollView>
                    </View>
                  )}
                </View>
                {showSelectionMode ? (
                  <Text style={styles.selectIcon}>➕</Text>
                ) : (
                  <Text style={styles.editIcon}>✏️</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedFlavor?.flavor} 노트
              </Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.noteInput}
              placeholder="이 향미에 대한 나만의 설명을 적어보세요..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              {selectedFlavor && onRemoveBookmark && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    onRemoveBookmark(selectedFlavor.id);
                    setShowNoteModal(false);
                  }}
                >
                  <Text style={styles.removeButtonText}>북마크 제거</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNote}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.white,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  sortContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  sortChip: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    backgroundColor: HIGColors.systemGray6,
    marginRight: HIGConstants.SPACING_SM,
  },
  activeSortChip: {
    backgroundColor: HIGColors.systemBlue,
  },
  sortChipText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  activeSortChipText: {
    color: HIGColors.white,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    backgroundColor: HIGColors.white,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    marginRight: HIGConstants.SPACING_SM,
    gap: HIGConstants.SPACING_XS,
  },
  activeCategoryChip: {
    backgroundColor: HIGColors.systemBlue + '20',
    borderColor: HIGColors.systemBlue,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  activeCategoryText: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },
  flavorList: {
    flex: 1,
    padding: HIGConstants.SPACING_LG,
  },
  flavorCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flavorCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flavorInfo: {
    flex: 1,
  },
  flavorName: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  flavorMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
  },
  usageBadge: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  usageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  lastUsedText: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
  },
  notePreview: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
    marginBottom: HIGConstants.SPACING_SM,
  },
  associatedFlavors: {
    marginTop: HIGConstants.SPACING_SM,
  },
  associatedLabel: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  associatedList: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_XS,
  },
  associatedChip: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  associatedText: {
    fontSize: 12,
    color: HIGColors.label,
  },
  moreText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    alignSelf: 'center',
    marginLeft: HIGConstants.SPACING_XS,
  },
  selectIcon: {
    fontSize: 20,
    color: HIGColors.systemBlue,
  },
  editIcon: {
    fontSize: 18,
    color: HIGColors.tertiaryLabel,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: HIGColors.white,
    borderTopLeftRadius: HIGConstants.cornerRadiusLarge,
    borderTopRightRadius: HIGConstants.cornerRadiusLarge,
    padding: HIGConstants.SPACING_LG,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
  },
  closeButton: {
    fontSize: 24,
    color: HIGColors.tertiaryLabel,
  },
  noteInput: {
    fontSize: 16,
    color: HIGColors.label,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    minHeight: 100,
    marginBottom: HIGConstants.SPACING_LG,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: HIGConstants.SPACING_MD,
  },
  removeButton: {
    flex: 1,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    backgroundColor: HIGColors.systemRed + '20',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.systemRed,
  },
  saveButton: {
    flex: 2,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    backgroundColor: HIGColors.systemBlue,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
  },
});