import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import RealmService from '../services/realm/RealmService';
import { Colors } from '../constants/colors';
import { NavigationButton } from '../components/common';

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
      
      console.log('Data loaded:', {
        tastingsCount: tastings.length,
        statistics: stats,
      });
    } catch (error) {
      console.error('Error loading data:', error);
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
      console.error('Error deleting tasting:', error);
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
              console.error('Error clearing all:', error);
              Alert.alert('Error', 'Failed to clear all tastings');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <NavigationButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Data Test</Text>
        <View style={{ width: 60 }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  statsContainer: {
    backgroundColor: Colors.background.white,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tastingCard: {
    backgroundColor: Colors.background.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roasteryName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  cafeText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.PRIMARY,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  deleteButton: {
    backgroundColor: Colors.semantic.error,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: Colors.background.white,
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshButtonText: {
    color: Colors.background.white,
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: Colors.semantic.error,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.background.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: 'center',
    padding: 20,
  },
});