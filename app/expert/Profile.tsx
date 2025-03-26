import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProfilePicture from '../components/ProfilePicture';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, my_auth } from '../../firebaseConfig';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { userName, email, city } = useUser();
  const [profileData, setProfileData] = useState({
    specialization: '',
    experience: '',
    consultationHours: {} as { start?: string; end?: string } | string,
    consultations: 0,
    coins: 0,
    profilePicture: '',
    preferredLanguage: 'en',
    phoneNumber: '',
    rating: 0,
    totalRatings: 0
  });

  useEffect(() => {
    const user = my_auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'expert', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfileData({
          specialization: data.specialization || '',
          experience: data.experience || '',
          consultationHours: data.consultationHours || '',
          consultations: data.consultations || 0,
          coins: data.coins || 0,
          profilePicture: data.profilePicture || '',
          preferredLanguage: data.preferredLanguage || 'en',
          phoneNumber: data.phoneNumber || '',
          rating: data.rating || 0,
          totalRatings: data.totalRatings || 0
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpdated = (url: string) => {
    setProfileData(prev => ({ ...prev, profilePicture: url }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <ProfilePicture
            imageUrl={profileData.profilePicture}
            userId={my_auth.currentUser?.uid || ''}
            userType="expert"
            onImageUpdated={handleImageUpdated}
          />
          <Text style={[styles.name, i18n.language === 'ur' && styles.urduText]}>
            {userName}
          </Text>
          <Text style={[styles.role, i18n.language === 'ur' && styles.urduText]}>
            {profileData.specialization || t('Expert')}
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{t('Rating')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.consultations}</Text>
            <Text style={styles.statLabel}>{t('Consultations')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.coins}</Text>
            <Text style={styles.statLabel}>{t('Coins')}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="phone" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('Phone')}</Text>
              <Text style={styles.infoValue}>{profileData.phoneNumber}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('Email')}</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('City')}</Text>
              <Text style={styles.infoValue}>{city}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="briefcase-outline" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('Experience')}</Text>
              <Text style={styles.infoValue}>{profileData.experience || t('Not specified')}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('Consultation Hours')}</Text>
              <Text style={styles.infoValue}>
                {typeof profileData.consultationHours === 'object' && 
                 'start' in profileData.consultationHours && 
                 'end' in profileData.consultationHours
                  ? `${profileData.consultationHours.start} - ${profileData.consultationHours.end}`
                  : typeof profileData.consultationHours === 'string'
                    ? profileData.consultationHours
                    : t('Not specified')}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="star-outline" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('Total Ratings')}</Text>
              <Text style={styles.infoValue}>{profileData.totalRatings}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="translate" size={24} color="#4CAF50" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('Preferred Language')}</Text>
              <Text style={styles.infoValue}>
                {profileData.preferredLanguage === 'ur' ? t('Urdu') : t('English')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#388E3C',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  role: {
    fontSize: 18,
    color: '#E8F5E9',
    marginTop: 5,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 8, 
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between for more space between items
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  
  statItem: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 15,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin:2
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  infoSection: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginTop: 2,
  },
  urduText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default Profile; 