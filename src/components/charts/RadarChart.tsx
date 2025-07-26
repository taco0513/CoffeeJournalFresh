import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Text as SvgText, Line, Path } from 'react-native-svg';
import { HIGColors } from '../../styles/common';

interface RadarChartProps {
  data: {
    label: string;
    value: number; // 0-5 scale
    maxValue?: number;
}[];
  size?: number;
  strokeWidth?: number;
  fillOpacity?: number;
  color?: string;
  backgroundColor?: string;
  showLabels?: boolean;
  centerContent?: React.ReactNode;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 200,
  strokeWidth = 2,
  fillOpacity = 0.3,
  color = HIGColors.systemBlue,
  backgroundColor = HIGColors.systemGray6,
  showLabels = true,
  centerContent,
}) => {
  const center = size / 2;
  const radius = (size - 80) / 2; // Leave space for labels
  const maxValue = data[0]?.maxValue || 5;
  
  // Calculate points for each data item
  const calculatePoint = (value: number, index: number) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2; // Start from top
    const normalizedValue = Math.min(value / maxValue, 1); // Normalize to 0-1
    const pointRadius = radius * normalizedValue;
    
    return {
      x: center + Math.cos(angle) * pointRadius,
      y: center + Math.sin(angle) * pointRadius,
  };
};
  
  // Calculate label positions
  const calculateLabelPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const labelRadius = radius + 25;
    
    return {
      x: center + Math.cos(angle) * labelRadius,
      y: center + Math.sin(angle) * labelRadius,
  };
};
  
  // Create polygon points string
  const polygonPoints = data.map((_, index) => {
    const point = calculatePoint(data[index].value, index);
    return `${point.x},${point.y}`;
}).join(' ');
  
  // Create background grid (concentric polygons)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background grid */}
        {gridLevels.map((level, levelIndex) => {
          const gridPoints = data.map((_, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            const gridRadius = radius * level;
            return `${center + Math.cos(angle) * gridRadius},${center + Math.sin(angle) * gridRadius}`;
        }).join(' ');
          
          return (
            <Polygon
              key={levelIndex}
              points={gridPoints}
              fill="none"
              stroke={backgroundColor}
              strokeWidth={1}
              opacity={0.5}
            />
          );
      })}
        
        {/* Grid lines from center to vertices */}
        {data.map((_, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const endX = center + Math.cos(angle) * radius;
          const endY = center + Math.sin(angle) * radius;
          
          return (
            <Line
              key={index}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke={backgroundColor}
              strokeWidth={1}
              opacity={0.5}
            />
          );
      })}
        
        {/* Data polygon */}
        <Polygon
          points={polygonPoints}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const point = calculatePoint(item.value, index);
          return (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
              stroke={HIGColors.systemBackground}
              strokeWidth={2}
            />
          );
      })}
        
        {/* Labels */}
        {showLabels && data.map((item, index) => {
          const labelPoint = calculateLabelPoint(index);
          return (
            <SvgText
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="12"
              fill={HIGColors.label}
              fontWeight="500"
            >
              {item.label}
            </SvgText>
          );
      })}
        
        {/* Center circle for content */}
        {centerContent && (
          <Circle
            cx={center}
            cy={center}
            r={30}
            fill={HIGColors.systemBackground}
            stroke={backgroundColor}
            strokeWidth={1}
          />
        )}
      </Svg>
      
      {/* Center content overlay */}
      {centerContent && (
        <View style={[styles.centerContent, { 
          left: center - 30, 
          top: center - 15,
          width: 60,
          height: 30,
      }]}>
          {centerContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
},
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
},
});