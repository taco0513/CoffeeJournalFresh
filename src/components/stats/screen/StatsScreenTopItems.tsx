// StatsScreenTopItems.tsx
// Top items sections (roasters, cafes, etc.)

import React from 'react';
import { View, AnimatePresence, YStack } from 'tamagui';
import { getCurrentLanguage, isUSBetaMarket } from '../../../services/i18n/index';
import {
  Section,
  SectionTitle,
  TopItemsContainer,
  TopItemCard,
  TopItemHeader,
  TopItemName,
  TopItemCount,
  TopItemSubtext,
} from './StatsScreenStyledComponents';

interface TopRoaster {
  name: string;
  count: number;
  avgScore: number;
}

interface TopCafe {
  name: string;
  count: number;
  location?: string;
}

interface StatsScreenTopItemsProps {
  topRoasters: TopRoaster[];
  topCafes: TopCafe[];
}

export const StatsScreenTopItems: React.FC<StatsScreenTopItemsProps> = ({
  topRoasters,
  topCafes,
}) => {
  const currentLanguage = getCurrentLanguage();
  const isUSMarket = isUSBetaMarket();

  return (
    <>
      {/* Top Roasters */}
      {topRoasters.length > 0 && (
        <Section
          animation="lazy"
          enterStyle={{
            opacity: 0,
            y: 30,
        }}
          animateOnly={['opacity', 'transform']}
        >
          <SectionTitle>자주 마신 로스터리</SectionTitle>
          <TopItemsContainer>
            <AnimatePresence>
              {topRoasters.map((roaster, index) => {
                const uniqueKey = `top-roaster-${index}-${roaster.name || 'no-name'}-${roaster.count || 0}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                return (
                  <React.Fragment key={uniqueKey}>
                    <View
                      animation="lazy"
                      enterStyle={{
                        opacity: 0,
                        x: -30,
                      }}
                      animateOnly={['opacity', 'transform']}
                    >
                      <TopItemCard>
                        <TopItemHeader>
                          <TopItemName>{roaster.name}</TopItemName>
                          <TopItemCount>{roaster.count}회</TopItemCount>
                        </TopItemHeader>
                        <TopItemSubtext>평균 점수: {roaster.avgScore.toFixed(1)}</TopItemSubtext>
                      </TopItemCard>
                    </View>
                    {index < topRoasters.length - 1 && (
                      <YStack 
                        height={1} 
                        backgroundColor="$gray5" 
                        marginVertical="$sm"
                        marginHorizontal="$md"
                      />
                    )}
                  </React.Fragment>
                );
            })}
            </AnimatePresence>
          </TopItemsContainer>
        </Section>
      )}

      {/* Top Cafes */}
      {topCafes.length > 0 && (
        <Section
          animation="lazy"
          enterStyle={{
            opacity: 0,
            y: 30,
        }}
          animateOnly={['opacity', 'transform']}
        >
          <SectionTitle>자주 방문한 카페</SectionTitle>
          <TopItemsContainer>
            <AnimatePresence>
              {topCafes.map((cafe, index) => {
                const uniqueKey = `top-cafe-${index}-${cafe.name || 'no-name'}-${cafe.count || 0}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                return (
                  <React.Fragment key={uniqueKey}>
                    <View
                      animation="lazy"
                      enterStyle={{
                        opacity: 0,
                        x: -30,
                      }}
                      animateOnly={['opacity', 'transform']}
                    >
                      <TopItemCard>
                        <TopItemHeader>
                          <TopItemName>{cafe.name}</TopItemName>
                          <TopItemCount>{cafe.count}회</TopItemCount>
                        </TopItemHeader>
                        {cafe.location && (
                          <TopItemSubtext>{cafe.location}</TopItemSubtext>
                        )}
                      </TopItemCard>
                    </View>
                    {index < topCafes.length - 1 && (
                      <YStack 
                        height={1} 
                        backgroundColor="$gray5" 
                        marginVertical="$sm"
                        marginHorizontal="$md"
                      />
                    )}
                  </React.Fragment>
                );
            })}
            </AnimatePresence>
          </TopItemsContainer>
        </Section>
      )}
    </>
  );
};