import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FieldData, useFields } from '../hooks/useFields';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from '../components/Toast';
import { getAuth } from 'firebase/auth';

interface YieldPredictionData {
  fieldSize: number;
  cropType: string;
  sowingDate: Date;
  latitude: number;
  longitude: number;
  daysRemaining: number;
  currentRound: number;
  predictedYield: number;
  predictionHistory: {
    round: number;
    date: Date;
    predictedYield: number;
    weatherConditions: string;
    yieldChange: 'Increased' | 'Decreased' | 'N/A';
  }[];
}

const YieldPrediction = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { fields, loading } = useFields();
  const [wheatFields, setWheatFields] = useState<FieldData[]>([]);
  const [predictionData, setPredictionData] = useState<YieldPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'error'
  });

  useEffect(() => {
    if (fields) {
      const wheatFieldsData = fields.filter(field => field.cropType === 'Wheat');
      setWheatFields(wheatFieldsData);
      if (wheatFieldsData.length > 0) {
        fetchYieldPrediction(wheatFieldsData[0].id);
      } else {
        setIsLoading(false);
      }
    }
  }, [fields]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastConfig({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  const fetchYieldPrediction = async (fieldId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Please sign in to view predictions');
      }

      // Use the correct path: users/{userId}/fields/{fieldId}/predictions/current
      const predictionRef = doc(db, 'users', user.uid, 'fields', fieldId, 'predictions', 'current');
      
      try {
        const predictionDoc = await getDoc(predictionRef);

        if (predictionDoc.exists()) {
          const data = predictionDoc.data() as YieldPredictionData;
          setPredictionData({
            ...data,
            sowingDate: data.sowingDate instanceof Timestamp ? data.sowingDate.toDate() : data.sowingDate,
            predictionHistory: data.predictionHistory.map(history => ({
              ...history,
              date: history.date instanceof Timestamp ? history.date.toDate() : history.date
            }))
          });
        } else {
          // Initialize with sample data for new users
          if (!wheatFields[0]) {
            throw new Error('No wheat field data available');
          }

          const sampleData: YieldPredictionData = {
            fieldSize: Number(wheatFields[0].areaInAcres),
            cropType: 'Wheat',
            sowingDate: wheatFields[0].sowingDate,
            latitude: wheatFields[0].latitude || 0,
            longitude: wheatFields[0].longitude || 0,
            daysRemaining: 15,
            currentRound: 1,
            predictedYield: 1250,
            predictionHistory: [{
              round: 1,
              date: new Date(),
              predictedYield: 1250,
              weatherConditions: 'Sunny',
              yieldChange: 'N/A'
            }]
          };

          try {
            await setDoc(predictionRef, {
              ...sampleData,
              sowingDate: Timestamp.fromDate(sampleData.sowingDate),
              predictionHistory: sampleData.predictionHistory.map(history => ({
                ...history,
                date: Timestamp.fromDate(history.date)
              }))
            });
            setPredictionData(sampleData);
            showToast('Initial prediction data created successfully', 'success');
          } catch (error) {
            console.error('Error creating initial prediction:', error);
            if (error instanceof Error && error.message.includes('permission')) {
              showToast('Permission denied. Please check your access rights.', 'error');
            } else {
              showToast('Failed to create initial prediction data', 'error');
            }
            throw error;
          }
        }
      } catch (error) {
        console.error('Error accessing prediction document:', error);
        if (error instanceof Error && error.message.includes('permission')) {
          showToast('Permission denied. Please check your access rights.', 'error');
        } else {
          showToast('Error accessing prediction data', 'error');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in fetchYieldPrediction:', error);
      showToast(
        error instanceof Error 
          ? error.message.includes('permission')
            ? 'Permission denied. Please check your access rights.'
            : error.message
          : 'Error fetching yield prediction'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrediction = async () => {
    if (!predictionData || !wheatFields.length) {
      showToast('No field data available for prediction');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newPrediction = {
        round: predictionData.currentRound + 1,
        date: new Date(),
        predictedYield: predictionData.predictedYield + Math.floor(Math.random() * 100),
        weatherConditions: 'Sunny',
        yieldChange: predictionData.predictionHistory[predictionData.predictionHistory.length - 1].predictedYield < predictionData.predictedYield ? 'Increased' as const : 'Decreased' as const
      };

      const updatedData = {
        ...predictionData,
        daysRemaining: 15,
        currentRound: predictionData.currentRound + 1,
        predictedYield: newPrediction.predictedYield,
        predictionHistory: [...predictionData.predictionHistory, newPrediction]
      };

      // Use the correct path for updating predictions
      const predictionRef = doc(db, 'users', user.uid, 'fields', wheatFields[0].id, 'predictions', 'current');
      await updateDoc(predictionRef, {
        ...updatedData,
        predictionHistory: updatedData.predictionHistory.map(history => ({
          ...history,
          date: Timestamp.fromDate(history.date)
        }))
      });
      setPredictionData(updatedData);
      showToast('Prediction updated successfully', 'success');
    } catch (error) {
      console.error('Error updating prediction:', error);
      showToast('Failed to update prediction');
    }
  };

  if (loading || isLoading) {
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
            onPress={() => router.push('/farmer/FieldDetails')}
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
              latitude: wheatFields[0]?.latitude || 31.5204,
              longitude: wheatFields[0]?.longitude || 74.3587,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {wheatFields.map((field, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: field.latitude || 31.5204,
                  longitude: field.longitude || 74.3587
                }}
                title={`Field ${index + 1}`}
                description={`${field.areaInAcres} acres`}
              />
            ))}
          </MapView>
        </View>

        {
        predictionData && wheatFields[0] && (
          <View style={[styles.predictionCard, styles.cardShadow]}>
            <Text style={styles.cardTitle}>{t('Field Details')}</Text>
            <View style={styles.fieldDetailsContainer}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="ruler" size={20} color="#666" />
                <Text style={styles.detailLabel}>Area:</Text>
                <Text style={styles.detailValue}>{wheatFields[0].areaInAcres} acres</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="sprout" size={20} color="#666" />
                <Text style={styles.detailLabel}>Crop Type:</Text>
                <Text style={styles.detailValue}>{wheatFields[0].cropType}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="water" size={20} color="#666" />
                <Text style={styles.detailLabel}>Soil Type:</Text>
                <Text style={styles.detailValue}>{wheatFields[0].soilType}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.detailLabel}>Sowing Date:</Text>
                <Text style={styles.detailValue}>
                  {wheatFields[0].sowingDate.toLocaleDateString()}
                </Text>
              </View>

              {wheatFields[0].latitude && wheatFields[0].longitude && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>
                    {wheatFields[0].latitude.toFixed(4)}, {wheatFields[0].longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Yield Prediction Card */}
        {predictionData && (
        
          <View style={[styles.predictionCard, styles.cardShadow]}>
            <Text style={styles.cardTitle}>{t('Estimated Yield')}</Text>
            <View style={styles.yieldContainer}>
              <Text style={styles.yieldValue}>
                {predictionData.predictedYield} kg/hectare
              </Text>
              <Text style={styles.yieldComparison}>
                5% higher than regional average
              </Text>
              <Text style={styles.trendText}>
                {t('Trend')}: {t('Increasing')}
              </Text>
              <Text style={styles.conditionsText}>
                {t('Based on current conditions')}
              </Text>
            </View>
          </View>
        )}

        {/* 15-Day Forecast Graph */}
        {predictionData && (
          <View style={[styles.graphCard, styles.cardShadow]}>
            <Text style={styles.cardTitle}>{t('15-Day Yield Forecast')}</Text>
            <LineChart
              data={{
                labels: predictionData.predictionHistory.map(p => p.round.toString()),
                datasets: [{
                  data: predictionData.predictionHistory.map(p => p.predictedYield)
                }]
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(97, 177, 90, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Days Remaining and Prediction Button */}
        {predictionData && (
          <View style={[styles.daysCard, styles.cardShadow]}>
            <Text style={styles.daysText}>
              {t('Days Remaining')}: {predictionData.daysRemaining}
            </Text>
            {predictionData.daysRemaining === 0 && (
              <Button
                title={t('Predict Again')}
                onPress={handlePrediction}
                buttonStyle={styles.predictButton}
                titleStyle={styles.buttonTitle}
              />
            )}
          </View>
        )}

        {/* Previous Predictions */}
        {predictionData && (
          <View style={[styles.historyCard, styles.cardShadow]}>
            <Text style={styles.cardTitle}>{t('Previous Predictions')}</Text>
            {predictionData.predictionHistory.map((prediction, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {prediction.date.toLocaleDateString()}
                </Text>
                <Text style={styles.historyYield}>
                  {prediction.predictedYield} kg/hectare
                </Text>
                <Text style={[
                  styles.historyTrend,
                  { color: prediction.yieldChange === 'Increased' ? '#61B15A' : '#FF6B6B' }
                ]}>
                  {prediction.yieldChange}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHide={hideToast}
      />
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
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    height: 200,
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom:20,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    color: '#333333',
  },
  yieldContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  yieldValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#61B15A',
    marginBottom: 5,
  },
  yieldComparison: {
    fontSize: 16,
    color: '#61B15A',
    marginBottom: 5,
  },
  trendText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  conditionsText: {
    fontSize: 14,
    color: '#999999',
  },
  graphCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  daysCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 16,
  },
  daysText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  predictButton: {
    backgroundColor: '#61B15A',
    borderRadius: 25,
    paddingVertical: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  historyDate: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  historyYield: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  historyTrend: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
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
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fieldDetailsContainer: {
    marginTop: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
    width: 100,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
});

export default YieldPrediction;
