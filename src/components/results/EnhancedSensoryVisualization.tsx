import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadarChart } from '../charts/RadarChart';
import { BarChart } from '../charts/BarChart';
import { HIGColors, HIGConstants } from '../../styles/common';

interface SensoryData {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  bitterness: number;
  balance: number;
  mouthfeel: string;
}

interface EnhancedSensoryVisualizationProps {
  data: SensoryData;
  comparison?: SensoryData;
  mode?: 'radar' | 'bar';
  title?: string;
  showComparison?: boolean;
}

export const EnhancedSensoryVisualization: React.FC<EnhancedSensoryVisualizationProps> = ({
  data,
  comparison,
  mode = 'radar',
  title = '감각 평가',
  showComparison = false,
}) => {
  const sensoryLabels = {
    body: '바디감',
    acidity: '산미',
    sweetness: '단맛',
    finish: '여운',
    bitterness: '쓴맛',
    balance: '균형감',
  };

  // Prepare data for radar chart
  const radarData = [
    { label: sensoryLabels.body, value: data.body, maxValue: 5 },
    { label: sensoryLabels.acidity, value: data.acidity, maxValue: 5 },
    { label: sensoryLabels.sweetness, value: data.sweetness, maxValue: 5 },
    { label: sensoryLabels.finish, value: data.finish, maxValue: 5 },
    { label: sensoryLabels.bitterness, value: data.bitterness, maxValue: 5 },
    { label: sensoryLabels.balance, value: data.balance, maxValue: 5 },
  ];

  // Prepare data for bar chart
  const barData = radarData.map(item => ({
    label: item.label,
    value: item.value,
    maxValue: 5,
    color: getColorForValue(item.value),
  }));

  // Add comparison data if provided
  const comparisonBarData = comparison ? [
    { label: sensoryLabels.body, value: comparison.body, maxValue: 5, color: HIGColors.systemGray4 },
    { label: sensoryLabels.acidity, value: comparison.acidity, maxValue: 5, color: HIGColors.systemGray4 },
    { label: sensoryLabels.sweetness, value: comparison.sweetness, maxValue: 5, color: HIGColors.systemGray4 },
    { label: sensoryLabels.finish, value: comparison.finish, maxValue: 5, color: HIGColors.systemGray4 },
    { label: sensoryLabels.bitterness, value: comparison.bitterness, maxValue: 5, color: HIGColors.systemGray4 },
    { label: sensoryLabels.balance, value: comparison.balance, maxValue: 5, color: HIGColors.systemGray4 },
  ] : [];

  function getColorForValue(value: number): string {
    if (value >= 4) return HIGColors.systemGreen;
    if (value >= 3) return HIGColors.systemBlue;
    if (value >= 2) return HIGColors.systemOrange;
    return HIGColors.systemRed;
  }

  const centerContent = (
    <View style={styles.centerContent}>
      <Text style={styles.averageText}>
        {((data.body + data.acidity + data.sweetness + data.finish + data.bitterness + data.balance) / 6).toFixed(1)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {mode === 'radar' ? (
        <View style={styles.chartContainer}>
          <RadarChart
            data={radarData}
            size={280}
            color={HIGColors.systemBlue}
            fillOpacity={0.3}
            centerContent={centerContent}
          />
          
          {/* Mouthfeel display */}
          <View style={styles.mouthfeelContainer}>
            <Text style={styles.mouthfeelLabel}>입안 느낌</Text>
            <View style={styles.mouthfeelChip}>
              <Text style={styles.mouthfeelText}>{data.mouthfeel}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.barContainer}>
          {showComparison && comparison ? (
            <View>
              <Text style={styles.comparisonTitle}>내 평가 vs 평균</Text>
              <View style={styles.dualBarContainer}>
                {barData.map((item, index) => (
                  <View key={index} style={styles.dualBarItem}>
                    <Text style={styles.barLabel}>{item.label}</Text>
                    <View style={styles.barPair}>
                      {/* My rating */}
                      <View style={styles.barColumn}>
                        <Text style={styles.barValue}>{item.value}</Text>
                        <View style={[styles.miniBar, { 
                          height: (item.value / 5) * 40,
                          backgroundColor: item.color 
                        }]} />
                        <Text style={styles.barLegend}>내 점수</Text>
                      </View>
                      
                      {/* Average rating */}
                      <View style={styles.barColumn}>
                        <Text style={styles.barValue}>{comparisonBarData[index].value}</Text>
                        <View style={[styles.miniBar, { 
                          height: (comparisonBarData[index].value / 5) * 40,
                          backgroundColor: comparisonBarData[index].color 
                        }]} />
                        <Text style={styles.barLegend}>평균</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <BarChart
              data={barData}
              height={120}
              barWidth={35}
              spacing={12}
              showValues={true}
              showLabels={true}
            />
          )}
          
          {/* Mouthfeel display for bar mode */}
          <View style={styles.mouthfeelContainer}>
            <Text style={styles.mouthfeelLabel}>입안 느낌</Text>
            <View style={styles.mouthfeelChip}>
              <Text style={styles.mouthfeelText}>{data.mouthfeel}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_LG,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_LG,
  },
  chartContainer: {
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  averageText: {
    fontSize: 16,
    fontWeight: '700',
    color: HIGColors.systemBlue,
  },
  mouthfeelContainer: {
    marginTop: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  mouthfeelLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  mouthfeelChip: {
    backgroundColor: HIGColors.systemBlue + '20',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
  },
  mouthfeelText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.systemBlue,
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
    textAlign: 'center',
  },
  dualBarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dualBarItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
    textAlign: 'center',
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  miniBar: {
    width: 16,
    borderRadius: 2,
    marginBottom: 4,
  },
  barLegend: {
    fontSize: 9,
    color: HIGColors.tertiaryLabel,
  },
});