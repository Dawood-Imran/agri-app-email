import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Image, Alert, ImageBackground , Text} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input, Button, Icon } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { Toast } from './components/Toast';
import {useAuth} from './context/AuthContext';
import { db, my_auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomToast } from './components/CustomToast';

const { width } = Dimensions.get('window'); // Get screen width

const SignIn = () => {
  const { userType } = useLocalSearchParams<{ userType: string }>();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
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

      if (!userType) {
        showToast(t('Please select user type'));
        setLoading(false);
        return;
      }

      const response = await signInWithEmailAndPassword(my_auth, email, pinCode);
      showToast(t('Sign-in successful'));
      console.log("Sign-in successful:", response.user.uid);

      // Check user document first
      const userDoc = await getDoc(doc(db, userType.toLowerCase(), response.user.uid));
      
      if (!userDoc.exists()) {
        showToast(t('User document not found'));
        setLoading(false);
        return;
      }

      // Store auth state
      await AsyncStorage.setItem('userAuthenticated', 'true');
      await AsyncStorage.setItem('userType', userType);
      await AsyncStorage.setItem('userEmail', email);

      // Determine navigation based on user type and new user status
      let navigationTarget;
      const isNewUser = userDoc.data().isNewUser;

      switch (userType.toLowerCase()) {
        case 'farmer':
          navigationTarget = isNewUser ? '/farmer/NewUserForm' : '/farmer/dashboard';
          break;
        case 'expert':
          navigationTarget = isNewUser ? '/expert/NewExpert' : '/expert/dashboard';
          break;
        case 'buyer':
          navigationTarget = isNewUser ? '/buyer/NewBuyer' : '/buyer/dashboard';
          break;
        default:
          showToast(t('Invalid user type'));
          setLoading(false);
          return;
      }

      // Use requestAnimationFrame and setTimeout for safer navigation
      requestAnimationFrame(() => {
        setTimeout(() => {
          router.replace(navigationTarget as any);
        }, 100);
      });

    } catch (error: any) {
      console.error('Error:', error);
      let errMsg = t('An unexpected error occurred');

      if (error.code === 'auth/invalid-email') {
        errMsg = t('Invalid email address');
      } else if (error.code === 'auth/user-not-found') {
        errMsg = t('User not found');
      } else if (error.code === 'auth/wrong-password') {
        errMsg = t('Incorrect password');
      } else if (error.code === 'auth/invalid-credential') {
        errMsg = t('Invalid credentials');
      } else {
        errMsg = error.message || t('An unexpected error occurred');
      }

      showToast(errMsg);
    }
    finally {
      setLoading(false);
    }
  };

  {toastMessage && <CustomToast visible={true} message={toastMessage} type="error" />}
  
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" type="material" color="#FFC107" size={30} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>{t('Sign In')}</Text>
        {userType && (
          <Text style={styles.titleSub}>
            {t('as')}{' '}
            <Text style={styles.userType}>
              {t(userType.toLowerCase())}
            </Text>
          </Text>
        )}
      </View>
      <View style={styles.form} >
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
            <Text style={styles.forgotPinText}>
              {t('Forgot PIN?')}
            </Text>
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
        <Text style={styles.signUpText}>
          {t("Don't Have Account")} <Text style={styles.signUpHighlight}>{t('Create Account')}</Text>
        </Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 30,
    marginTop: 20,
  },
  titleMain: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
    lineHeight: 44,
  },
  titleSub: {
    fontSize: 30,
    color: '#FFFFFF',
    paddingVertical: 10,
  },
  userType: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 34,
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
    fontSize: 18,
  },
  inputField: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 53,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 10,
    width: '60%',
    left: '20%',
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
    marginLeft: 5
  },
  labelRTL: {
    textAlign: 'right',
    marginRight: 10,
  },
});

export default SignIn;
