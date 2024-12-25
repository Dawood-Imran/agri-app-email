import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Alert , Text} from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button, Icon } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { Toast } from './components/Toast';

const ForgotPin = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  const validatePhoneNumber = (text: string) => {
    const cleanedText = text.replace(/[\s-]/g, '');
    
    if (cleanedText.length <= 10 && (!cleanedText.length || cleanedText.startsWith('3'))) {
      setPhoneNumber(cleanedText);
      setErrorMessage('');
    } else if (cleanedText.length > 10) {
      
      setToastVisible(true);
      setToastMessage(t('Phone number cannot exceed 10 digits'));

    } else if (!cleanedText.startsWith('3')) {
      
      setToastVisible(true);
      setToastMessage(t('Phone number must start with 3'));
    }
  };

  const handleSubmit = () => {
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {

      setToastVisible(true);
      setToastMessage(t('Please enter a valid phone number'));
      return;
    }

    Alert.alert(
      t('Confirm'),
      t('Are you sure you want to send PIN code to +92') + phoneNumber + '?',
      [
        {
          text: t('Cancel'),
          style: 'cancel'
        },
        {
          text: t('Yes'),
          onPress: () => {
            // Here you would typically make an API call to send the PIN
            router.push('/VerifyPin');
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <  View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" type="material" color="#FFC107" size={30} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <  Text style={styles.titleMain}>{t('Forgot PIN')}</  Text>
        <  Text style={styles.titleSub}>
          {t('Enter your registered phone number')}
        </  Text>
      </View>

      <View style={styles.form}>
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
        </View>

        <Button
          title={t('Send PIN')}
          onPress={handleSubmit}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>
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
        marginBottom: 40,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 30,
      },
      titleMain: {
        fontSize: 30,
        color: '#FFC107',
        fontWeight: 'bold',
        marginBottom: 10,
        lineHeight: 42,
      },
      titleSub: {
        fontSize: 20,
        color: '#FFFFFF',
        marginTop: 10,
      },
      
      form: {
        width: '100%',
        marginBottom: 20,
      },
      inputContainer: {
        position: 'relative',
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
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 10,
        height: 50,
        width: '100%',
      },
      buttonContainer: {
        marginTop: 20,
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
});

export default ForgotPin; 