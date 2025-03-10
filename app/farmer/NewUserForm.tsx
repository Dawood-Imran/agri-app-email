import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image , TouchableOpacity} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import based on your file structure
import { router } from 'expo-router';
import { Input } from 'react-native-elements';
import { useTranslation } from 'react-i18next';

const NewUserForm = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userTypeRef = doc(db, 'farmer', user.uid); // Adjust the collection name based on userType
        await setDoc(userTypeRef, { city, address, isNewUser: false }, { merge: true });

        console.log('User details saved successfully');
        alert('User details saved successfully');
        router.replace('/farmer/dashboard'); // Redirect to profile
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
      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>{t('New Farmer')}</Text>
        <Image source={require('../../assets/images/farmer.png')} style={styles.image} />
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
    padding: 20,
    backgroundColor: '#61B15A',
  },
  welcometxt: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    
    marginBottom: 20,
  },

  userType: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flexDirection: 'column',
    marginLeft: 10,
    top: 50,
  },
  labeltxt: {
    color: '#FFC107',
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 5,
  
  },
  
  titleMain: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  titleHighlight: {
    
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FFC107',
  },
  titleImage: {
    width: 80,
    height: 80,
    right: 80,
    
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
  input: {
    borderWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 45,
    width: '100%',
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
    textAlign: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginLeft: 20,
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
});

export default NewUserForm;