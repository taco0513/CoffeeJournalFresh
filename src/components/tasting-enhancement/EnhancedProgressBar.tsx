import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';

export enum StepStatus {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  SKIPPED = 'skipped',
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',
  CURRENT = 'current',
}

export interface TastingStep {
  id: string;
  name: string;
  status: StepStatus;
  canRevisit: boolean;
  isCompleted: boolean;
}

interface EnhancedProgressBarProps {
  steps: TastingStep[];
  currentStepIndex: number;
  onStepPress?: (stepIndex: number) => void;
}

export const EnhancedProgressBar: React.FC<EnhancedProgressBarProps> = ({
  steps,
  currentStepIndex,
  onStepPress,
}) => {
  const getStepColor = (step: TastingStep, index: number) => {
    if (index === currentStepIndex) return HIGColors.systemBlue;
    if (step.isCompleted) return HIGColors.systemGreen;
    if (step.status === StepStatus.SKIPPED) return HIGColors.systemGray4;
    if (step.status === StepStatus.REQUIRED) return HIGColors.systemOrange;
    return HIGColors.systemGray5;
  };

  const getStepOpacity = (step: TastingStep, index: number) => {
    if (index === currentStepIndex) return 1;
    if (step.isCompleted) return 1;
    if (step.status === StepStatus.SKIPPED) return 0.5;
    return 0.7;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressLine}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: index <= currentStepIndex
                      ? HIGColors.systemBlue
                      : HIGColors.systemGray5,
                  },
                ]}
              />
            )}
            <TouchableOpacity
              style={styles.stepContainer}
              onPress={() => step.canRevisit && onStepPress?.(index)}
              disabled={!step.canRevisit}
              activeOpacity={step.canRevisit ? 0.7 : 1}
            >
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: getStepColor(step, index),
                    opacity: getStepOpacity(step, index),
                  },
                  index === currentStepIndex && styles.currentStepDot,
                ]}
              >
                {step.isCompleted && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {step.status === StepStatus.SKIPPED && (
                  <Text style={styles.skipMark}>−</Text>
                )}
                {step.status === StepStatus.REQUIRED && !step.isCompleted && (
                  <Text style={styles.requiredMark}>*</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index === currentStepIndex && styles.currentStepLabel,
                  step.status === StepStatus.SKIPPED && styles.skippedLabel,
                ]}
                numberOfLines={1}
              >
                {step.name}
              </Text>
              {step.canRevisit && step.isCompleted && (
                <Text style={styles.revisitHint}>수정 가능</Text>
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.systemOrange }]} />
          <Text style={styles.legendText}>필수</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.systemGreen }]} />
          <Text style={styles.legendText}>완료</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.systemGray4, opacity: 0.5 }]} />
          <Text style={styles.legendText}>건너뜀</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.white,
  },
  progressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  currentStepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.white,
  },
  connector: {
    position: 'absolute',
    height: 2,
    top: 12,
    left: '50%',
    right: '50%',
  },
  stepLabel: {
    fontSize: 12,
    color: HIGColors.label,
    textAlign: 'center',
    maxWidth: 60,
  },
  currentStepLabel: {
    fontWeight: '600',
    color: HIGColors.systemBlue,
  },
  skippedLabel: {
    color: HIGColors.systemGray4,
    textDecorationLine: 'line-through',
  },
  checkmark: {
    color: HIGColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  skipMark: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  requiredMark: {
    color: HIGColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  revisitHint: {
    fontSize: 10,
    color: HIGColors.systemBlue,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: HIGConstants.SPACING_MD,
    gap: HIGConstants.SPACING_LG,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_XS,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
});