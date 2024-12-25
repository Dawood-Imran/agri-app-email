import React from 'react';
import { StyleSheet, View , Text} from 'react-native';
import { useTranslation } from 'react-i18next';

const AuctionSystem = () => {
  const { t } = useTranslation();

  return (
    <  View style={styles.container}>
      <Text style={styles.title}>{t('auctionSystem')}</Text>
      <Text style={styles.content}>{t('auctionSystemContent')}</Text>
    </  View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
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

export default AuctionSystem;
