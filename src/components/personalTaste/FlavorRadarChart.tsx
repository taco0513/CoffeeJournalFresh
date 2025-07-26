import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { HIGColors, HIGConstants } from '@/styles/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = SCREEN_WIDTH - HIGConstants.SPACING_LG * 4;
const CENTER = CHART_SIZE / 2;
const RADIUS = CHART_SIZE / 2 - 40;
const LEVELS = 5;

interface FlavorRadarChartProps {
  preferences: {
    fruity: number;
    floral: number;
    sweet: number;
    nutty: number;
    chocolate: number;
    spices: number;
};
  interactive?: boolean;
  showComparison?: boolean;
  comparisonData?: {
    fruity: number;
    floral: number;
    sweet: number;
    nutty: number;
    chocolate: number;
    spices: number;
};
  onFlavorTap?: (flavor: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const FlavorRadarChart: React.FC<FlavorRadarChartProps> = ({
  preferences,
  interactive = false,
  showComparison = false,
  comparisonData,
  onFlavorTap,
  style,
}) => {
  const categories = [
    { key: 'fruity', label: 'Fruity', emoji: '', color: '#FF6B6B' },
    { key: 'floral', label: 'Floral', emoji: '', color: '#C06CC6' },
    { key: 'sweet', label: 'Sweet', emoji: '', color: '#FFA94D' },
    { key: 'nutty', label: 'Nutty', emoji: '', color: '#8B6F47' },
    { key: 'chocolate', label: 'Chocolate', emoji: '', color: '#6F4E37' },
    { key: 'spices', label: 'Spices', emoji: '', color: '#FF4757' },
  ];


  // Calculate angle for each category
  const angleStep = (Math.PI * 2) / categories.length;

  // Get coordinates for a point
  const getCoordinate = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const normalizedValue = Math.min(Math.max(value, 0), 1); // Ensure 0-1 range
    const r = RADIUS * normalizedValue;
    return {
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
  };
};

  // Create polygon points
  const createPolygonPoints = (data: typeof preferences) => {
    return categories
      .map((cat, index) => {
        const coord = getCoordinate(data[cat.key as keyof typeof data], index);
        return `${coord.x},${coord.y}`;
    })
      .join(' ');
};

  // Draw grid lines
  const renderGrid = () => {
    const lines = [];
    
    // Concentric circles
    for (let i = 1; i <= LEVELS; i++) {
      const r = (RADIUS / LEVELS) * i;
      lines.push(
        <Circle
          key={`circle-${i}`}
          cx={CENTER}
          cy={CENTER}
          r={r}
          fill="none"
          stroke={HIGColors.gray5}
          strokeWidth={1}
          opacity={0.5}
        />
      );
  }

    // Radial lines
    categories.forEach((_, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);
      lines.push(
        <Line
          key={`line-${index}`}
          x1={CENTER}
          y1={CENTER}
          x2={x}
          y2={y}
          stroke={HIGColors.gray5}
          strokeWidth={1}
          opacity={0.5}
        />
      );
  });

    return lines;
};

  // Render category labels
  const renderLabels = () => {
    return categories.map((cat, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const labelRadius = RADIUS + 30;
      const x = CENTER + labelRadius * Math.cos(angle);
      const y = CENTER + labelRadius * Math.sin(angle);

      const handlePress = () => {
        if (interactive && onFlavorTap) {
          onFlavorTap(cat.key);
      }
    };

      return (
        <G key={`label-${cat.key}`}>
          {interactive ? (
            <TouchableOpacity
              style={[styles.labelContainer, { left: x - 30, top: y - 20 }]}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <Text style={styles.labelEmoji}>{cat.emoji}</Text>
              <Text style={[styles.labelText, { color: cat.color }]}>
                {cat.label}
              </Text>
              <Text style={styles.labelValue}>
                {Math.round(preferences[cat.key as keyof typeof preferences] * 100)}%
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.labelContainer, { left: x - 30, top: y - 20 }]}>
              <Text style={styles.labelEmoji}>{cat.emoji}</Text>
              <Text style={[styles.labelText, { color: cat.color }]}>
                {cat.label}
              </Text>
              <Text style={styles.labelValue}>
                {Math.round(preferences[cat.key as keyof typeof preferences] * 100)}%
              </Text>
            </View>
          )}
        </G>
      );
  });
};

  const userPolygonPoints = createPolygonPoints(preferences);
  const comparisonPolygonPoints = showComparison && comparisonData
    ? createPolygonPoints(comparisonData)
    : '';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} style={styles.svg}>
          {/* Grid */}
          {renderGrid()}

          {/* Comparison polygon (if enabled) */}
          {showComparison && comparisonPolygonPoints && (
            <Polygon
              points={comparisonPolygonPoints}
              fill={HIGColors.gray}
              fillOpacity={0.2}
              stroke={HIGColors.gray}
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}

          {/* User polygon */}
          <Polygon
            points={userPolygonPoints}
            fill={HIGColors.accent}
            fillOpacity={0.3}
            stroke={HIGColors.accent}
            strokeWidth={3}
          />

          {/* Data points */}
          {categories.map((cat, index) => {
            const coord = getCoordinate(
              preferences[cat.key as keyof typeof preferences],
              index
            );
            return (
              <Circle
                key={`point-${cat.key}`}
                cx={coord.x}
                cy={coord.y}
                r={6}
                fill={HIGColors.accent}
                stroke={HIGColors.white}
                strokeWidth={2}
              />
            );
        })}
        </Svg>

        {/* Labels */}
        {renderLabels()}
      </View>

      {/* Legend */}
      {showComparison && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: HIGColors.accent }]} />
            <Text style={styles.legendText}>나의 선호도</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { 
              backgroundColor: HIGColors.gray,
              borderStyle: 'dashed',
          }]} />
            <Text style={styles.legendText}>평균 선호도</Text>
          </View>
        </View>
      )}

      {/* Interactive hint */}
      {interactive && (
        <Text style={styles.hint}>각 향미를 탭하여 자세히 보기</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_MD,
},
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    position: 'relative',
},
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
},
  labelContainer: {
    position: 'absolute',
    width: 60,
    alignItems: 'center',
},
  labelEmoji: {
    fontSize: 24,
    marginBottom: 2,
},
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
},
  labelValue: {
    fontSize: 11,
    color: HIGColors.secondaryLabel,
},
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: HIGConstants.SPACING_LG,
    marginTop: HIGConstants.SPACING_MD,
},
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_XS,
},
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 2,
},
  legendText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
},
  hint: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    fontStyle: 'italic',
    marginTop: HIGConstants.SPACING_SM,
},
});