import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Image, Alert, ImageBackground , Text} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Input, Button, Icon } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { Toast } from './components/Toast';
import {useAuth} from './context/AuthContext';
import { my_auth , db } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from 'firebase/firestore';




const { width } = Dimensions.get('window'); // Get screen width

const SignIn = () => {
  const { userType } = useLocalSearchParams<{ userType: string }>();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const isRTL = i18n.language === 'ur';

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const validatePhoneNumber = (text: string) => {
    const cleanedText = text.replace(/[\s-]/g, '');
    
    if (cleanedText.length <= 10 && (!cleanedText.length || cleanedText.startsWith('3'))) {
      setPhoneNumber(cleanedText);
      setErrorMessage('');
    } else if (cleanedText.length > 10) {
      showToast(t('Phone number cannot exceed 10 digits'));
    } else if (!cleanedText.startsWith('3')) {
      showToast(t('Phone number must start with 3'));
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      if (!email.trim() || !pinCode.trim()) {
        showToast(t('All Fields Required'));
        setLoading(false);
        return;
      }

      // Sign in with email and password
      const response = await signInWithEmailAndPassword(my_auth, email, pinCode);
      const user = response.user;
      console.log(response);
      // Set user data in context
      Alert.alert(t('Success'), t('You have successfully signed in'));

      

      // Navigate based on userType
      if (userType) {
        switch(userType.toLowerCase()) {
          case 'farmer':
            try {
          
              const userDoc = await getDoc(doc(db, 'farmer', user.uid));
              if (userDoc.exists() && userDoc.data().isNewUser) {
                navigation.navigate('farmer/NewUserForm');
              } else {
                // Navigate to dashboard if the user is not new
                navigation.navigate('farmer/dashboard');
              }
            } catch (error) {
              console.error('Error signing in:', error);
              alert(error.message);
            }
            break;
          case 'expert':
            try {   
              const userDoc = await getDoc(doc(db, 'expert', user.uid));
              console.log("Expert Data from Sign in",userDoc.data());
              if (userDoc.exists() && userDoc.data().isNewUser) {
                navigation.navigate('expert/NewExpert');
              } else {
                // Navigate to dashboard if the user is not new
                navigation.navigate('expert/dashboard');
              }
            } catch (error) {
              console.error('Error signing in:', error);
              alert(error.message);
            }
            break;
          case 'buyer':
            router.replace('/buyer/dashboard');
            break;
          default:
            Alert.alert(t('error'), 'Invalid user type');
            router.replace('/UserSelectionScreen');
        }
      } else {
        // Handle case when userType is not available
        Alert.alert(t('error'), 'Please select user type');
        router.replace('/UserSelectionScreen');
      }
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      handleSignIn();
    }
  };

  const validateForm = () => {
    setErrorMessage(''); // Reset error message
    if (!email.trim()) {
      
      setToastVisible(true);
      setToastMessage(t('Email Required'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      
      setToastVisible(true);
      setToastMessage(t('Invalid Email Address'));
      return false;
    }
    if (pinCode.length !== 6 || !/^\d+$/.test(pinCode)) {
      
      setToastVisible(true);
      setToastMessage(t('Pin Code Must Be 6 Digits'));
      return false;
    }
    return true;
  };

  const handleBack = () => {
    router.push('/UserSelectionScreen');
  };

  const handleForgotPin = () => {
    router.push('/ForgotPin');
  };

  return (
  
    < View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" type="material" color="#FFC107" size={30} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <  Text style={styles.titleMain}>{t('Sign In')}</  Text>
        {userType && (
          <  Text style={styles.titleSub}>
            {t('as')} <  Text style={styles.userType}>
              {t(userType.toLowerCase())}
            </  Text>
          </  Text>
        )}
      </View>
      <View style={styles.form} >
        
        {/* <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Phone Number')}</Text>
        <View style={styles.inputContainer}>
          <Input
            placeholder="3XXXXXXXXX"
            onChangeText={validatePhoneNumber}
            value={phoneNumber}
            keyboardType="numeric"
            leftIcon={
              <View style={[styles.iconContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                <Image source={require('../assets/pakistan-flag.jpg')} style={styles.flagIcon} />
                <  Text style={styles.countryCode}>+92</  Text>
                <View style={styles.separator} />
              </View>
            }
            inputStyle={styles.inputText}
            placeholderTextColor="#E0E0E0"
            containerStyle={styles.inputField}
            underlineColorAndroid="transparent"
            inputContainerStyle={{ borderBottomWidth: 0 }}
            errorMessage={errorMessage}
            errorStyle={styles.errorText}
          />
        </View> */}

    <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Email')}</Text>
        <Input
          placeholder={t('Enter Email')}
          onChangeText={setEmail}
          value={email}
          leftIcon={
            <View style={styles.iconContainer}>
              <Icon name="email" type="material" color="#FFFFFF" />
              <View style={styles.separator} />
            </View>
          }
          containerStyle={styles.inputField}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
          underlineColorAndroid="transparent"
          
        />






        <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Pin Code')}</Text>
        <View style={styles.inputContainer}>
          <Input
            placeholder={t("Enter Pin Code")}
            onChangeText={(text) => {
              if (text.length <= 6) {
                setPinCode(text);
              }
            }}
            value={pinCode}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            leftIcon={
              <View style={styles.iconContainer}>
                <Icon name="lock" type="material" color="#FFFFFF" />
                <View style={styles.separator} />
              </View>
            }
            inputStyle={styles.inputText}
            placeholderTextColor="#E0E0E0"
            containerStyle={styles.inputField}
            underlineColorAndroid="transparent"
            inputContainerStyle={{ borderBottomWidth: 0 }}
          />
          <TouchableOpacity 
            onPress={handleForgotPin} 
            style={styles.forgotPinContainer}
          >
            <  Text style={styles.forgotPinText}>
              {t('Forgot PIN?')}
            </  Text>
          </TouchableOpacity>
        </View>
        <Button
          title={t('Sign In')}
          onPress={handleFormSubmit}
          loading={loading}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>
      <TouchableOpacity onPress={() => router.push({ pathname: '/SignUp', params: { userType } })}>
        <  Text style={styles.signUpText}>
          {t("Don't Have Account")} <  Text style={styles.signUpHighlight}>{t('Create Account')}</  Text>
        </  Text>
      </TouchableOpacity>
      <Toast 
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onHide={() => setToastVisible(false)}
      />
    </  View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#61B15A',
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 30,
    marginTop: 20,
  },
  titleMain: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
    lineHeight: 42,
  },
  titleSub: {
    fontSize: 28,
    color: '#FFFFFF',
    paddingVertical: 10,
  },
  userType: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 32,
    marginTop: 5,
    paddingVertical: 15,
    lineHeight: 45,
    paddingHorizontal: 15,
    textAlign: 'center',
    minWidth: 150,
    borderRadius: 10,
    
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
    borderBottomWidth: 0,
    marginBottom: 15,
    width: '100%',
  },
  inputText: {
    color: '#FFFFFF',
    paddingLeft: 20,
    fontSize: 16,
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
  signUpText: {
    color: '#FFFFFF',
    marginTop: 20,
  },
  signUpHighlight: {
    color: '#FFC107',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'left',
    marginLeft: 15,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  countryCode: {
    color: '#FFFFFF',
    marginRight: 8,
    fontSize: 16,
  },
  separator: {
    height: 20,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 10,
  },
  forgotPinContainer: {
    alignItems: 'flex-end',
    paddingRight: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  forgotPinText: {
    color: '#FFC107',
    fontSize: 14,
    textDecorationLine: 'underline',
    textDecorationColor: '#FFC107',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    marginLeft:5

  },
  labelRTL: {
    textAlign: 'right', // Align text to the right for Urdu
    marginRight: 10,
  },
});

export default SignIn;
