import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Alert } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';

const NewBuyer = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!city || !address) {
        Alert.alert(t('error'), t('All fields are required'));
        return;
      }

      if (user) {
        const userTypeRef = doc(db, 'buyer', user.uid);
        await setDoc(userTypeRef, {
          city,
          address,
          isNewUser: false,
          createdAt: new Date(),
        }, { merge: true });

        Alert.alert(t('Success'), t('Information saved successfully!'));
        router.replace('/buyer/dashboard');
      }
    } catch (error) {
      console.error('Error saving information:', error);
      Alert.alert(t('error'), t('An error occurred while saving your information.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>{t('New Buyer')}</Text>
        <Image source={require('../../assets/images/investor.png')} style={styles.image} />
      </View>
      <Text style={styles.labeltxt}>{t('Please fill in the details below')}</Text>
      <View style={styles.form}>
        <Text style={styles.label}>{t('City')}</Text>
        <Input
          placeholder={t('Enter your city')}
          value={city}
          onChangeText={setCity}
          containerStyle={styles.inputField}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
          inputContainerStyle={{ borderBottomWidth: 0 }}
        />
        <Text style={styles.label}>{t('Address')}</Text>
        <Input
          placeholder={t('Enter your complete address')}
          value={address}
          onChangeText={setAddress}
          containerStyle={styles.inputField}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
          inputContainerStyle={{ borderBottomWidth: 0 }}
        />
        <Button
          title={t('Submit')}
          onPress={handleSubmit}
          loading={loading}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#61B15A',
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
    lineHeight: 42,
  },
  image: {
    width: 80,
    height: 80,
    marginLeft: 20,
  },
  labeltxt: {
    color: '#FFC107',
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 5,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 5,
  },
  inputField: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 45,
    width: '100%',
  },
  inputText: {
    color: '#FFFFFF',
    paddingLeft: 20,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    width: '80%',
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
  },
});

export default NewBuyer;

