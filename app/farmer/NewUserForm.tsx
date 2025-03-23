import React, { useState } from 'react';
import { View, Text, StyleSheet, Image} from 'react-native';
import { Input, Button } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import based on your file structure
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CustomToast } from '../components/CustomToast';
import { Toast } from '../components/Toast';
import { Picker} from '@react-native-picker/picker';

const NewUserForm = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userTypeRef = doc(db, 'farmer', user.uid); // Adjust the collection name based on userType
        await setDoc(userTypeRef, { city, address, phoneNumber, isNewUser: false }, { merge: true });

        console.log('User details saved successfully');
        alert('User details saved successfully');
        setToastMessage(t('User details saved successfully'));
        router.replace('/farmer/dashboard'); // Redirect to profile
      } else {
        console.log('User not authenticated');
        setToastMessage(t('User not authenticated'));
        alert('User not authenticated');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
      setToastMessage(t('An error occurred while saving user details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>{t('New Farmer')}</Text>
        <Image source={require('../../assets/images/farmer.png')} style={styles.image} />
      </View>
      <Text style={styles.labeltxt}>{t('Please fill in the details below')}</Text>
      <View style={styles.form}>
        <Text style={styles.label}>{t('Phone Number')}</Text>
        <Input
          placeholder="3XXXXXXXXX"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="numeric"
          leftIcon={<Text style={styles.countryCode}>+92</Text>}
          containerStyle={styles.inputField}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
          inputContainerStyle={{ borderBottomWidth: 0 }}
        />
        <Text style={styles.label}>{t('City')}</Text>
        <Picker
          selectedValue={city}
          style={styles.picker}
          onValueChange={(itemValue: string) => setCity(itemValue)}
        >
          <Picker.Item label="Select City" value="" />
          <Picker.Item label="Lahore" value="Lahore" />
          <Picker.Item label="Faisalabad" value="Faisalabad" />
          <Picker.Item label="Rawalpindi" value="Rawalpindi" />
          <Picker.Item label="Gujranwala" value="Gujranwala" />
          <Picker.Item label="Multan" value="Multan" />
          <Picker.Item label="Sargodha" value="Sargodha" />
          <Picker.Item label="Sialkot" value="Sialkot" />
          <Picker.Item label="Bahawalpur" value="Bahawalpur" />
          <Picker.Item label="Sahiwal" value="Sahiwal" />
        </Picker>
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
      <Toast
        visible={toastVisible}
        message={toastMessage || ''}
        type="custom"
        color="#FFC107"
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
    lineHeight: 44,
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
    fontSize: 18,
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
  picker: {
    height: 50,
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginBottom: 10,
  },
  countryCode: {
    color: '#FFFFFF',
    marginRight: 8,
    fontSize: 16,
  },
});

export default NewUserForm;