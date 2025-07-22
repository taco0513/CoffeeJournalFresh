import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
// import { ParsedCoffeeInfo } from '../services/OCRService'; // Moved to feature_backlog
import { Colors } from '../constants/colors';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onTextRecognized?: (info: any) => void; // OCR functionality moved to feature_backlog
}

const CameraModal: React.FC<CameraModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.message}>Camera temporarily unavailable</Text>
          <Text style={styles.submessage}>
            Vision Camera is being updated for compatibility with React Native 0.80.1
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  submessage: {
    color: Colors.PLACEHOLDER,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CameraModal;