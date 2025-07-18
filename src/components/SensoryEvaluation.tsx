import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';

interface SensoryScore {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
}

interface SensoryEvaluationProps {
  scores: SensoryScore;
  onScoreChange: (attribute: keyof SensoryScore, value: number) => void;
}

const SensoryEvaluation: React.FC<SensoryEvaluationProps> = ({
  scores,
  onScoreChange,
}) => {
  const attributes = [
    {
      key: 'body' as keyof SensoryScore,
      label: 'Body',
      labelKo: '바디감',
      lowLabel: 'Light',
      lowLabelKo: '가벼움',
      highLabel: 'Heavy',
      highLabelKo: '무거움',
      description: 'The weight or thickness of the coffee on your palate',
      descriptionKo: '입안에서 느껴지는 커피의 무게감이나 질감',
    },
    {
      key: 'acidity' as keyof SensoryScore,
      label: 'Acidity',
      labelKo: '산미',
      lowLabel: 'Low',
      lowLabelKo: '약함',
      highLabel: 'High',
      highLabelKo: '강함',
      description: 'The bright, tangy, or sharp quality',
      descriptionKo: '밝고 톡 쏘는 듯한 신맛의 정도',
    },
    {
      key: 'sweetness' as keyof SensoryScore,
      label: 'Sweetness',
      labelKo: '단맛',
      lowLabel: 'Low',
      lowLabelKo: '약함',
      highLabel: 'High',
      highLabelKo: '강함',
      description: 'The level of sweetness perceived',
      descriptionKo: '느껴지는 단맛의 정도',
    },
    {
      key: 'finish' as keyof SensoryScore,
      label: 'Finish',
      labelKo: '여운',
      lowLabel: 'Short',
      lowLabelKo: '짧음',
      highLabel: 'Long',
      highLabelKo: '길음',
      description: 'How long the flavor lingers after swallowing',
      descriptionKo: '커피를 삼킨 후 맛이 지속되는 시간',
    },
  ];

  const getScoreColor = (score: number): string => {
    if (score <= 2) return '#FF6B6B'; // Red for low scores
    if (score <= 3) return '#FFA07A'; // Orange for medium-low
    if (score <= 4) return '#FFD93D'; // Yellow for medium
    return '#95E1D3'; // Green for high scores
  };

  const getScoreLabel = (score: number): string => {
    const labels = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return labels[Math.round(score)];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensory Evaluation</Text>
      <Text style={styles.subtitle}>감각 평가</Text>

      {attributes.map((attr) => (
        <View key={attr.key} style={styles.attributeContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.attributeLabel}>{attr.label}</Text>
            <Text style={styles.attributeLabelKo}>{attr.labelKo}</Text>
            <Text style={styles.scoreValue}>{scores[attr.key].toFixed(1)}</Text>
          </View>

          <Text style={styles.description}>{attr.description}</Text>
          <Text style={styles.descriptionKo}>{attr.descriptionKo}</Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{attr.lowLabel}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              value={scores[attr.key]}
              onValueChange={(value: number) => onScoreChange(attr.key, value)}
              minimumTrackTintColor={getScoreColor(scores[attr.key])}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#8B4513"
              step={0.5}
            />
            <Text style={styles.sliderLabel}>{attr.highLabel}</Text>
          </View>

          <View style={styles.scoreIndicator}>
            <Text style={[styles.scoreLabel, { color: getScoreColor(scores[attr.key]) }]}>
              {getScoreLabel(scores[attr.key])}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Overall Profile</Text>
        <View style={styles.summaryScores}>
          {attributes.map((attr) => (
            <View key={attr.key} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{attr.labelKo}</Text>
              <View style={[styles.summaryBar, { backgroundColor: getScoreColor(scores[attr.key]) }]}>
                <Text style={styles.summaryValue}>{scores[attr.key].toFixed(1)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  attributeContainer: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attributeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  attributeLabelKo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 10,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B4513',
    marginLeft: 'auto',
  },
  description: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 2,
  },
  descriptionKo: {
    fontSize: 11,
    color: '#95A5A6',
    marginBottom: 15,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 50,
  },
  scoreIndicator: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  summaryBar: {
    width: 60,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SensoryEvaluation;