// StatsScreen.tsx
// Main stats screen component - now modularized for better build performance

import React, { useEffect, useState, useMemo} from 'react';
import { YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, isUSBetaMarket } from '../../services/i18n/index';
import { TastingService } from '../../services/realm/TastingService';
import { ITastingRecord } from '../../services/realm/schemas';
import { useUserStore } from '../../stores/useUserStore';
import { RealmService } from '../../services/realm/RealmService';

// Modular Components
import {
  Container,
  ContentScrollView,
 } from '../../components/stats/screen';
import { StatsScreenNavigation } from '../../components/stats/screen/StatsScreenNavigation';
import { StatsScreenLoadingState } from '../../components/stats/screen/StatsScreenLoadingState';
import { StatsScreenEmptyState } from '../../components/stats/screen/StatsScreenEmptyState';
import { Logger } from '../../services/LoggingService';
import { StatsScreenContent} from '../../components/stats/screen/StatsScreenContent';

// Interfaces
interface ExtendedStatistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
  cafeCount?: number;
  homeCafeCount?: number;
}

interface TopRoaster {
  name: string;
  count: number;
  avgScore: number;
}

interface TopCoffee {
  name: string;
  roastery: string;
  count: number;
}

interface TopCafe {
  name: string;
  count: number;
  location?: string;
}

interface TastingTrend {
  date: string;
  count: number;
  avgScore: number;
}

interface StatsScreenProps {
  hideNavBar?: boolean;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ hideNavBar = false }) => {
  const { t } = useTranslation();
  const currentUser = useUserStore((state) => state.currentUser);
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExtendedStatistics | null>(null);
  const [topRoasters, setTopRoasters] = useState<TopRoaster[]>([]);
  const [topCoffees, setTopCoffees] = useState<TopCoffee[]>([]);
  const [topCafes, setTopCafes] = useState<TopCafe[]>([]);
  const [tastingTrends, setTastingTrends] = useState<TastingTrend[]>([]);

  // Generate insights based on the stats
  const insights = useMemo(() => {
    if (!stats || stats.totalTastings === 0) {
      // Return example insights for empty state
      return [
        {
          id: 'example-1',
          title: '취향 발견',
          description: '5번의 테이스팅으로 선호하는 맛 프로필을 파악할 수 있어요',
          icon: '🎯',
          type: 'discovery'
      },
        {
          id: 'example-2',
          title: '로스터리 탐험',
          description: '3곳 이상의 로스터리를 방문하여 다양한 스타일을 경험해보세요',
          icon: '🗺️',
          type: 'exploration'
      },
        {
          id: 'example-3',
          title: '성장 추적',
          description: '매주 꾸준한 기록으로 커피 취향의 변화를 관찰할 수 있어요',
          icon: '📈',
          type: 'growth'
      }
      ];
  }

    const insights = [];
    
    // Add real insights based on data
    if (stats.totalTastings >= 10) {
      insights.push({
        id: 'achievement-10',
        title: '커피 애호가',
        description: `${stats.totalTastings}번의 테이스팅을 기록했습니다!`,
        icon: '🏆',
        type: 'achievement'
    });
  }

    if (topRoasters.length >= 3) {
      insights.push({
        id: 'diversity',
        title: '다양한 경험',
        description: `${topRoasters.length}곳의 로스터리를 경험했네요`,
        icon: '🌍',
        type: 'diversity'
    });
  }

    return insights;
}, [stats, topRoasters]);

  const loadTastingTrends = async (): Promise<TastingTrend[]> => {
    try {
      const tastingService = TastingService.getInstance();
      const tastings = await tastingService.getTastingRecords({ 
        isDeleted: false,
        limit: 1000
    });
      
      // Group by month for the last 6 months
      const monthData = new Map<string, { count: number; totalScore: number }>();
      const now = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthData.set(key, { count: 0, totalScore: 0 });
    }
      
      // Count tastings by month
      tastings.forEach((tasting: ITastingRecord) => {
        const date = new Date(tasting.createdAt);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const data = monthData.get(key);
        if (data) {
          data.count++;
          data.totalScore += tasting.matchScoreTotal || 0;
      }
    });
      
      // Convert to array
      return Array.from(monthData.entries()).map(([date, data]) => ({
        date: date.split('-')[1] + '월',
        count: data.count,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0
    }));
  } catch (error) {
      return [];
  }
};

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const realmService = RealmService.getInstance();
      
      // Load basic statistics
      const basicStats = realmService.getStatistics();
      const roasters = realmService.getTopRoasters(3);
      const coffees = realmService.getTopCoffees(3);
      const cafes = realmService.getTopCafes(3);

      // Extend stats with additional properties
      const extendedStats: ExtendedStatistics = {
        ...basicStats,
        firstTastingDays: 0, // Calculate if needed
        cafeCount: cafes.reduce((sum, cafe) => sum + cafe.count, 0),
        homeCafeCount: 0, // Calculate from tasting data if needed
    };
      
      // Load trends
      const trends = await loadTastingTrends();
      
      setStats(extendedStats);
      setTopRoasters(roasters);
      setTopCoffees(coffees);
      setTopCafes(cafes);
      setTastingTrends(trends);
  } catch (error) {
      Logger.error('Failed to load statistics:', 'screen', { component: 'StatsScreen', error: error });
      setStats(null);
  } finally {
      setIsLoading(false);
  }
};

  useEffect(() => {
    loadStatistics();
}, [currentUser]);

  if (isLoading) {
    return (
      <Container>
        <StatsScreenNavigation hideNavBar={hideNavBar} />
        <StatsScreenLoadingState />
      </Container>
    );
}

  if (!stats || stats.totalTastings === 0) {
    return (
      <Container>
        <YStack flex={1}>
          <StatsScreenNavigation hideNavBar={hideNavBar} />
          <ContentScrollView>
            <StatsScreenEmptyState insights={insights} />
          </ContentScrollView>
        </YStack>
      </Container>
    );
}

  return (
    <Container>
      <YStack flex={1}>
        <StatsScreenNavigation hideNavBar={hideNavBar} />
        <ContentScrollView>
          <StatsScreenContent
            stats={stats}
            topRoasters={topRoasters}
            topCafes={topCafes}
            insights={insights}
          />
        </ContentScrollView>
      </YStack>
    </Container>
  );
};

export default StatsScreen;