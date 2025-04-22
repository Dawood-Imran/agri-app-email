import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, Dimensions, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FieldData, useFields } from '../hooks/useFields';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from '../components/Toast';
import { getAuth } from 'firebase/auth';

interface YieldPredictionData {
  fieldId: string;
  fieldSize: number;
  cropType: string;
  sowingDate: Date;
  latitude: number;
  longitude: number;
  daysRemaining: number;
  currentRound: number;
  predictedYield: number; // in maunds
  actualYield?: number; // in maunds
  regionAverage: number; // in maunds
  predictionHistory: {
    round: number;
    date: Date;
    predictedYield: number;
    actualYield?: number;
    weatherConditions: string;
    yieldChange: 'Increased' | 'Decreased' | 'Stable' | 'N/A';
  }[];
}

// Regional average wheat yields in maunds per acre
const REGIONAL_AVERAGE_YIELDS = {
  Punjab: 40,
  Sindh: 35,
  KPK: 32,
  Balochistan: 30,
  Default: 38
};

const YieldPrediction = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { fields, loading } = useFields();
  const [wheatField, setWheatField] = useState<FieldData | null>(null);
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
    if (!loading && fields) {
      console.log('Fields:', fields);

      const wheatFieldData = fields.find(field => field.cropType.toLowerCase() === 'wheat');
      if (wheatFieldData) {
        setWheatField(wheatFieldData);
        fetchYieldPrediction(wheatFieldData.id);
      } else {
        setIsLoading(false);
      }
    }
  }, [fields, loading]);

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

      // Fetch from fields/{fieldId}/predictions/current
      const predictionRef = doc(db, 'fields', fieldId, 'predictions', 'current');
      
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
          // Initialize with sample data for new prediction
          if (!wheatField) {
            throw new Error('No wheat field data available');
          }

          // Determine region and get regional average
          const region = determineRegion(wheatField.latitude || 0, wheatField.longitude || 0);
          const regionAverage = REGIONAL_AVERAGE_YIELDS[region] || REGIONAL_AVERAGE_YIELDS.Default;

          // Base prediction on field size and regional average with a slight randomization
          const baseYield = Number(wheatField.areaInAcres) * regionAverage;
          const initialPrediction = baseYield + (Math.random() * 10 - 5); // +/- 5 maunds variation

          const sampleData: YieldPredictionData = {
            fieldId: fieldId,
            fieldSize: Number(wheatField.areaInAcres),
            cropType: 'Wheat',
            sowingDate: wheatField.sowingDate,
            latitude: wheatField.latitude || 0,
            longitude: wheatField.longitude || 0,
            daysRemaining: 15,
            currentRound: 1,
            predictedYield: Math.round(initialPrediction),
            regionAverage: regionAverage,
            predictionHistory: [{
              round: 1,
              date: new Date(),
              predictedYield: Math.round(initialPrediction),
              weatherConditions: 'Sunny',
              yieldChange: 'N/A'
            },
            {
              round: 2,
              date: new Date(),
              predictedYield: Math.round(initialPrediction + (Math.random() * 10 - 5)),
              weatherConditions: 'Sunny',
              yieldChange: 'Stable'
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

  // Determine region based on coordinates for regional average yield
  const determineRegion = (latitude: number, longitude: number): keyof typeof REGIONAL_AVERAGE_YIELDS => {
    // This is a simplistic approach - in a real app, you'd use more precise geolocation data
    if (latitude > 30 && longitude > 70) return 'Punjab';
    if (latitude < 30 && longitude > 68) return 'Sindh';
    if (latitude > 33 && longitude < 73) return 'KPK';
    if (latitude < 30 && longitude < 68) return 'Balochistan';
    return 'Default';
  };

  const handlePrediction = async () => {
    if (!predictionData || !wheatField) {
      showToast('No field data available for prediction');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate a new yield prediction with slight variations based on the previous prediction
      const lastPrediction = predictionData.predictionHistory[predictionData.predictionHistory.length - 1].predictedYield;
      
      // Random adjustment between -5% and +8%
      const changePercentage = Math.random() * 13 - 5;
      const newYield = Math.round(lastPrediction * (1 + (changePercentage / 100)));
      
      // Determine weather condition and yield change type
      const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Drought'];
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      let yieldChange: 'Increased' | 'Decreased' | 'Stable' = 'Stable';
      if (newYield > lastPrediction) yieldChange = 'Increased';
      else if (newYield < lastPrediction) yieldChange = 'Decreased';

      const newPrediction = {
        round: predictionData.currentRound + 1,
        date: new Date(),
        predictedYield: newYield,
        weatherConditions: randomWeather,
        yieldChange: yieldChange
      };

      const updatedData = {
        ...predictionData,
        daysRemaining: Math.max(0, predictionData.daysRemaining - 5),
        currentRound: predictionData.currentRound + 1,
        predictedYield: newYield,
        predictionHistory: [...predictionData.predictionHistory, newPrediction]
      };

      // Update the prediction document
      const predictionRef = doc(db, 'fields', wheatField.id, 'predictions', 'current');
      await updateDoc(predictionRef, {
        ...updatedData,
        predictionHistory: updatedData.predictionHistory.map(history => ({
          ...history,
          date: history.date instanceof Date ? Timestamp.fromDate(history.date) : history.date
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
        <ActivityIndicator size="large" color="#3A8A41" />
      </View>
    );
  }

  if (!wheatField) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="sprout" size={80} color="#DEA82A" />
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
                size={22} 
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Wheat Yield Prediction')}</Text>
        </View>
        
        {/* Map Section */}
        <View style={[styles.mapContainer, styles.cardShadow]}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: wheatField?.latitude || 31.5204,
              longitude: wheatField?.longitude || 74.3587,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {wheatField && (
              <Marker
                coordinate={{
                  latitude: wheatField.latitude || 31.5204,
                  longitude: wheatField.longitude || 74.3587
                }}
                title={`Wheat Field`}
                description={`${wheatField.areaInAcres} acres`}
                pinColor="#3A8A41"
              />
            )}
          </MapView>
        </View>

        {predictionData && wheatField && (
          <View style={[styles.predictionCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="sprout" size={24} color="#DEA82A" />
              <Text style={styles.cardTitle}>{t('Field Details')}</Text>
            </View>
            <View style={styles.fieldDetailsContainer}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="ruler" size={20} color="#666" />
                <Text style={styles.detailLabel}>Area:</Text>
                <Text style={styles.detailValue}>{wheatField.areaInAcres} acres</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="sprout" size={20} color="#666" />
                <Text style={styles.detailLabel}>Crop Type:</Text>
                <Text style={styles.detailValue}>{wheatField.cropType}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="water" size={20} color="#666" />
                <Text style={styles.detailLabel}>Soil Type:</Text>
                <Text style={styles.detailValue}>{wheatField.soilType}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.detailLabel}>Sowing Date:</Text>
                <Text style={styles.detailValue}>
                  {wheatField.sowingDate.toLocaleDateString()}
                </Text>
              </View>

              {wheatField.latitude && wheatField.longitude && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>
                    {wheatField.latitude.toFixed(4)}, {wheatField.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Yield Prediction Card */}
        {predictionData && (
          <View style={[styles.predictionCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#3A8A41" />
              <Text style={styles.cardTitle}>{t('Estimated Yield')}</Text>
            </View>
            <View style={styles.yieldContainer}>
              <Text style={styles.yieldValue}>
                {predictionData.predictedYield} {t('maunds')}
              </Text>
              
              <View style={styles.yieldComparisonContainer}>
                {predictionData.predictedYield > predictionData.regionAverage ? (
                  <MaterialCommunityIcons name="arrow-up" size={24} color="#3A8A41" />
                ) : (
                  <MaterialCommunityIcons name="arrow-down" size={24} color="#E74C3C" />
                )}
                <Text style={[
                  styles.yieldComparison,
                  { color: predictionData.predictedYield > predictionData.regionAverage ? '#3A8A41' : '#E74C3C' }
                ]}>
                  {Math.abs(Math.round((predictionData.predictedYield / predictionData.regionAverage - 1) * 100))}% 
                  {predictionData.predictedYield > predictionData.regionAverage ? ' higher' : ' lower'} than regional average
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.yieldMetricsContainer}>
                <View style={styles.yieldMetric}>
                  <Text style={styles.metricLabel}>{t('Regional Average')}</Text>
                  <Text style={styles.metricValue}>{predictionData.regionAverage} {t('maunds')}</Text>
                </View>
                
                <View style={styles.yieldMetric}>
                  <Text style={styles.metricLabel}>{t('Total Field Size')}</Text>
                  <Text style={styles.metricValue}>{predictionData.fieldSize} {t('acres')}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Yield Trend Graph */}
        {predictionData && (
          <View style={[styles.graphCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="chart-areaspline" size={24} color="#3A8A41" />
              <Text style={styles.cardTitle}>{t('Yield Forecast Trend')}</Text>
            </View>
            <LineChart
              data={{
                labels: predictionData.predictionHistory.map(p => `R${p.round}`),
                datasets: [
                  {
                    data: predictionData.predictionHistory.map(p => p.predictedYield),
                    color: (opacity = 1) => `rgba(58, 138, 65, ${opacity})`,
                    strokeWidth: 2
                  },
                  {
                    data: Array(predictionData.predictionHistory.length).fill(predictionData.regionAverage),
                    color: (opacity = 1) => `rgba(222, 168, 42, ${opacity})`,
                    strokeWidth: 2,
                    withDots: false
                  }
                ],
                legend: ["Predicted Yield", "Regional Average"]
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#3A8A41"
                },
                propsForLabels: {
                  fontSize: 10
                }
              }}
              bezier
              style={styles.chart}
              fromZero
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withShadow={false}
              withDots={true}
              withScrollableDot={false}
              verticalLabelRotation={0}
              horizontalLabelRotation={0}
              xLabelsOffset={0}
              yLabelsOffset={8}
              segments={5}
              legend={["Predicted Yield", "Regional Average"]}
              legendOffset={20}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#3A8A41' }]} />
                <Text style={styles.legendText}>{t('Predicted Yield')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#DEA82A' }]} />
                <Text style={styles.legendText}>{t('Regional Average')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Days Remaining and Prediction Button */}
        {predictionData && (
          <View style={[styles.daysCard, styles.cardShadow]}>
            <View style={styles.daysRemaining}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#3A8A41" />
              <Text style={styles.daysText}>
                {t('Days Until Next Prediction')}: {predictionData.daysRemaining}
              </Text>
            </View>
            <Button
              title={predictionData.daysRemaining > 0 ? t('Predict Now') : t('Update Prediction')}
              onPress={handlePrediction}
              buttonStyle={styles.predictButton}
              titleStyle={styles.buttonTitle}
              containerStyle={styles.predictButtonContainer}
              icon={
                <MaterialCommunityIcons 
                  name="refresh" 
                  size={20} 
                  color="#FFFFFF" 
                  style={{ marginRight: 8 }}
                />
              }
            />
          </View>
        )}

        {/* Previous Predictions */}
        {predictionData && predictionData.predictionHistory.length > 0 && (
          <View style={[styles.historyCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="history" size={24} color="#3A8A41" />
              <Text style={styles.cardTitle}>{t('Prediction History')}</Text>
            </View>
            <View style={styles.historyHeaderRow}>
              <Text style={styles.historyHeaderDate}>{t('Date')}</Text>
              <Text style={styles.historyHeaderYield}>{t('Yield (maunds)')}</Text>
              <Text style={styles.historyHeaderTrend}>{t('Trend')}</Text>
            </View>
            {predictionData.predictionHistory.slice().reverse().map((prediction, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {prediction.date.toLocaleDateString()}
                </Text>
                <Text style={styles.historyYield}>
                  {prediction.predictedYield}
                </Text>
                <View style={styles.trendContainer}>
                  {prediction.yieldChange !== 'N/A' && (
                    <MaterialCommunityIcons 
                      name={
                        prediction.yieldChange === 'Increased' ? 'trending-up' : 
                        prediction.yieldChange === 'Decreased' ? 'trending-down' : 'trending-neutral'
                      } 
                      size={18} 
                      color={
                        prediction.yieldChange === 'Increased' ? '#3A8A41' : 
                        prediction.yieldChange === 'Decreased' ? '#E74C3C' : '#F39C12'
                      } 
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={[
                    styles.historyTrend,
                    { 
                      color: prediction.yieldChange === 'Increased' ? '#3A8A41' : 
                             prediction.yieldChange === 'Decreased' ? '#E74C3C' : 
                             prediction.yieldChange === 'Stable' ? '#F39C12' : '#666666'
                    }
                  ]}>
                    {prediction.yieldChange}
                  </Text>
                </View>
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
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  yieldContainer: {
    paddingVertical: 12,
  },
  yieldValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3A8A41',
    textAlign: 'center',
    marginBottom: 8,
  },
  yieldComparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  yieldComparison: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 12,
  },
  yieldMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  yieldMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  graphCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  chart: {
    marginVertical: 12,
    borderRadius: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  daysCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  daysRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  daysText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 8,
  },
  predictButton: {
    backgroundColor: '#3A8A41',
    borderRadius: 8,
    paddingVertical: 12,
  },
  predictButtonContainer: {
    marginTop: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    marginBottom: 4,
  },
  historyHeaderDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  historyHeaderYield: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  historyHeaderTrend: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'right',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
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
    fontWeight: '500',
    textAlign: 'center',
  },
  trendContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  historyTrend: {
    fontSize: 14,
    textAlign: 'right',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFieldButton: {
    backgroundColor: '#3A8A41',
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFieldButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  fieldDetailsContainer: {
    marginTop: 10,
    backgroundColor: '#F9F9F9',
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