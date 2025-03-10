import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const { userName, userType, email, city, address } = useLocalSearchParams();
  console.log('User Data Profile:', userName, userType, email, city, address);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await AsyncStorage.clear(); // Clear all stored data
      router.replace('/'); // Navigate to root/auth screen
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(t('Error'), t('Failed to logout. Please try again.'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/images/farmer-icons/farmer.png')}
            style={styles.profileImage}
          />
          <Text style={styles.name}>Hi! {userName}</Text>
        </View>
      </View>
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{userName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>City</Text>
          <Text style={styles.value}>{city}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{address}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('Logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
    paddingTop: 10,
    paddingBottom: 20,
    borderRadius: 15,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#61B15A',
  },
  imageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Profile; 