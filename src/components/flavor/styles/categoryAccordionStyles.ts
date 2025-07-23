import { StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../../styles/common';

export const categoryAccordionStyles = StyleSheet.create({
  categoryContainer: {
    marginHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.cornerRadiusLarge,
    overflow: 'visible',
  },
  categoryCardExpanded: {
    backgroundColor: HIGColors.systemGray6,
    borderBottomColor: HIGColors.systemGray4,
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
    color: HIGColors.label,
  },
  categorySubtext: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
    marginLeft: 28, // Align with title (emoji width + spacing)
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: HIGColors.systemGray5,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
  },
  categorySelectedBadge: {
    backgroundColor: HIGColors.systemBlue,
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
    color: HIGColors.tertiaryLabel,
    fontWeight: '300',
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  categoryExpandedContent: {
    backgroundColor: '#FAFAFA',
    paddingVertical: HIGConstants.SPACING_SM,
    marginTop: 0,
    borderBottomLeftRadius: HIGConstants.cornerRadiusLarge,
    borderBottomRightRadius: HIGConstants.cornerRadiusLarge,
  },
  categoryGuide: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  categoryGuideText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
  },
  subCategoryScroll: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subCategoryChip: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 16,
    marginRight: HIGConstants.SPACING_SM,
    borderWidth: 0,
    minHeight: 36,
  },
  subCategoryChipSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderWidth: 0,
  },
  subCategoryText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
  },
  subCategoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subCategoryChipFullySelected: {
    backgroundColor: HIGColors.systemBlue,
    borderWidth: 0,
  },
  subCategoryTextFullySelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subCategoryChipChildSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1.5,
    borderColor: HIGColors.systemBlue,
  },
  subCategoryTextChildSelected: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },
  flavorGrid: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  subcategoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  flavorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorButton: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  flavorButtonSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderWidth: 0,
  },
  flavorButtonDisabled: {
    opacity: 0.4,
    backgroundColor: HIGColors.systemGray5,
  },
  flavorText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
  },
  flavorTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  flavorTextDisabled: {
    color: HIGColors.tertiaryLabel,
  },
  noFlavorContainer: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFlavorText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});