import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Image } from 'react-native';
import { useUser } from '../context/UserProvider';
import { useTranslation } from 'react-i18next';
import { Card } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';

interface Consultation {
  id: string;
  farmerName: string;
  message: string;
  timestamp: Timestamp;
  status: 'pending' | 'responded';
  expertId: string;
}

interface ExpertStats {
  pendingConsultations: number;
  completedToday: number;
  rating: number;
}

const MessagesTab = () => {
  const { t, i18n } = useTranslation();
  const { userName, userType, email, city, experienceYears, isLoading, reloadUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExpertStats>({
    pendingConsultations: 0,
    completedToday: 0,
    rating: 0
  });
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Fetch expert stats
      const expertRef = doc(db, 'expert', user.uid);
      getDoc(expertRef).then((docSnap) => {
        if (docSnap.exists()) {
          const expertData = docSnap.data();
          setStats({
            pendingConsultations: expertData.stats?.pendingConsultations || 0,
            completedToday: expertData.stats?.completedToday || 0,
            rating: expertData.stats?.rating || 0
          });
        }
      });

      // Listen for recent consultations
      const consultationsRef = collection(db, 'consultations');
      const q = query(
        consultationsRef,
        where('expertId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const consultations: Consultation[] = [];
        snapshot.forEach((doc) => {
          consultations.push({ id: doc.id, ...doc.data() } as Consultation);
        });
        setRecentConsultations(consultations);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching consultations:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleReload = () => {
    setLoading(true);
    reloadUser();
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
        <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
          <Text style={styles.reloadButtonText}>{t('Reload')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatTime = (timestamp: Timestamp): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return hours === 0 ? t('Just now') : `${hours} ${t('hours ago')}`;
    }
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={[styles.greeting, i18n.language === 'ur' && styles.urduText]}>
            {t('Welcome')}, Dr. {userName}
          </Text>
          <Text style={[styles.subGreeting, i18n.language === 'ur' && styles.urduText]}>
            {t('Agricultural Expert')}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Card containerStyle={styles.statCard}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.pendingConsultations}</Text>
          <Text style={styles.statLabel}>{t('Pending Consultations')}</Text>
        </Card>

        <Card containerStyle={styles.statCard}>
          <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>{t('Completed Today')}</Text>
        </Card>

        <Card containerStyle={styles.statCard}>
          <MaterialCommunityIcons name="star-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>{t('Rating')}</Text>
        </Card>
      </View>

      <View style={styles.consultationsContainer}>
        <Text style={[styles.sectionTitle, i18n.language === 'ur' && styles.urduText]}>
          {t('Recent Consultations')}
        </Text>
        {recentConsultations.map((consultation) => (
          <View key={consultation.id} style={styles.consultationCard}>
            <View style={styles.consultationHeader}>
              <MaterialCommunityIcons name="account-outline" size={24} color="#4CAF50" />
              <Text style={styles.farmerName}>{consultation.farmerName}</Text>
              <Text style={styles.consultationTime}>{formatTime(consultation.timestamp)}</Text>
            </View>
            <Text style={styles.consultationQuery}>
              {consultation.message}
            </Text>
            <TouchableOpacity 
              style={[
                styles.respondButton,
                consultation.status === 'responded' && styles.respondedButton
              ]}
              onPress={() => {/* Handle response */}}
              disabled={consultation.status === 'responded'}
            >
              <Text style={styles.respondButtonText}>
                {consultation.status === 'responded' ? t('Responded') : t('Respond')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        {recentConsultations.length === 0 && (
          <View style={styles.noConsultationsContainer}>
            <MaterialCommunityIcons name="message-text-outline" size={48} color="#4CAF50" />
            <Text style={styles.noConsultationsText}>{t('No consultations yet')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  reloadButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 18,
    color: '#E8F5E9',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  consultationsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  consultationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consultationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  consultationTime: {
    fontSize: 12,
    color: '#666666',
  },
  consultationQuery: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 12,
  },
  respondButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  respondButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  respondedButton: {
    backgroundColor: '#A5D6A7',
  },
  noConsultationsContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  noConsultationsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  urduText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default MessagesTab;
