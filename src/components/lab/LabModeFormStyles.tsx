// LabModeFormStyles.tsx
// Styles for LabModeForm components - extracted for modularity

import { StyleSheet } from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';

export const labModeFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  scrollView: {
    flex: 1,
    paddingHorizontal: HIGConstants.padding.lg,
    paddingTop: HIGConstants.padding.md,
},
  section: {
    marginBottom: HIGConstants.margin.xl,
},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.margin.md,
},
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.margin.sm,
    marginTop: HIGConstants.margin.md,
},
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: HIGConstants.margin.sm,
},
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.borderRadius.md,
    paddingHorizontal: HIGConstants.padding.md,
    fontSize: 18,
    color: HIGColors.label,
    borderWidth: 1,
    borderColor: HIGColors.separator,
},
  horizontalScroll: {
    marginBottom: HIGConstants.margin.md,
},
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.padding.xs,
},
  chip: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.borderRadius.lg,
    paddingHorizontal: HIGConstants.padding.md,
    paddingVertical: HIGConstants.padding.sm,
    marginHorizontal: HIGConstants.margin.xs,
    borderWidth: 1,
    borderColor: HIGColors.separator,
},
  chipActive: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
},
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
},
  chipTextActive: {
    color: HIGColors.white,
},
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HIGConstants.margin.sm,
},
  gridItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: HIGConstants.margin.sm,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.borderRadius.md,
    paddingVertical: HIGConstants.padding.md,
    paddingHorizontal: HIGConstants.padding.sm,
    borderWidth: 1,
    borderColor: HIGColors.separator,
},
  gridItemActive: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
},
  gridItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
},
  gridItemTextActive: {
    color: HIGColors.white,
},
  grinderSection: {
    marginTop: HIGConstants.margin.md,
},
  grinderInputs: {
    flexDirection: 'row',
    gap: HIGConstants.margin.sm,
},
  grinderInput: {
    flex: 1,
},
  sliderContainer: {
    marginVertical: HIGConstants.margin.md,
},
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.margin.sm,
},
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    minWidth: 50,
    textAlign: 'right',
},
  slider: {
    flex: 1,
    marginRight: HIGConstants.margin.md,
},
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HIGConstants.padding.sm,
},
  switchLabel: {
    fontSize: 16,
    color: HIGColors.label,
    flex: 1,
},
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.borderRadius.md,
    borderWidth: 1,
    borderColor: HIGColors.separator,
    overflow: 'hidden',
},
  numberInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: HIGConstants.padding.md,
    fontSize: 18,
    color: HIGColors.label,
    textAlign: 'center',
},
  numberButton: {
    width: 44,
    height: 44,
    backgroundColor: HIGColors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
},
  numberButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.white,
},
  pourTechniqueCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.borderRadius.md,
    padding: HIGConstants.padding.md,
    marginBottom: HIGConstants.margin.sm,
    borderWidth: 1,
    borderColor: HIGColors.separator,
},
  pourTechniqueCardActive: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
},
  pourTechniqueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.margin.xs,
},
  pourTechniqueTitleActive: {
    color: HIGColors.white,
},
  pourTechniqueDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
},
  pourTechniqueDescriptionActive: {
    color: HIGColors.white,
    opacity: 0.9,
},
  notesTextArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: HIGConstants.padding.md,
},
  saveButton: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.borderRadius.md,
    paddingVertical: HIGConstants.padding.md,
    paddingHorizontal: HIGConstants.padding.lg,
    alignItems: 'center',
    marginTop: HIGConstants.margin.lg,
    marginBottom: HIGConstants.margin.xl,
},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
},
});