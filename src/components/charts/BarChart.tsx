import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { HIGColors } from '../../styles/common';

interface BarChartData {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  barWidth?: number;
  spacing?: number;
  animationDuration?: number;
  showValues?: boolean;
  showLabels?: boolean;
  maxValue?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 150,
  barWidth = 40,
  spacing = 16,
  animationDuration = 800,
  showValues = true,
  showLabels = true,
  maxValue,
}) => {
  const animatedValues = useRef(
    data.map(() => new Animated.Value(0))
  ).current;
  
  const chartMaxValue = maxValue || Math.max(...data.map(d => d.maxValue || d.value));
  const chartWidth = data.length * barWidth + (data.length - 1) * spacing;
  
  useEffect(() => {
    // Animate all bars
    const animations = animatedValues.map((animValue, index) => 
      Animated.timing(animValue, {
        toValue: data[index].value,
        duration: animationDuration,
        delay: index * 100, // Stagger animation
        useNativeDriver: false,
      })
    );
    
    Animated.parallel(animations).start();
  }, [data, animatedValues, animationDuration]);
  
  return (
    <View style={styles.container}>
      <View style={[styles.chart, { width: chartWidth, height }]}>
        {data.map((item, index) => {
          const animatedHeight = animatedValues[index].interpolate({
            inputRange: [0, chartMaxValue],
            outputRange: [0, height - 20], // Leave space for values
            extrapolate: 'clamp',
          });
          
          const barColor = item.color || HIGColors.systemBlue;
          const leftPosition = index * (barWidth + spacing);
          
          return (
            <View
              key={index}
              style={[
                styles.barContainer,
                {
                  left: leftPosition,
                  width: barWidth,
                  height,
                }
              ]}
            >
              {/* Value text at top */}
              {showValues && (
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {typeof item.value === 'number' ? 
                      (item.value % 1 === 0 ? item.value.toString() : item.value.toFixed(1)) 
                      : item.value}
                  </Text>
                </View>
              )}
              
              {/* Animated bar */}
              <View style={styles.barWrapper}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: animatedHeight,
                      backgroundColor: barColor,
                      width: barWidth,
                    }
                  ]}
                />
              </View>
              
              {/* Label at bottom */}
              {showLabels && (
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText} numberOfLines={2}>
                    {item.label}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  chart: {
    position: 'relative',
  },
  barContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  valueContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 25,
  },
  bar: {
    borderRadius: 4,
    minHeight: 2, // Minimum height for visibility
  },
  labelContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 11,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 12,
  },
});