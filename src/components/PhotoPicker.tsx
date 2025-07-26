import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import PhotoService from '../services/PhotoService';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface PhotoPickerProps {
  photoUri?: string;
  onPhotoSelected: (photoUri: string) => void;
  onPhotoRemoved: () => void;
  disabled?: boolean;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photoUri,
  onPhotoSelected,
  onPhotoRemoved,
  disabled = false,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handlePhotoSelect = async () => {
    if (disabled || isSelecting) return;
    
    setIsSelecting(true);
    try {
      const result = await PhotoService.selectPhoto({
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
    });
      
      if (result) {
        onPhotoSelected(result.uri);
    }
  } catch (error) {
      // console.error('Photo selection error:', error);
      Alert.alert('오류', '사진을 선택하는 중 오류가 발생했습니다.');
  } finally {
      setIsSelecting(false);
  }
};

  const handlePhotoRemove = () => {
    Alert.alert(
      '사진 삭제',
      '사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: onPhotoRemoved },
      ]
    );
};

  if (photoUri) {
    return (
      <View style={styles.photoContainer}>
        <Text style={styles.label}>커피 봉지 사진</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handlePhotoRemove}
            disabled={disabled}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.changeButton, disabled && styles.disabledButton]}
          onPress={handlePhotoSelect}
          disabled={disabled || isSelecting}
        >
          <Text style={styles.changeButtonText}>
            {isSelecting ? '선택 중...' : '사진 변경'}
          </Text>
        </TouchableOpacity>
      </View>
    );
}

  return (
    <View style={styles.photoContainer}>
      <Text style={styles.label}>커피 봉지 사진</Text>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.disabledButton]}
        onPress={handlePhotoSelect}
        disabled={disabled || isSelecting}
      >
        <Text style={styles.selectIcon}></Text>
        <Text style={styles.selectText}>
          {isSelecting ? '선택 중...' : '사진 추가'}
        </Text>
        <Text style={styles.selectSubtext}>
          커피 봉지나 메뉴판 사진을 추가하세요
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    marginBottom: 20,
},
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
},
  selectButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.BACKGROUND_GRAY,
    borderStyle: 'dashed',
},
  selectIcon: {
    fontSize: 40,
    marginBottom: 12,
},
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
},
  selectSubtext: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
},
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.BACKGROUND_GRAY,
},
  image: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.BACKGROUND_GRAY,
},
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
},
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
},
  changeButton: {
    backgroundColor: Colors.GRADIENT_BROWN,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
},
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
},
  disabledButton: {
    opacity: 0.6,
},
});

export default PhotoPicker;