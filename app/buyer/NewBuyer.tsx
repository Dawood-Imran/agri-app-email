import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const NewBuyer = () => {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!city || !address || !phoneNumber) {
        Alert.alert(t('error'), t('All fields are required'));
        return;
      }

      if (user) {
        const userTypeRef = doc(db, 'buyer', user.uid);
        await setDoc(userTypeRef, {
          city,
          address,
          phoneNumber: `+92${phoneNumber}`,
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
        <Text style={[styles.titleMain, i18n.language === 'ur' && styles.urduTitle]}>{t('New Buyer')}</Text>
        <Image source={require('../../assets/images/investor.png')} style={styles.image} />
      </View>
      <Text style={[styles.labeltxt, i18n.language === 'ur' && styles.urduText]}>{t('Please fill in the details below')}</Text>
      <View style={styles.form}>
        <Text style={[styles.label, i18n.language === 'ur' && styles.urduText]}>{t('Phone Number')}</Text>
        <Input
          placeholder="3XXXXXXXXX"
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          keyboardType="numeric"
          leftIcon={<Text style={styles.countryCode}>+92</Text>}
          containerStyle={styles.inputField}
          inputStyle={[styles.inputText, i18n.language === 'ur' && styles.urduInput]}
          placeholderTextColor="#E0E0E0"
          inputContainerStyle={{ borderBottomWidth: 0 }}
        />
        <Text style={[styles.label, i18n.language === 'ur' && styles.urduText]}>{t('City')}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={city}
            style={[styles.picker, i18n.language === 'ur' && styles.urduPicker]}
            onValueChange={(itemValue: string) => setCity(itemValue)}
          >
            <Picker.Item label={t('Select City')} value="" />
            <Picker.Item label="Lahore" value="Lahore" />
            <Picker.Item label="Faisalabad" value="Faisalabad" />
            <Picker.Item label="Rawalpindi" value="Rawalpindi" />
            <Picker.Item label="Gujranwala" value="Gujranwala" />
            <Picker.Item label="Multan" value="Multan" />
            <Picker.Item label="Sargodha" value="Sargodha" />
            <Picker.Item label="Sialkot" value="Sialkot" />
            <Picker.Item label="Bahawalpur" value="Bahawalpur" />
            <Picker.Item label="Sahiwal" value="Sahiwal" />
            <Picker.Item label="Sheikhupura" value="Sheikhupura" />
            <Picker.Item label="Jhang" value="Jhang" />
            <Picker.Item label="Rahim Yar Khan" value="Rahim Yar Khan" />
            <Picker.Item label="Kasur" value="Kasur" />
            <Picker.Item label="Okara" value="Okara" />
          </Picker>
        </View>
      
        <Button
          title={t('Submit')}
          onPress={handleSubmit}
          loading={loading}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={[styles.buttonTitle, i18n.language === 'ur' && styles.urduText]}
        />
      </View>
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
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#FFFFFF',
  },
  countryCode: {
    color: '#FFFFFF',
    marginRight: 8,
    fontSize: 16,
  },
  urduText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  urduTitle: {
    textAlign: 'right',
  },
  urduInput: {
    textAlign: 'right',
    paddingRight: 20,
    paddingLeft: 0,
  },
  urduPicker: {
    textAlign: 'right',
    direction: 'rtl',
  }
});

export default NewBuyer;

