import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

// Minimal line-based icons matching Feather style
export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#000', focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="9 22 9 12 15 12 15 22"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const JournalIcon: React.FC<IconProps> = ({ size = 24, color = '#000', focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5A2.5 2.5 0 016.5 17H20"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <>
        <Line x1="10" y1="8" x2="16" y2="8" stroke={color} strokeWidth={2} />
        <Line x1="10" y1="12" x2="16" y2="12" stroke={color} strokeWidth={2} />
      </>
    )}
  </Svg>
);

export const CoffeeAddIcon: React.FC<IconProps> = ({ size = 32, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Coffee cup */}
    <Path
      d="M8 11h12v9a4 4 0 01-4 4h-4a4 4 0 01-4-4v-9z"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Handle */}
    <Path
      d="M20 11h3a3 3 0 010 6h-3"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Steam lines */}
    <Path
      d="M10 7v-2M14 7v-2M18 7v-2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    {/* Plus symbol */}
    <Circle cx="24" cy="8" r="6" fill={color} />
    <Line x1="24" y1="5" x2="24" y2="11" stroke="#A2845E" strokeWidth={2} strokeLinecap="round" />
    <Line x1="21" y1="8" x2="27" y2="8" stroke="#A2845E" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const AwardsIcon: React.FC<IconProps> = ({ size = 24, color = '#000', focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="7"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <Path
        d="M12 2v6l2 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </Svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ size = 24, color = '#000', focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Alternative minimal geometric icons
export const MinimalHomeIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="2 12 12 2 22 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="5" y="10" width="14" height="12" stroke={color} strokeWidth={2} />
  </Svg>
);

export const MinimalJournalIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth={2} />
    <Line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth={2} />
    <Line x1="8" y1="12" x2="12" y2="12" stroke={color} strokeWidth={2} />
  </Svg>
);