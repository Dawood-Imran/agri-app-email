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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-elements';
import CustomHeader from '../../components/CustomHeader';
import * as ImagePicker from 'expo-image-picker';

interface FormData {
  cropType: string;
  affectedPart: string;
  symptoms: string[];
  image?: string;
}

const PlantDiseases = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cropType: '',
    affectedPart: '',
    symptoms: [],
  });

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
    if (!formData.cropType || !formData.affectedPart || formData.symptoms.length === 0) {
      Alert.alert(
        t('Error'),
        t('agribot.plantDiseases.errors.allFieldsRequired'),
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Here you would make the API call to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      Alert.alert(
        t('Success'),
        t('agribot.plantDiseases.success'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        t('Error'),
        t('agribot.plantDiseases.errors.submissionFailed'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader />
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

        {/* Symptoms Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.plantDiseases.symptoms')}</Text>
          <View style={styles.symptomsContainer}>
            {Object.entries(t('agribot.plantDiseases.symptomOptions', { returnObjects: true }))
              .map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.symptomButton,
                    formData.symptoms.includes(key) && styles.symptomButtonSelected,
                  ]}
                  onPress={() => {
                    const symptoms = formData.symptoms.includes(key)
                      ? formData.symptoms.filter(s => s !== key)
                      : [...formData.symptoms, key];
                    setFormData({ ...formData, symptoms });
                  }}
                >
                  <Text
                    style={[
                      styles.symptomText,
                      formData.symptoms.includes(key) && styles.symptomTextSelected,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
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
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  symptomButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  symptomText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  symptomTextSelected: {
    color: 'white',
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
});

export default PlantDiseases; 