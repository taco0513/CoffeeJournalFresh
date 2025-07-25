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
  backgroundHover: '#F8F9FA',
} as const;

export const unifiedFlavorScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: Colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray6,
  },
  backButton: {
    fontSize: 24,
    color: Colors.cupBlue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.color,
  },
  skipButton: {
    fontSize: 15,
    color: Colors.cupBlue,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.gray5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.cupBlue,
  },
  guideMessageContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#E3F2FD', // CupBlue light variant
  },
  guideMessage: {
    fontSize: 15,
    color: Colors.cupBlue,
    textAlign: 'center',
    fontWeight: '500',
  },
  guideSubMessage: {
    fontSize: 13,
    color: Colors.gray11,
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray4,
    borderRadius: 12,
    paddingHorizontal: HIGConstants.SPACING_MD,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.gray5,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: HIGConstants.SPACING_SM,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.color,
  },
  clearIcon: {
    fontSize: 18,
    color: Colors.gray10,
    padding: HIGConstants.SPACING_XS,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: HIGConstants.SPACING_MD,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HIGConstants.SPACING_XL * 4,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: Colors.systemGray4,
  },
  nextButton: {
    height: 48,
    backgroundColor: Colors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.systemGray4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});