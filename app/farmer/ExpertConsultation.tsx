import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import based on your file structure

const ExpertConsultation = () => {
  const { t } = useTranslation();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'expert'));
      const expertsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExperts(expertsList);
      console.log('Experts fetched successfully:', expertsList);
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExperts().then(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={require('../../assets/images/badge.png')} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        
        

        <Text style={styles.experience}>Experience Years: {item.experienceYears}</Text>
        <View style={styles.badgeContainer}>
          <Image source={require('../../assets/images/badge.png')} style={styles.badge} />
          <Text style={styles.badgeText}>{t('Verified')}</Text>
        </View>
        <View style={styles.buttonContainer}>
                <TouchableOpacity  style={styles.button}>
                <Text style={styles.buttonTitle}>Chat</Text>
                </TouchableOpacity>
        </View>


      </View>

        

      
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FFC107" style={styles.loader} />
      ) : (
      <FlatList
        data={experts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading && <Text style={styles.noData}>{t('noExperts')}</Text>}
      />
      )}
    </View>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  specialty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  experience: {
    fontSize: 14,
    color: '#999',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  badge: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },

  buttonContainer: {
    marginTop: 10,
    width: '40%',
    left: '10%',
  },
  button: {
    backgroundColor: '#FFC107',
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonTitle: {
    color: '#1B5E20',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default ExpertConsultation;