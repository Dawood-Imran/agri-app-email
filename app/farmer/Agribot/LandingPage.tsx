import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next"; // Import i18n hook
import { useNavigation } from "@react-navigation/native";

const LandingPage = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // Access translations

  // Define options with translation keys
  const options = [
    { title: t("landing.options.plantDiseases"), screen: "PlantDiseases" },
    { title: t("landing.options.cropAdvice"), screen: "CropAdvice" },
    { title: t("landing.options.pestControl"), screen: "PestControl" },
    { title: t("landing.options.fieldManagement"), screen: "FieldManagement" },
  ];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../../assets/images/farmer-icons/agribot-logo-1.png")} // Adjust the path as necessary
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>{t("landing.title")}</Text>

      {/* Options Container */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => navigation.navigate(option.screen as never)}
          >
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: "contain",
    backgroundColor: "#333348",
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  optionsContainer: {
    width: "80%",
  },
  optionButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default LandingPage;