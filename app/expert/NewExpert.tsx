import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import based on your file structure
import { router } from 'expo-router';

const NewExpert = () => {
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userTypeRef = doc(db, 'expert', user.uid); // Adjust the collection name based on userType
        await setDoc(userTypeRef, { city, address, experienceYears ,isNewUser: false }, { merge: true });
  
        console.log('User details saved successfully');
        alert('User details saved successfully');
        router.replace('/expert/dashboard'); // Redirect to profile
      } else {
        console.log('User not authenticated');
        alert('User not authenticated');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Enter your city"
      />
      <Text style={styles.label}>Complete Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your complete address"
      />

    <Text style={styles.label}>Experience Years</Text>
      <TextInput
        style={styles.input}
        value={experienceYears}
        onChangeText={setExperienceYears}
        placeholder="Enter your Experience Years"
      />
      <Button title="Submit" onPress={handleSubmit} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default NewExpert;