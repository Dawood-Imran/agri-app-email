import React from 'react';
import { StyleSheet, ScrollView, Text, View, Dimensions } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../components/CustomHeader';
import MapView from 'react-native-maps';

const YieldPrediction = () => {
  const { t } = useTranslation();
  const [previousPredictions] = React.useState([
    { id: 1, date: '2024-03-15', estimate: '2.5 tons/acre', notes: 'Good weather conditions' },
    { id: 2, date: '2024-02-15', estimate: '2.3 tons/acre', notes: 'Moderate rainfall' },
  ]);

  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>

        {/* Days Remaining Section */}
        <Card containerStyle={styles.daysCard}>
          <Text style={styles.daysLabel}>{t('Days Remaining for Prediction')}</Text>
          <Text style={styles.daysValue}>5 {t('Days Remaining')}</Text>
        </Card>

        {/* Make Prediction Button */}
        <Button
          title={t('Make Prediction')}
          onPress={() => {/* Implement prediction logic */}}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          containerStyle={styles.buttonContainer}
        />

        {/* Previous Predictions Section */}
        <Card containerStyle={styles.predictionsCard}>
          <Text style={styles.sectionTitle}>{t('Previous Predictions')}</Text>
          {previousPredictions.map((prediction) => (
            <Card key={prediction.id} containerStyle={styles.predictionItem}>
              <Text style={styles.predictionDate}>{prediction.date}</Text>
              <Text style={styles.predictionEstimate}>{prediction.estimate}</Text>
              <Text style={styles.predictionNotes}>{prediction.notes}</Text>
            </Card>
          ))}
        </Card>
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
