import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screen components
const HomeScreen = ({ onNavigate }) => (
  <View style={styles.screen}>
    <Text style={styles.title}>Coffee Journal</Text>
    <Text style={styles.subtitle}>Your coffee tasting companion</Text>
    
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

const CoffeeInfoScreen = ({ onNavigate }) => (
  <View style={styles.screen}>
    <Text style={styles.title}>Coffee Information</Text>
    
    <ScrollView style={styles.form}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Coffee Name:</Text>
        <View style={styles.input}>
          <Text style={styles.inputText}>Enter coffee name...</Text>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Roastery:</Text>
        <View style={styles.input}>
          <Text style={styles.inputText}>Enter roastery name...</Text>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Origin:</Text>
        <View style={styles.input}>
          <Text style={styles.inputText}>Enter origin...</Text>
        </View>
      </View>
    </ScrollView>
    
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => onNavigate('FlavorSelection')}
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

const FlavorSelectionScreen = ({ onNavigate }) => (
  <View style={styles.screen}>
    <Text style={styles.title}>Flavor Selection</Text>
    
    <ScrollView style={styles.form}>
      <Text style={styles.subtitle}>Select the flavors you taste:</Text>
      
      <View style={styles.flavorGrid}>
        {['Fruity', 'Nutty', 'Chocolatey', 'Floral', 'Spicy', 'Sweet'].map((flavor) => (
          <TouchableOpacity key={flavor} style={styles.flavorButton}>
            <Text style={styles.flavorText}>{flavor}</Text>
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

const ResultsScreen = ({ onNavigate }) => (
  <View style={styles.screen}>
    <Text style={styles.title}>Tasting Results</Text>
    
    <ScrollView style={styles.form}>
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Your Coffee Profile</Text>
        <Text style={styles.resultText}>• Flavor Notes: Fruity, Nutty</Text>
        <Text style={styles.resultText}>• Body: Medium</Text>
        <Text style={styles.resultText}>• Acidity: High</Text>
        <Text style={styles.resultText}>• Overall Score: 8.5/10</Text>
      </View>
      
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Tasting Notes</Text>
        <Text style={styles.resultText}>A well-balanced coffee with bright acidity and pleasant fruit notes.</Text>
      </View>
    </ScrollView>
    
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => onNavigate('Home')}
      >
        <Text style={styles.buttonText}>New Tasting</Text>
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

const HistoryScreen = ({ onNavigate }) => (
  <View style={styles.screen}>
    <Text style={styles.title}>Tasting History</Text>
    
    <ScrollView style={styles.form}>
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Ethiopian Yirgacheffe</Text>
        <Text style={styles.historyDate}>Today, 2:30 PM</Text>
        <Text style={styles.historyScore}>Score: 8.5/10</Text>
      </View>
      
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Colombian Supremo</Text>
        <Text style={styles.historyDate}>Yesterday, 9:15 AM</Text>
        <Text style={styles.historyScore}>Score: 7.8/10</Text>
      </View>
      
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Guatemalan Antigua</Text>
        <Text style={styles.historyDate}>2 days ago, 3:45 PM</Text>
        <Text style={styles.historyScore}>Score: 8.2/10</Text>
      </View>
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B4513" />
        {renderScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
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
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  },
  inputText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  flavorButton: {
    backgroundColor: '#5D4037',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  flavorText: {
    color: '#F5F5DC',
    fontSize: 14,
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
});

export default App;