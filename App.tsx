import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useSimpleCoffeeStore } from './src/stores/useSimpleCoffeeStore';

// Screen components
const HomeScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const { tastingSessions } = useSimpleCoffeeStore();
  
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Coffee Journal</Text>
      <Text style={styles.subtitle}>Your coffee tasting companion</Text>
      <Text style={styles.statsText}>Total tastings: {tastingSessions.length}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => onNavigate('CoffeeInfo')}
        >
          <Text style={styles.buttonText}>Start New Tasting</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => onNavigate('History')}
        >
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CoffeeInfoScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const { currentTasting, updateCurrentTasting } = useSimpleCoffeeStore();

  const handleNext = () => {
    if (!currentTasting.coffeeName || !currentTasting.roastery || !currentTasting.origin) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    onNavigate('FlavorSelection');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Coffee Information</Text>
      
      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Coffee Name: *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter coffee name..."
            placeholderTextColor="#A0A0A0"
            value={currentTasting.coffeeName}
            onChangeText={(text) => updateCurrentTasting('coffeeName', text)}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Roastery: *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter roastery name..."
            placeholderTextColor="#A0A0A0"
            value={currentTasting.roastery}
            onChangeText={(text) => updateCurrentTasting('roastery', text)}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Origin: *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter origin..."
            placeholderTextColor="#A0A0A0"
            value={currentTasting.origin}
            onChangeText={(text) => updateCurrentTasting('origin', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Brew Method:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Pour Over, French Press..."
            placeholderTextColor="#A0A0A0"
            value={currentTasting.brewMethod}
            onChangeText={(text) => updateCurrentTasting('brewMethod', text)}
          />
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next: Flavor Selection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => onNavigate('Home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FlavorSelectionScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const { currentTasting, updateCurrentTasting } = useSimpleCoffeeStore();
  const flavors = ['Fruity', 'Nutty', 'Chocolatey', 'Floral', 'Spicy', 'Sweet', 
                   'Citrus', 'Berry', 'Caramel', 'Vanilla', 'Woody', 'Earthy'];
  
  const toggleFlavor = (flavor: string) => {
    const currentFlavors = currentTasting.flavors || [];
    const newFlavors = currentFlavors.includes(flavor) 
      ? currentFlavors.filter(f => f !== flavor)
      : [...currentFlavors, flavor];
    updateCurrentTasting('flavors', newFlavors);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Flavor Selection</Text>
      
      <ScrollView style={styles.form}>
        <Text style={styles.subtitle}>Select the flavors you taste:</Text>
        
        <View style={styles.flavorGrid}>
          {flavors.map((flavor) => (
            <TouchableOpacity 
              key={flavor} 
              style={[
                styles.flavorButton,
                currentTasting.flavors?.includes(flavor) && styles.flavorButtonSelected
              ]}
              onPress={() => toggleFlavor(flavor)}
            >
              <Text style={[
                styles.flavorText,
                currentTasting.flavors?.includes(flavor) && styles.flavorTextSelected
              ]}>{flavor}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => onNavigate('Results')}
        >
          <Text style={styles.buttonText}>View Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => onNavigate('CoffeeInfo')}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ResultsScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const { currentTasting, saveTasting } = useSimpleCoffeeStore();
  
  const handleSave = () => {
    saveTasting();
    Alert.alert('Success', 'Tasting saved successfully!', [
      { text: 'OK', onPress: () => onNavigate('Home') }
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Tasting Results</Text>
      
      <ScrollView style={styles.form}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Coffee: {currentTasting.coffeeName}</Text>
          <Text style={styles.resultText}>Roastery: {currentTasting.roastery}</Text>
          <Text style={styles.resultText}>Origin: {currentTasting.origin}</Text>
          {currentTasting.brewMethod && (
            <Text style={styles.resultText}>Brew Method: {currentTasting.brewMethod}</Text>
          )}
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Flavor Profile</Text>
          <Text style={styles.resultText}>
            {currentTasting.flavors?.length ? currentTasting.flavors.join(', ') : 'No flavors selected'}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save Tasting</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => onNavigate('Home')}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HistoryScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const { tastingSessions } = useSimpleCoffeeStore();
  
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Tasting History</Text>
      
      <ScrollView style={styles.form}>
        {tastingSessions.length === 0 ? (
          <Text style={styles.emptyText}>No tastings yet. Start your first tasting!</Text>
        ) : (
          tastingSessions.map((session, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.historyTitle}>{session.coffeeName}</Text>
              <Text style={styles.historyDate}>{session.roastery}</Text>
              <Text style={styles.historyScore}>
                {new Date(session.createdAt).toLocaleDateString()}
              </Text>
              {session.flavors.length > 0 && (
                <Text style={styles.historyScore}>Flavors: {session.flavors.join(', ')}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => onNavigate('Home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main App component
function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState('Home');
  
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'CoffeeInfo':
        return <CoffeeInfoScreen onNavigate={setCurrentScreen} />;
      case 'FlavorSelection':
        return <FlavorSelectionScreen onNavigate={setCurrentScreen} />;
      case 'Results':
        return <ResultsScreen onNavigate={setCurrentScreen} />;
      case 'History':
        return <HistoryScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B4513" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
  screen: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5F5DC',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#D2B48C',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsText: {
    fontSize: 14,
    color: '#D2B48C',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#5D4037',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F5DC',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#D2B48C',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#3E2723',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5D4037',
    color: '#F5F5DC',
    fontSize: 16,
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  flavorButton: {
    backgroundColor: '#5D4037',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    margin: 5,
  },
  flavorButtonSelected: {
    backgroundColor: '#8B4513',
  },
  flavorText: {
    color: '#F5F5DC',
    fontSize: 14,
  },
  flavorTextSelected: {
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#3E2723',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#5D4037',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5F5DC',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#D2B48C',
    marginBottom: 5,
  },
  historyCard: {
    backgroundColor: '#3E2723',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#5D4037',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5F5DC',
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  historyScore: {
    fontSize: 14,
    color: '#D2B48C',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default App;