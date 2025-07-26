import { StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../../styles/common';

export const selectedFlavorsHeaderStyles = StyleSheet.create({
  stickyHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    paddingBottom: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90,
},
  stickyHeaderEmpty: {
    paddingBottom: HIGConstants.SPACING_XS,
},
  stickyHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
},
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
},
  toggleAllText: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    fontWeight: '500',
},
  selectedScrollContent: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
},
  selectedChip: {
    position: 'relative',
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25, // Perfect pill shape - half of height
    marginRight: HIGConstants.SPACING_SM,
    marginVertical: 4,
    borderWidth: 0, // Remove border for clean pill look
    overflow: 'visible',
    height: 36, // Increased for better pill proportion
    justifyContent: 'center',
    alignItems: 'center',
},
  chipTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
},
  selectedChipText: {
    fontSize: 14,
    color: '#FFFFFF', // White text to match selected state
    fontWeight: '500',
    lineHeight: 20,
},
  selectedSubcategoryChip: {
    backgroundColor: HIGColors.systemBlue, // Same blue as regular selected chips
    borderWidth: 0, // Remove border for consistency
    height: 40, // Slightly larger for subcategories
    borderRadius: 25, // Perfect pill shape
    paddingHorizontal: 18,
},
  selectedSubcategoryText: {
    fontSize: 14,
    color: '#FFFFFF', // White text to match selected state
    fontWeight: '600',
    lineHeight: 20,
},
  chipRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HIGColors.systemRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
},
  chipRemoveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
},
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
},
  emptyMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
},
  emptySubMessage: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginTop: 4,
},
});