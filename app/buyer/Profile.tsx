import React from 'react';
import { StyleSheet, View, Image , Text} from 'react-native';

const Profile = () => {
  const expertDetails = {
    name: 'Dr. Ahmed Khan',
    specialization: 'Agricultural Scientist',
    experience: '15 years',
    phone: '995-057-5065',
    email: 'dr.ahmed@agroboost.com',
    education: 'PhD in Agricultural Sciences',
    rating: '4.8',
    consultations: '250+'
  };

  return (
    <  View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
         
          <  Text style={styles.name}>Dr. {expertDetails.name}</  Text>
          <  Text style={styles.specialization}>{expertDetails.specialization}</  Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <  Text style={styles.statValue}>{expertDetails.rating}</  Text>
            <  Text style={styles.statLabel}>Rating</  Text>
          </View>
          <View style={styles.statItem}>
            <  Text style={styles.statValue}>{expertDetails.consultations}</  Text>
            <  Text style={styles.statLabel}>Consultations</  Text>
          </View>
          <View style={styles.statItem}>
            <  Text style={styles.statValue}>{expertDetails.experience}</  Text>
            <  Text style={styles.statLabel}>Experience</  Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <  Text style={styles.label}>Education</  Text>
          <  Text style={styles.value}>{expertDetails.education}</  Text>
        </View>
        <View style={styles.detailRow}>
          <  Text style={styles.label}>Phone</  Text>
          <  Text style={styles.value}>{expertDetails.phone}</  Text>
        </View>
        <View style={styles.detailRow}>
          <  Text style={styles.label}>Email</  Text>
          <  Text style={styles.value}>{expertDetails.email}</  Text>
        </View>
      </View>
    </  View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#61B15A',
    borderRadius: 15,
    marginBottom: 20,
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
  specialization: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#61B15A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
});

export default Profile; 