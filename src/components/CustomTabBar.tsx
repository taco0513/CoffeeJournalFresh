import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { View, Text, Button, styled, useTheme } from 'tamagui';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Icon imports removed - using text labels instead

const { width: screenWidth } = Dimensions.get('window');

// Styled Components
const Container = styled(View, {
  name: 'TabBarContainer',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
});

const TabBarWrapper = styled(View, {
  name: 'TabBarWrapper',
  flexDirection: 'row',
  height: 64,
  alignItems: 'center',
});

const TabButton = styled(Button, {
  name: 'TabButton',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: '$xs',
  pressStyle: {
    opacity: 0.7,
},
});

const TabLabel = styled(Text, {
  name: 'TabLabel',
  fontSize: '$2', // 14px - more readable for navigation labels
  marginTop: '$1',
});

const CenterButtonContainer = styled(View, {
  name: 'CenterButtonContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

const CenterButton = styled(Button, {
  name: 'CenterButton',
  position: 'absolute',
  bottom: 10,
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '$cupBrown',
  shadowColor: '$cupBrown',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  pressStyle: {
    opacity: 0.8,
},
});

const CenterButtonInner = styled(View, {
  name: 'CenterButtonInner',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

// Text label component instead of icons
const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const labelMap: { [key: string]: string } = {
    Home: '홈',
    Journal: '기록',
    AddCoffee: '+',
    Achievements: '성과',
    Profile: '프로필',
  };
  
  return (
    <Text 
      style={{
        fontSize: name === 'AddCoffee' ? 28 : 20,
        color,
        fontWeight: focused ? '600' : '400',
      }}
    >
      {labelMap[name] || name}
    </Text>
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Container paddingBottom={insets.bottom}>
      <TabBarWrapper>
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
              <CenterButtonContainer key={index}>
                <CenterButton unstyled onPress={onPress}>
                  <CenterButtonInner>
                    <TabIcon 
                      name={route.name} 
                      focused={true} 
                      color={theme.background.val} 
                    />
                  </CenterButtonInner>
                </CenterButton>
              </CenterButtonContainer>
            );
        }

          return (
            <TabButton key={index} unstyled onPress={onPress}>
              <TabIcon
                name={route.name}
                focused={isFocused}
                color={isFocused ? theme.cupBrown?.val || theme.brown9.val : theme.gray9.val}
              />
              <TabLabel
                color={isFocused ? theme.cupBrown?.val || theme.brown9.val : theme.gray9.val}
              >
                {label as string}
              </TabLabel>
            </TabButton>
          );
      })}
      </TabBarWrapper>
    </Container>
  );
};

