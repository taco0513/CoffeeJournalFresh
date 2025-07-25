import { StyleSheet } from 'react-native';
import { HIGConstants } from '../../../styles/common';

// Tamagui color tokens (will be replaced with direct token usage when migrating to Tamagui styled components)
const Colors = {
  background: '#FFFFFF',
  cupBlue: '#2196F3',
  gray6: '#D1D1D6',
  gray5: '#E5E5EA',
  gray4: '#F2F2F7',
  color: '#000000',
  gray11: '#3C3C43',
  gray10: '#8E8E93',
  backgroundHover: '#FAFAFA',
  cupBlueLight: '#E3F2FD',
} as const;

export const categoryAccordionStyles = StyleSheet.create({
  categoryContainer: {
    marginHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  categoryCard: {
    backgroundColor: Colors.background,
    borderRadius: HIGConstants.cornerRadiusMedium,
    overflow: 'visible',
  },
  categoryCardExpanded: {
    backgroundColor: Colors.gray4,
    borderBottomColor: Colors.gray6,
  },
  categoryColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.8,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.color,
  },
  categorySubtext: {
    fontSize: 13,
    color: Colors.gray11,
    marginTop: 2,
    marginLeft: 28, // Align with title (emoji width + spacing)
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.gray5,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.color,
  },
  categorySelectedBadge: {
    backgroundColor: Colors.cupBlue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: HIGConstants.SPACING_XS,
  },
  categorySelectedCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandIcon: {
    fontSize: 20,
    color: Colors.gray10,
    fontWeight: '300',
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  categoryExpandedContent: {
    backgroundColor: Colors.backgroundHover,
    paddingVertical: HIGConstants.SPACING_SM,
    marginTop: 0,
    borderBottomLeftRadius: HIGConstants.cornerRadiusMedium,
    borderBottomRightRadius: HIGConstants.cornerRadiusMedium,
  },
  categoryGuide: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  categoryGuideText: {
    fontSize: 12,
    color: Colors.gray11,
    fontStyle: 'italic',
  },
  subCategoryScroll: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subCategoryChip: {
    backgroundColor: Colors.gray4,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25, // Perfect pill shape
    marginRight: HIGConstants.SPACING_SM,
    borderWidth: 0,
    minHeight: 40,
  },
  subCategoryChipSelected: {
    backgroundColor: Colors.cupBlue,
    borderWidth: 0,
  },
  subCategoryText: {
    fontSize: 14,
    color: Colors.color,
    fontWeight: '500',
  },
  subCategoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subCategoryChipFullySelected: {
    backgroundColor: Colors.cupBlue,
    borderWidth: 0,
  },
  subCategoryTextFullySelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subCategoryChipChildSelected: {
    backgroundColor: Colors.cupBlueLight,
    borderWidth: 1.5,
    borderColor: Colors.cupBlue,
  },
  subCategoryTextChildSelected: {
    color: Colors.cupBlue,
    fontWeight: '600',
  },
  flavorGrid: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  subcategoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray11,
    marginBottom: HIGConstants.SPACING_XS,
  },
  flavorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorButton: {
    backgroundColor: Colors.gray4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25, // Perfect pill shape
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36, // Match other flavor chips
  },
  flavorButtonSelected: {
    backgroundColor: Colors.cupBlue,
    borderWidth: 0,
  },
  flavorButtonDisabled: {
    opacity: 0.4,
    backgroundColor: Colors.gray5,
  },
  flavorText: {
    fontSize: 14,
    color: Colors.color,
    fontWeight: '500',
  },
  flavorTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  flavorTextDisabled: {
    color: Colors.gray10,
  },
  noFlavorContainer: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    backgroundColor: Colors.gray4,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFlavorText: {
    fontSize: 13,
    color: Colors.gray11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});