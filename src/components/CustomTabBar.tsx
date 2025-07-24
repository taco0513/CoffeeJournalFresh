import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../styles/ios-hig-2024';
import {
  HomeIcon,
  JournalIcon,
  CoffeeAddIcon,
  AwardsIcon,
  ProfileIcon,
} from './icons/TabIcons';

const { width: screenWidth } = Dimensions.get('window');

// Icon component with minimal design
const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const iconSize = 24;
  
  switch (name) {
    case 'Home':
      return <HomeIcon size={iconSize} color={color} focused={focused} />;
    case 'Journal':
      return <JournalIcon size={iconSize} color={color} focused={focused} />;
    case 'AddCoffee':
      return <CoffeeAddIcon size={28} color={color} />;
    case 'Achievements':
      return <AwardsIcon size={iconSize} color={color} focused={focused} />;
    case 'Profile':
      return <ProfileIcon size={iconSize} color={color} focused={focused} />;
    default:
      return null;
  }
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const isAddCoffee = route.name === 'AddCoffee';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isAddCoffee) {
            // Special center button
            return (
              <View key={index} style={styles.centerButtonContainer}>
                <TouchableOpacity
                  onPress={onPress}
                  style={styles.centerButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.centerButtonInner}>
                    <TabIcon 
                      name={route.name} 
                      focused={true} 
                      color={IOSColors.systemBackground} 
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <TabIcon
                name={route.name}
                focused={isFocused}
                color={isFocused ? IOSColors.systemBrown : IOSColors.secondaryLabel}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? IOSColors.systemBrown : IOSColors.secondaryLabel },
                ]}
              >
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOSColors.systemBackground,
    borderTopWidth: IOSLayout.borderWidthThin,
    borderTopColor: IOSColors.separator,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: IOSLayout.tabBarHeight,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: IOSSpacing.xs,
  },
  tabLabel: {
    ...IOSTypography.caption2,
    marginTop: IOSSpacing.xxxs,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 10,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: IOSColors.systemBrown,
    ...IOSShadows.large,
    ...Platform.select({
      ios: {
        shadowColor: IOSColors.systemBrown,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
  },
});