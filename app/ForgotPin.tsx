"use client"

import { useState } from "react"
import { StyleSheet, TouchableOpacity, View, Alert, Text } from "react-native"
import { useRouter } from "expo-router"
import { Input, Button, Icon } from "react-native-elements"
import { useTranslation } from "react-i18next"

const ForgotPin = () => {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { t } = useTranslation()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Add email state and update the UI to use email instead of phone number
  const [email, setEmail] = useState("")

  // Replace the phone number validation with email validation
  const validateEmail = (text: string) => {
    setEmail(text)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(text.trim())) {
      setErrorMessage(t("Invalid email format"))
    } else {
      setErrorMessage("")
    }
  }

  // Update handleSubmit to use email
  const handleSubmit = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setToastVisible(true)
      setToastMessage(t("Please enter a valid email address"))
      return
    }

    Alert.alert(t("Confirm"), t("Are you sure you want to send PIN reset instructions to ") + email + "?", [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Yes"),
        onPress: () => {
          // Here you would typically make an API call to send the reset email
          router.push("/VerifyEmailScreen")
        },
      },
    ])
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" type="material" color="#FFC107" size={30} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>{t("Forgot PIN")}</Text>
        <Text style={styles.titleSub}>{t("Enter your registered phone number")}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          {/* Replace the phone number input with email input */}
          <Input
            placeholder={t("Enter your email")}
            onChangeText={validateEmail}
            value={email}
            keyboardType="email-address"
            leftIcon={
              <View style={styles.iconContainer}>
                <Icon name="email" type="material" color="#FFFFFF" />
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
          title={t("Send PIN")}
          onPress={handleSubmit}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#61B15A",
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  titleMain: {
    fontSize: 30,
    color: "#FFC107",
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: 42,
  },
  titleSub: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 10,
  },

  form: {
    width: "100%",
    marginBottom: 20,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 15,
    width: "100%",
  },
  inputText: {
    color: "#FFFFFF",
    paddingLeft: 20,
    fontSize: 16,
  },
  inputField: {
    borderBottomWidth: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 50,
    width: "100%",
  },
  buttonContainer: {
    marginTop: 20,
    width: "80%",
    left: "10%",
  },
  button: {
    backgroundColor: "#FFC107",
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonTitle: {
    color: "#1B5E20",
    fontWeight: "bold",
    fontSize: 20,
  },

  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "white",
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
    color: "red",
    marginTop: 5,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  countryCode: {
    color: "#FFFFFF",
    marginRight: 8,
    fontSize: 16,
  },
  separator: {
    height: 20,
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 10,
  },
})

export default ForgotPin
