import React from 'react';
import { StyleSheet, ScrollView  , Text, View} from 'react-native';
import {  Card } from 'react-native-elements';

import { useTranslation } from 'react-i18next';
import CustomHeader from '../components/CustomHeader';

const YieldPrediction = () => {
  const { t } = useTranslation();

  return (
    < View style={styles.container}>
      <CustomHeader />
      <ScrollView>
        <Card containerStyle={styles.card}>
          <Text style={styles.title}>{t('yieldPrediction')}</Text>
          <Text style={styles.content}>{t('yieldPredictionContent')}</Text>
        </Card>
      </ScrollView>
    </ View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  content: {
    fontSize: 16,
    color: '#666',
  },
});

export default YieldPrediction;
