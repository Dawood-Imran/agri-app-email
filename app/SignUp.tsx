import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Image, Alert , Text} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input, Button, Icon } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Correct import for MaterialCommunityIcons
import { Toast } from './components/Toast';

const { width } = Dimensions.get('window'); // Get screen width

const SignUp = () => {
  const { userType } = useLocalSearchParams<{ userType: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [confirmPinCode, setConfirmPinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t, i18n } = useTranslation();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [email, setEmail] = useState('');

  const isRTL = i18n.language === 'ur';

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const validateForm = () => {
    setErrorMessage(''); // Reset error message
    if (!name.trim()) {
      showToast(t('Name Required'));
      return false;
    }
    if (!email.trim()) {
      showToast(t('Email Required'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast(t('Invalid Email'));
      return false;
    }
    if (pinCode.length !== 4 || !/^\d+$/.test(pinCode.trim())) {
      showToast(t('Pin Code Must Be 4 Digits'));
      return false;
    }
    if (pinCode !== confirmPinCode) {
      showToast(t('Pins Must Match'));
      return false;
    }
    return true;
  };

  

  const handleSignUp = async () => {
    setLoading(true); // Start loading
    // Simulate an API call
    setTimeout(() => {
      setLoading(false); // Stop loading
      if (validateForm()) {
        Alert.alert(
          t('Confirm'),
          t('Are you sure you want to create an account with phone number +92') + phoneNumber + '?',
          [
            {
              text: t('Cancel'),
              style: 'cancel'
            },
            {
              text: t('Yes'),
              onPress: () => {
                alert(t('Account Created Successfully'));
                router.replace({ pathname: '/SignIn', params: { userType } });
              }
            }
          ]
        );
      }
    }, 2000);
  };

  const handleBack = () => {
    router.push({ pathname: '/SignIn', params: { userType } });
  };

  return (
    <  View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" type="material" color="#FFC107" size={30} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <  Text style={styles.titleMain}>{t('Create Account')}</  Text>
        {userType && (
          <  Text style={styles.titleSub}>
            {t('as')} <  Text style={styles.userType}>
              {t(userType.toLowerCase())}
            </  Text>
          </  Text>
        )}
      </View>
      <View style={styles.form}>
        <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Name')}</Text>
        <Input
          placeholder={t('Name')}
          onChangeText={setName}
          value={name}
          leftIcon={
            <View style={styles.iconContainer}>
              <Icon name="person" type="material" color="#FFFFFF" />
              <View style={styles.separator} />
            </View>
          }
          containerStyle={styles.inputWrapper}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
        />
        {/* <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Phone Number')}</Text>
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
          containerStyle={styles.inputWrapper}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
          errorMessage={errorMessage}
          errorStyle={styles.errorText}
        /> */}
      
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
                containerStyle={styles.inputWrapper}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#E0E0E0"
                underlineColorAndroid="transparent"
                
              />



        <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Pin Code')}</Text>
        <Input
          placeholder={t("Enter Pin Code")}
          onChangeText={(text) => {
            if (text.length <= 4) {
              setPinCode(text);
            }
          }}
          value={pinCode}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          leftIcon={
            <View style={styles.iconContainer}>
              <Icon name="lock" type="material" color="#FFFFFF" />
              <View style={styles.separator} />
            </View>
          }
          containerStyle={styles.inputWrapper}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
        />
        <Text style={[styles.label, isRTL && styles.labelRTL]}>{t('Confirm Pin Code')}</Text>
        <Input
          placeholder={t("Confirm Pin Code")}
          onChangeText={(text) => {
            if (text.length <= 4) {
              setConfirmPinCode(text);
            }
          }}
          value={confirmPinCode}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          leftIcon={
            <View style={styles.iconContainer}>
              <Icon name="lock" type="material" color="#FFFFFF" />
              <View style={styles.separator} />
            </View>
          }
          containerStyle={styles.inputWrapper}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor="#E0E0E0"
        />
        <Button
          title={t('Create Account')}
          onPress={handleSignUp}
          loading={loading} // Show loader
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>
      <TouchableOpacity onPress={() => router.push({ pathname: '/SignIn', params: { userType } })}>
        <  Text style={styles.signInText}>
          {t('Already Have Account')} <  Text style={styles.signInHighlight}>{t('Sign In')}</  Text>
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
    
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  titleMain: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    
    lineHeight: 42,
  },
  titleSub: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: 5,
    paddingVertical: 10,
  },
  userType: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 32,
    
    paddingVertical: 10,
    lineHeight: 45,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  form: {
    width: '100%',
    
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    
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
  labelRTL: {
    textAlign: 'right', 
    marginRight: 10,
  },
  signInText: {
    color: '#FFFFFF',
    marginTop: 20,
  },
  signInHighlight: {
    color: '#FFC107',
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
    color: 'red',
    marginTop: 5,
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
  inputWrapper: {
    width: '100%',
    paddingHorizontal: 0,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    marginLeft:5
  },
});

export default SignUp;
