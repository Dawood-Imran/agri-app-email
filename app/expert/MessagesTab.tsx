import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Image } from 'react-native';
import { useUser } from '../context/UserProvider';
import { useTranslation } from 'react-i18next';

const ExpertTab = () => {
  const { t } = useTranslation();
  const { userName, userType, email, city, experienceYears, isLoading, reloadUser } = useUser();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
      console.log('Expert Data Loaded:', { userName, userType, email, city, experienceYears });
    }
  }, [isLoading, city , experienceYears ]); 

  const handleReload = () => {
    console.log('Reloading user data...');
    setLoading(true);
    reloadUser();
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
        <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('Welcome Expert')}, {userName}</Text>
        <Text style={styles.subGreeting}>
          {t('Expert Experience', { experienceYears })}
        </Text>
        <Text style={styles.detailText}>{t('email')}: {email}</Text>
        <Text style={styles.detailText}>{t('city')}: {city}</Text>
        <Text style={styles.detailText}>Experince years : {experienceYears}</Text>

      </View>

      {/* Add any expert-specific features or actions here */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>{t('features')}</Text>
        {/* Add expert feature cards/buttons */}
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>{t('expertConsultation')}</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>{t('consultationHistory')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#FFC107',
    borderRadius: 5,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subGreeting: {
    fontSize: 18,
    color: '#555555',
  },
  detailText: {
    fontSize: 16,
    marginTop: 8,
    color: '#777777',
  },
  featuresContainer: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#444444',
  },
  featureCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
});

export default ExpertTab;
