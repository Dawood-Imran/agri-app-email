import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import MapView from 'react-native-maps';
import { FieldData, useFields } from '../hooks/useFields';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const YieldPrediction = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { fields, loading } = useFields();
  const [wheatFields, setWheatFields] = useState([]);
  const [sowingDate, setSowingDate] = useState(new Date());
  const [soilType, setSoilType] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [previousPredictions] = React.useState([
    { id: 1, date: '2024-03-15', estimate: '2.5 tons/acre', notes: 'Good weather conditions' },
    { id: 2, date: '2024-02-15', estimate: '2.3 tons/acre', notes: 'Moderate rainfall' },
  ]);

  useEffect(() => {
    if (fields) {
      const wheatFieldsData = fields.filter(field => field.cropType === 'Wheat');
      setWheatFields(wheatFieldsData as any);  
    }
  }, [fields]);

  const navigateToFieldDetails = () => {
    router.push('/farmer/FieldDetails');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#61B15A" />
      </View>
    );
  }

  if (wheatFields.length === 0) {
    return (
      <View style={styles.container}>
        
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="sprout-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>{t('No Wheat Fields Found')}</Text>
          <Text style={styles.emptyStateText}>
            {t('Please add wheat field details to make yield predictions')}
          </Text>
          <Button
            title={t('Add Wheat Field')}
            onPress={navigateToFieldDetails}
            buttonStyle={styles.addFieldButton}
            titleStyle={styles.addFieldButtonTitle}
            containerStyle={styles.addFieldButtonContainer}
            icon={
              <MaterialCommunityIcons 
                name="plus" 
                size={24} 
                color="#FFFFFF" 
                style={{ marginRight: 8 }}
              />
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: wheatFields[0]?.latitude || 37.78825 ,
              longitude: wheatFields[0]?.longitude|| -122.4324 ,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>

        {/* Wheat Fields Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('Your Wheat Fields')}</Text>
          <Text style={styles.summaryText}>
            {t('Total Fields')}: {wheatFields.length}
          </Text>
          <Text style={styles.summaryText}>
            {t('Total Area')}: {wheatFields.reduce((sum, field) => sum + Number(field.areaInAcres), 0)} acres
          </Text>
          <Text style={styles.summaryText}>
            {t('Sowing Date')}: {wheatFields[0]?.sowingDate.toLocaleDateString()}
          </Text>
          <Text style={styles.summaryText}>
            {t('Soil Type')}: {wheatFields[0]?.soilType}
          </Text>
          <Text style={styles.summaryText}>
            {t('Latitude')}: {wheatFields[0]?.latitude}
          </Text>
          <Text style={styles.summaryText}>
            {t('Longitude')}: {wheatFields[0]?.longitude}
          </Text>
        </View>

        {/* Days Remaining Section */}
        <View style={styles.daysCard}>
          <Text style={styles.daysLabel}>{t('Days Remaining for Prediction')}</Text>
          <Text style={styles.daysValue}>5 {t('Days Remaining')}</Text>
        </View>

        {/* Make Prediction Button */}
        <Button
          title={t('Make Prediction')}
          onPress={() => {/* Implement prediction logic */}}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          containerStyle={styles.buttonContainer}
        />

        {/* Previous Predictions Section */}
        <View style={styles.predictionsCard}>
          <Text style={styles.sectionTitle}>{t('Previous Predictions')}</Text>
          {previousPredictions.map((prediction) => (
            <View key={prediction.id} style={styles.predictionItem}>
              <Text style={styles.predictionDate}>{prediction.date}</Text>
              <Text style={styles.predictionEstimate}>{prediction.estimate}</Text>
              <Text style={styles.predictionNotes}>{prediction.notes}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFieldButton: {
    backgroundColor: '#61B15A',
    borderRadius: 25,
    paddingHorizontal: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFieldButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFieldButtonContainer: {
    width: '80%',
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.5,
    width: '100%',
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  daysCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#61B15A',
    marginHorizontal: 15,
  },
  daysLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  daysValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFC107',
    borderRadius: 25,
    height: 50,
    marginHorizontal: 15,
  },
  buttonTitle: {
    color: '#1B5E20',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  predictionsCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  predictionItem: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  predictionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  predictionEstimate: {
    fontSize: 18,
    color: '#61B15A',
    marginBottom: 5,
  },
  predictionNotes: {
    fontSize: 14,
    color: '#666',
  },
});

export default YieldPrediction;
