import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-elements';
import CustomHeader from '../../components/CustomHeader';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Update API URL to use your machine's IP address instead of localhost
const API_BASE_URL = 'http://192.168.1.5:8000'; // Replace with your machine's IP address

interface FormData {
  cropType: string;
  affectedPart: string;
  farmerObservation: string;
  image?: string;
  language: string;
  soilType: string;
  growthStage: string;
}

interface DiseaseResult {
  disease_name: string;
  description: string;
  disease_management: string[];
  preventive_measures: string[];
  local_context: string[];
}

const PlantDiseases = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cropType: '',
    affectedPart: '',
    farmerObservation: '',
    language: i18n.language || 'English',
    soilType: 'Loamy',
    growthStage: 'Mature',
  });
  const [diseaseResult, setDiseaseResult] = useState<DiseaseResult | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!formData.cropType || !formData.affectedPart || !formData.farmerObservation || !formData.image) {
      Alert.alert(
        t('Error'),
        t('agribot.plantDiseases.errors.allFieldsRequired'),
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Create a form data object to send to the API
      const apiFormData = new FormData();
      
      // Add the image file
      const fileInfo = await FileSystem.getInfoAsync(formData.image);
      if (fileInfo.exists) {
        const fileNameParts = formData.image.split('/');
        const fileName = fileNameParts[fileNameParts.length - 1];
        
        // Get the file extension
        const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        const fileType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        
        apiFormData.append('image', {
          uri: formData.image,
          name: fileName,
          type: fileType,
        } as any);
      } else {
        throw new Error('Selected image file does not exist');
      }
      
      // Add other form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && value) {
          apiFormData.append(key, value);
        }
      });

      console.log('Sending request to:', `${API_BASE_URL}/identify-disease`);
      
      // Make the API call
      const response = await fetch(`${API_BASE_URL}/identify-disease`, {
        method: 'POST',
        body: apiFormData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
        throw new Error(errorData.detail);
      }

      const result = await response.json();
      setDiseaseResult(result);
      setResultModalVisible(true);
      
    } catch (error: unknown) {
      console.error('API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert(
        t('Error'),
        t('agribot.plantDiseases.errors.submissionFailed') + `: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderResultModal = () => {
    if (!diseaseResult) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={resultModalVisible}
        onRequestClose={() => setResultModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{diseaseResult.disease_name}</Text>
          
          <Text style={styles.sectionTitle}>{t('agribot.plantDiseases.results.description')}</Text>
          <Text style={styles.descriptionText}>{diseaseResult.description}</Text>
          
          <Text style={styles.sectionTitle}>{t('agribot.plantDiseases.results.diseaseManagement')}</Text>
          {diseaseResult.disease_management.map((item, index) => (
            <Text key={`management-${index}`} style={styles.listItem}>• {item}</Text>
          ))}
          
          <Text style={styles.sectionTitle}>{t('agribot.plantDiseases.results.preventiveMeasures')}</Text>
          {diseaseResult.preventive_measures.map((item, index) => (
            <Text key={`preventive-${index}`} style={styles.listItem}>• {item}</Text>
          ))}
          
          <Text style={styles.sectionTitle}>{t('agribot.plantDiseases.results.localContext')}</Text>
          {diseaseResult.local_context.map((item, index) => (
            <Text key={`local-${index}`} style={styles.listItem}>• {item}</Text>
          ))}
          
          <Button
            title={t('agribot.plantDiseases.results.close')}
            onPress={() => setResultModalVisible(false)}
            buttonStyle={styles.closeButton}
            containerStyle={styles.closeButtonContainer}
          />
        </ScrollView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('agribot.plantDiseases.title')}</Text>
        
        {/* Crop Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.plantDiseases.cropType')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.cropType}
              onValueChange={(value) => setFormData({ ...formData, cropType: value })}
              style={styles.picker}
            >
              <Picker.Item 
                label={t('agribot.plantDiseases.selectCrop')} 
                value="" 
              />
              {Object.entries(t('agribot.plantDiseases.cropOptions', { returnObjects: true }))
                .map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
          </View>
        </View>

        {/* Affected Part Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.plantDiseases.affectedPart')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.affectedPart}
              onValueChange={(value) => setFormData({ ...formData, affectedPart: value })}
              style={styles.picker}
            >
              <Picker.Item 
                label={t('agribot.plantDiseases.selectPart')} 
                value="" 
              />
              {Object.entries(t('agribot.plantDiseases.affectedPartOptions', { returnObjects: true }))
                .map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
          </View>
        </View>

        {/* Farmer Observation */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.plantDiseases.farmerObservation')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('agribot.plantDiseases.farmerObservationPlaceholder')}
            value={formData.farmerObservation}
            onChangeText={(text) => setFormData({ ...formData, farmerObservation: text })}
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Language Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.plantDiseases.language')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
              style={styles.picker}
            >
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Urdu" value="Urdu" />
              <Picker.Item label="Punjabi" value="Punjabi" />
            </Picker>
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.plantDiseases.uploadImage')}</Text>
          <TouchableOpacity 
            style={styles.imageUploadButton} 
            onPress={handleImagePick}
          >
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                style={styles.previewImage} 
              />
            ) : (
              <Text style={styles.imageUploadText}>+ Add Photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          title={loading ? t('agribot.loading') : t('agribot.submit')}
          onPress={handleSubmit}
          disabled={loading}
          buttonStyle={styles.submitButton}
          titleStyle={styles.submitButtonText}
          containerStyle={styles.submitButtonContainer}
        />
        {loading && <ActivityIndicator style={styles.loader} color="#4CAF50" />}
      </ScrollView>
      
      {renderResultModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  picker: {
    height: 50,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageUploadButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageUploadText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#FFC107',
    borderRadius: 25,
    height: 50,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonContainer: {
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  modalContent: {
    padding: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 10,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    height: 50,
    marginTop: 30,
  },
  closeButtonContainer: {
    marginBottom: 40,
  },
});

export default PlantDiseases;