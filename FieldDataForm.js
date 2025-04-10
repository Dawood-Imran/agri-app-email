import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { firebase } from '../firebase/config';

const FieldDataForm = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [fieldData, setFieldData] = useState({
    numberOfFields: '',
    cropType: 'Wheat',
    soilType: 'Loamy',
    sowingDate: new Date(),
    areaInAcres: '',
    latitude: null,
    longitude: null,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const cropTypes = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Sugarcane', 'Other'];
  const soilTypes = ['Loamy', 'Sandy', 'Clay', 'Silt', 'Peaty', 'Chalky', 'Other'];

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setFieldData(prev => ({
            ...prev,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }));
        } catch (error) {
          Alert.alert('Location Error', 'Could not fetch your location.');
        }
      }
      setLocationLoading(false);
    })();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fieldData.sowingDate;
    setShowDatePicker(Platform.OS === 'ios');
    setFieldData({ ...fieldData, sowingDate: currentDate });
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const validateForm = () => {
    if (!fieldData.numberOfFields || !fieldData.areaInAcres) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return false;
    }
    
    if (isNaN(Number(fieldData.numberOfFields)) || isNaN(Number(fieldData.areaInAcres))) {
      Alert.alert('Validation Error', 'Number of fields and area must be numbers.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const data = {
        ...fieldData,
        numberOfFields: Number(fieldData.numberOfFields),
        areaInAcres: Number(fieldData.areaInAcres),
        sowingDate: fieldData.sowingDate.toISOString(),
        createdAt: timestamp,
      };
      
      await firebase.firestore().collection('fields').add(data);
      
      Alert.alert(
        'Success',
        'Field data saved successfully!',
        [
          {
            text: 'View Fields',
            onPress: () => navigation.navigate('FieldDataDisplay'),
          },
          {
            text: 'Add Another',
            onPress: () => {
              setFieldData({
                numberOfFields: '',
                cropType: 'Wheat',
                soilType: 'Loamy',
                sowingDate: new Date(),
                areaInAcres: '',
                latitude: fieldData.latitude,
                longitude: fieldData.longitude,
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save field data. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Field Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Fields*</Text>
          <TextInput
            style={styles.input}
            value={fieldData.numberOfFields}
            onChangeText={(text) => setFieldData({ ...fieldData, numberOfFields: text })}
            placeholder="Enter number of fields"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type of Crop</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fieldData.cropType}
              style={styles.picker}
              onValueChange={(itemValue) => setFieldData({ ...fieldData, cropType: itemValue })}
            >
              {cropTypes.map((crop, index) => (
                <Picker.Item key={index} label={crop} value={crop} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type of Soil</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fieldData.soilType}
              style={styles.picker}
              onValueChange={(itemValue) => setFieldData({ ...fieldData, soilType: itemValue })}
            >
              {soilTypes.map((soil, index) => (
                <Picker.Item key={index} label={soil} value={soil} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sowing Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {formatDate(fieldData.sowingDate)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={fieldData.sowingDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area of Crop (in acres)*</Text>
          <TextInput
            style={styles.input}
            value={fieldData.areaInAcres}
            onChangeText={(text) => setFieldData({ ...fieldData, areaInAcres: text })}
            placeholder="Enter area in acres"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : locationPermission ? (
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                Latitude: {fieldData.latitude ? fieldData.latitude.toFixed(6) : 'N/A'}
              </Text>
              <Text style={styles.locationText}>
                Longitude: {fieldData.longitude ? fieldData.longitude.toFixed(6) : 'N/A'}
              </Text>
            </View>
          ) : (
            <Text style={styles.locationError}>
              Location permission denied. Please enable location services.
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Field Data</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('FieldDataDisplay')}
        >
          <Text style={styles.viewButtonText}>View Saved Fields</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  locationContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  locationError: {
    color: '#D32F2F',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#388E3C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FieldDataForm;