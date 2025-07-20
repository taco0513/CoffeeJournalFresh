import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import RealmService from '../services/realm/RealmService';
import { HIGConstants, HIGColors } from '../styles/common';

export default function DataTestScreen({ navigation }: any) {
  const [recentTastings, setRecentTastings] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get recent tastings
      const tastings = await RealmService.getRecentTastings(10);
      setRecentTastings(tastings);
      
      // Get statistics
      const realmService = RealmService.getInstance();
      const stats = realmService.getStatistics();
      setStatistics(stats);
      
      // console.log('Data loaded:', {
      //   tastingsCount: tastings.length,
      //   statistics: stats,
      // });
    } catch (error) {
      // console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTasting = async (tastingId: string) => {
    try {
      const success = await RealmService.deleteTasting(tastingId);
      if (success) {
        Alert.alert('Success', 'Tasting deleted');
        loadData(); // Reload data
      } else {
        Alert.alert('Error', 'Failed to delete tasting');
      }
    } catch (error) {
      // console.error('Error deleting tasting:', error);
      Alert.alert('Error', 'Failed to delete tasting');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all tastings? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              realmService.clearAllTastings();
              Alert.alert('Success', 'All tastings deleted');
              loadData();
            } catch (error) {
              // console.error('Error clearing all:', error);
              Alert.alert('Error', 'Failed to clear all tastings');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>데이터 테스트</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          {statistics && (
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>
                Total Tastings: {statistics.totalTastings}
              </Text>
              <Text style={styles.statText}>
                Average Score: {statistics.averageScore}
              </Text>
              <Text style={styles.statText}>
                Days Since First: {statistics.firstTastingDays}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Tastings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Tastings ({recentTastings.length})
          </Text>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : recentTastings.length === 0 ? (
            <Text style={styles.emptyText}>No tastings saved yet</Text>
          ) : (
            recentTastings.map((tasting, index) => (
              <View key={tasting.id} style={styles.tastingCard}>
                <View style={styles.tastingInfo}>
                  <Text style={styles.coffeeName}>{tasting.coffeeName}</Text>
                  <Text style={styles.roasteryName}>{tasting.roastery}</Text>
                  <Text style={styles.cafeText}>
                    {tasting.cafeName || 'No cafe'}
                  </Text>
                  <Text style={styles.scoreText}>
                    Score: {tasting.matchScoreTotal}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(tasting.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTasting(tasting.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    fontSize: 24,
    color: HIGColors.systemBlue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
  },
  section: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  statsContainer: {
    backgroundColor: '#E8F5E8',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: HIGColors.systemGreen,
  },
  statText: {
    fontSize: 16,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  tastingCard: {
    backgroundColor: '#FFF8DC',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemOrange,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tastingInfo: {
    flex: 1,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasteryName: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  cafeText: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.systemBrown,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
  },
  deleteButton: {
    backgroundColor: HIGColors.systemRed,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: HIGColors.systemBlue,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: HIGColors.systemRed,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  emptyText: {
    fontSize: 16,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    padding: 20,
  },
});