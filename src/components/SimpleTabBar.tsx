import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../styles/ios-hig-2024';

// Simple text-based icons for MVP
const getTabIcon = (name: string, focused: boolean) => {
  const icons: { [key: string]: { default: string; focused: string } } = {
    Home: { default: '⌂', focused: '🏠' },
    Journal: { default: '☰', focused: '📖' },
    AddCoffee: { default: '+', focused: '+' },
    Achievements: { default: '☆', focused: '★' },
    Profile: { default: '○', focused: '●' },
};
  
  return icons[name]?.[focused ? 'focused' : 'default'] || '?';
};

export const SimpleTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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
            if (isAddCoffee) {
              // Navigate to TastingFlow for Add Coffee
              navigation.navigate('TastingFlow', { screen: 'ModeSelection' });
          } else {
              navigation.navigate(route.name);
          }
        }
      };

        if (isAddCoffee) {
          // Special center button - floating style
          return (
            <View key={index} style={styles.centerTabContainer}>
              <TouchableOpacity
                onPress={onPress}
                style={styles.floatingButton}
                activeOpacity={0.8}
              >
                <Text style={styles.floatingButtonText}>☕</Text>
                <Text style={styles.plusIcon}>+</Text>
              </TouchableOpacity>
            </View>
          );
      }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.icon,
              isFocused && styles.iconFocused
            ]}>
              {getTabIcon(route.name, isFocused)}
            </Text>
            <Text style={[
              styles.label,
              isFocused && styles.labelFocused
            ]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
    })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: IOSColors.systemBackground,
    borderTopWidth: IOSLayout.borderWidthThin,
    borderTopColor: IOSColors.separator,
    height: IOSLayout.tabBarHeight,
},
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
},
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
},
  icon: {
    fontSize: 22,
    color: IOSColors.secondaryLabel,
    marginBottom: 2,
},
  iconFocused: {
    color: IOSColors.systemBrown,
},
  label: {
    ...IOSTypography.caption2,
    color: IOSColors.secondaryLabel,
},
  labelFocused: {
    color: IOSColors.systemBrown,
},
  floatingButton: {
    position: 'absolute',
    bottom: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: IOSColors.systemBrown,
    alignItems: 'center',
    justifyContent: 'center',
    ...IOSShadows.medium,
},
  floatingButtonText: {
    fontSize: 28,
    color: IOSColors.systemBackground,
},
  plusIcon: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 14,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
},
});