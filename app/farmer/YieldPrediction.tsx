"use client"

import { useEffect, useState, useCallback } from "react"
import { StyleSheet, ScrollView, Text, View, Dimensions, ActivityIndicator } from "react-native"
import { Button } from "react-native-elements"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"
import { LineChart } from "react-native-chart-kit"
import MapView, { Marker } from "react-native-maps"
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { type FieldData, useFields } from "../hooks/useFields"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Toast from "../components/Toast"
import { getAuth } from "firebase/auth"

// First, let's add a mapping for rounds to months (September to April, 2 rounds per month)
const ROUND_TO_MONTH_MAPPING = [
  { month: "Sep", round: 1 },
  { month: "Sep", round: 2 },
  { month: "Oct", round: 3 },
  { month: "Oct", round: 4 },
  { month: "Nov", round: 5 },
  { month: "Nov", round: 6 },
  { month: "Dec", round: 7 },
  { month: "Dec", round: 8 },
  { month: "Jan", round: 9 },
  { month: "Jan", round: 10 },
  { month: "Feb", round: 11 },
  { month: "Feb", round: 12 },
  { month: "Mar", round: 13 },
  { month: "Mar", round: 14 },
  { month: "Apr", round: 15 },
  { month: "Apr", round: 16 },
]

interface YieldPredictionData {
  fieldId: string
  fieldSize: number
  cropType: string
  sowingDate: Date
  latitude: number
  longitude: number
  daysRemaining: number
  currentRound: number
  predictedYield: number // in maunds
  actualYield?: number // in maunds
  cityAverage?: number // in maunds per acre
  totalCityAverage?: number // total maunds for the field
  city?: string
  predictionHistory: {
    round: number
    date: Date
    predictedYield: number
    actualYield?: number
    weatherConditions: string
    yieldChange: "Increased" | "Decreased" | "Stable" | "N/A"
  }[]
}

// City average wheat yields in maunds per acre
const CITY_AVERAGE_YIELDS = {
  Lahore: 42,
  Faisalabad: 41,
  Rawalpindi: 38,
  Gujranwala: 43,
  Multan: 39,
  Sargodha: 40,
  Sialkot: 41,
  Bahawalpur: 37,
  Sahiwal: 40,
  Sheikhupura: 42,
  Jhang: 38,
  "Rahim Yar Khan": 36,
  Kasur: 41,
  Okara: 39,
  Default: 38,
}

const YieldPrediction = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { fields, loading } = useFields()
  const [wheatField, setWheatField] = useState<FieldData | null>(null)
  const [predictionData, setPredictionData] = useState<YieldPredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataInitialized, setDataInitialized] = useState(false)
  const [userCity, setUserCity] = useState<string | null>(null)
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean
    message: string
    type: "success" | "error" | "info"
  }>({
    visible: false,
    message: "",
    type: "error",
  })

  const showToast = (message: string, type: "success" | "error" | "info" = "error") => {
    setToastConfig({
      visible: true,
      message,
      type,
    })
  }

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }))
  }

  // Fetch user's city from Firestore
  const fetchUserCity = useCallback(async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return null

      const userDoc = await getDoc(doc(db, "farmer", user.uid))
      if (userDoc.exists() && userDoc.data().city) {
        setUserCity(userDoc.data().city)
        return userDoc.data().city
      }
      return null
    } catch (error) {
      console.error("Error fetching user city:", error)
      return null
    }
  }, [])

  const initializeData = useCallback(async () => {
    if (dataInitialized) return

    if (!loading && fields && fields.length > 0) {
      console.log("Fields data received:", fields)
      const wheatFieldData = fields.find((field) => field.cropType.toLowerCase() === "wheat")

      if (wheatFieldData) {
        console.log("Found wheat field:", wheatFieldData)
        setWheatField(wheatFieldData)

        // Fetch user's city
        const city = await fetchUserCity()

        // Pass wheatFieldData directly to fetchYieldPrediction
        await fetchYieldPrediction(wheatFieldData.id, city, wheatFieldData)
        setDataInitialized(true)
      } else {
        console.log("No wheat field found in fields data")
        setWheatField(null)
        setIsLoading(false)
        setDataInitialized(true)
      }
    } else if (!loading) {
      // If fields are loaded but empty
      setIsLoading(false)
      setDataInitialized(true)
    }
  }, [fields, loading, dataInitialized, fetchUserCity])

  useEffect(() => {
    initializeData()
  }, [initializeData])

  // Reset dataInitialized when component unmounts
  useEffect(() => {
    return () => {
      setDataInitialized(false)
    }
  }, [])

  useEffect(() => {
    console.log("Current wheatField state:", wheatField)
  }, [wheatField])

  const fetchYieldPrediction = async (fieldId: string, city: string | null, fieldData?: FieldData) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("Please sign in to view predictions")
      }

      if (!fieldId) {
        throw new Error("Field ID is required")
      }

      // Use the passed fieldData or fall back to wheatField state
      const currentFieldData = fieldData || wheatField

      if (!currentFieldData) {
        throw new Error("No wheat field data available")
      }

      // Fetch from fields/{fieldId}/predictions/current
      const predictionRef = doc(db, "fields", fieldId, "predictions", "current")
      const predictionDoc = await getDoc(predictionRef)

      if (predictionDoc.exists()) {
        const data = predictionDoc.data() as YieldPredictionData

        // Add city average if it exists in the document or if we have the user's city
        const cityToUse = data.city || city
        const cityAverage = cityToUse ? CITY_AVERAGE_YIELDS[cityToUse] || CITY_AVERAGE_YIELDS.Default : null
        const totalCityAverage = cityAverage ? cityAverage * Number(currentFieldData.areaInAcres) : null

        setPredictionData({
          ...data,
          sowingDate: data.sowingDate instanceof Timestamp ? data.sowingDate.toDate() : data.sowingDate,
          cityAverage: cityAverage,
          totalCityAverage: totalCityAverage,
          city: cityToUse,
          predictionHistory: data.predictionHistory.map((history) => ({
            ...history,
            date: history.date instanceof Timestamp ? history.date.toDate() : history.date,
          })),
        })
      } else {
        // Initialize with sample data for new prediction
        // Get city average if available
        const cityAverage = city ? CITY_AVERAGE_YIELDS[city] || CITY_AVERAGE_YIELDS.Default : null
        const totalCityAverage = cityAverage ? cityAverage * Number(currentFieldData.areaInAcres) : null

        // Base prediction on field size and city average with a slight randomization
        const baseYield = totalCityAverage || Number(currentFieldData.areaInAcres) * 38 // Default to 38 if no city average
        const initialPrediction = baseYield + (Math.random() * 10 - 5) // +/- 5 maunds variation

        const sampleData: YieldPredictionData = {
          fieldId: fieldId,
          fieldSize: Number(currentFieldData.areaInAcres),
          cropType: "Wheat",
          sowingDate: currentFieldData.sowingDate,
          latitude: currentFieldData.latitude || 0,
          longitude: currentFieldData.longitude || 0,
          daysRemaining: 15,
          currentRound: 1,
          predictedYield: Math.round(initialPrediction),
          cityAverage: cityAverage,
          totalCityAverage: totalCityAverage,
          city: city,
          predictionHistory: [
            {
              round: 1,
              date: new Date(),
              predictedYield: Math.round(initialPrediction),
              weatherConditions: "Sunny",
              yieldChange: "N/A",
            },
          ],
        }

        try {
          await setDoc(predictionRef, {
            ...sampleData,
            sowingDate: Timestamp.fromDate(sampleData.sowingDate),
            predictionHistory: sampleData.predictionHistory.map((history) => ({
              ...history,
              date: Timestamp.fromDate(history.date),
            })),
          })
          setPredictionData(sampleData)
          showToast("Initial prediction data created successfully", "success")
        } catch (error) {
          console.error("Error creating initial prediction:", error)
          throw error
        }
      }
    } catch (error) {
      console.error("Error in fetchYieldPrediction:", error)
      showToast(error instanceof Error ? error.message : "Error fetching yield prediction")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrediction = async () => {
    if (!predictionData || !wheatField) {
      showToast("No field data available for prediction")
      return
    }

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Get the current round and calculate the next round
      const currentRound = predictionData.currentRound
      const nextRound = currentRound < 16 ? currentRound + 1 : 16 // Cap at 16 rounds (Apr round 2)

      // Generate a new yield prediction with slight variations based on the previous prediction
      const lastPrediction =
        predictionData.predictionHistory[predictionData.predictionHistory.length - 1].predictedYield

      // Random adjustment between -5% and +8%
      const changePercentage = Math.random() * 13 - 5
      const newYield = Math.round(lastPrediction * (1 + changePercentage / 100))

      // Determine weather condition and yield change type
      const weatherConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Drought"]
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]

      let yieldChange: "Increased" | "Decreased" | "Stable" = "Stable"
      if (newYield > lastPrediction) yieldChange = "Increased"
      else if (newYield < lastPrediction) yieldChange = "Decreased"

      const newPrediction = {
        round: nextRound,
        date: new Date(),
        predictedYield: newYield,
        weatherConditions: randomWeather,
        yieldChange: yieldChange,
      }

      const updatedData = {
        ...predictionData,
        daysRemaining: Math.max(0, predictionData.daysRemaining - 5),
        currentRound: nextRound,
        predictedYield: newYield,
        predictionHistory: [...predictionData.predictionHistory, newPrediction],
      }

      // Update the prediction document
      const predictionRef = doc(db, "fields", wheatField.id, "predictions", "current")
      await updateDoc(predictionRef, {
        ...updatedData,
        predictionHistory: updatedData.predictionHistory.map((history) => ({
          ...history,
          date: history.date instanceof Date ? Timestamp.fromDate(history.date) : history.date,
        })),
      })
      setPredictionData(updatedData)
      showToast("Prediction updated successfully", "success")
    } catch (error) {
      console.error("Error updating prediction:", error)
      showToast("Failed to update prediction")
    }
  }

  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8A41" />
      </View>
    )
  }

  if (!wheatField) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="sprout" size={80} color="#DEA82A" />
          <Text style={styles.emptyStateTitle}>{t("No Wheat Fields Found")}</Text>
          <Text style={styles.emptyStateText}>{t("Please add wheat field details to make yield predictions")}</Text>
          <Button
            title={t("Add Wheat Field")}
            onPress={() => router.push("/farmer/FieldDetails")}
            buttonStyle={styles.addFieldButton}
            titleStyle={styles.addFieldButtonTitle}
            containerStyle={styles.addFieldButtonContainer}
            icon={<MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, i18n.language === "ur" && styles.rtlText]}>
            {t("Wheat Yield Prediction")}
          </Text>
        </View>

        {/* Map Section */}
        <View style={[styles.mapContainer, styles.cardShadow]}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: wheatField?.latitude || 31.5204,
              longitude: wheatField?.longitude || 74.3587,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {wheatField && (
              <Marker
                coordinate={{
                  latitude: wheatField.latitude || 31.5204,
                  longitude: wheatField.longitude || 74.3587,
                }}
                title={`Wheat Field`}
                description={`${wheatField.areaInAcres} acres`}
                pinColor="#3A8A41"
              />
            )}
          </MapView>
        </View>

        {predictionData && wheatField && (
          <View style={[styles.predictionCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="sprout" size={24} color="#DEA82A" />
              <Text style={[styles.cardTitle, i18n.language === "ur" && styles.rtlText]}>{t("Field Details")}</Text>
            </View>
            <View style={styles.fieldDetailsContainer}>
              <View style={[styles.detailRow, i18n.language === "ur" && styles.rtlRow]}>
                <MaterialCommunityIcons name="ruler" size={20} color="#666" />
                <Text style={[styles.detailLabel, i18n.language === "ur" && styles.rtlText]}>{t("Area")}:</Text>
                <Text style={[styles.detailValue, i18n.language === "ur" && styles.rtlText]}>
                  {wheatField.areaInAcres} {t("acres")}
                </Text>
              </View>

              <View style={[styles.detailRow, i18n.language === "ur" && styles.rtlRow]}>
                <MaterialCommunityIcons name="sprout" size={20} color="#666" />
                <Text style={[styles.detailLabel, i18n.language === "ur" && styles.rtlText]}>{t("Crop Type")}:</Text>
                <Text style={[styles.detailValue, i18n.language === "ur" && styles.rtlText]}>
                  {t(wheatField.cropType)}
                </Text>
              </View>

              <View style={[styles.detailRow, i18n.language === "ur" && styles.rtlRow]}>
                <MaterialCommunityIcons name="water" size={20} color="#666" />
                <Text style={[styles.detailLabel, i18n.language === "ur" && styles.rtlText]}>{t("Soil Type")}:</Text>
                <Text style={[styles.detailValue, i18n.language === "ur" && styles.rtlText]}>
                  {t(wheatField.soilType)}
                </Text>
              </View>

              <View style={[styles.detailRow, i18n.language === "ur" && styles.rtlRow]}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={[styles.detailLabel, i18n.language === "ur" && styles.rtlText]}>{t("Sowing Date")}:</Text>
                <Text style={[styles.detailValue, i18n.language === "ur" && styles.rtlText]}>
                  {wheatField.sowingDate.toLocaleDateString()}
                </Text>
              </View>

              {predictionData.city && (
                <View style={[styles.detailRow, i18n.language === "ur" && styles.rtlRow]}>
                  <MaterialCommunityIcons name="city" size={20} color="#666" />
                  <Text style={[styles.detailLabel, i18n.language === "ur" && styles.rtlText]}>{t("City")}:</Text>
                  <Text style={[styles.detailValue, i18n.language === "ur" && styles.rtlText]}>
                    {t(predictionData.city)}
                  </Text>
                </View>
              )}

              {wheatField.latitude && wheatField.longitude && (
                <View style={[styles.detailRow, i18n.language === "ur" && styles.rtlRow]}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                  <Text style={[styles.detailLabel, i18n.language === "ur" && styles.rtlText]}>{t("Location")}:</Text>
                  <Text style={[styles.detailValue, i18n.language === "ur" && styles.rtlText]}>
                    {wheatField.latitude.toFixed(4)}, {wheatField.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {predictionData && (
          <View style={[styles.predictionCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#3A8A41" />
              <Text style={[styles.cardTitle, i18n.language === "ur" && styles.rtlText]}>{t("Estimated Yield")}</Text>
            </View>
            <View style={styles.yieldContainer}>
              <Text style={styles.yieldValue}>
                {predictionData.predictedYield} {t("maunds")}
              </Text>

              {predictionData.cityAverage && predictionData.totalCityAverage && (
                <View style={styles.yieldComparisonContainer}>
                  {predictionData.predictedYield > predictionData.totalCityAverage ? (
                    <MaterialCommunityIcons name="arrow-up" size={24} color="#3A8A41" />
                  ) : (
                    <MaterialCommunityIcons name="arrow-down" size={24} color="#E74C3C" />
                  )}
                  <Text
                    style={[
                      styles.yieldComparison,
                      i18n.language === "ur" && styles.rtlText,
                      {
                        color: predictionData.predictedYield > predictionData.totalCityAverage ? "#3A8A41" : "#E74C3C",
                      },
                    ]}
                  >
                    {Math.abs(Math.round((predictionData.predictedYield / predictionData.totalCityAverage - 1) * 100))}%{" "}
                    {predictionData.predictedYield > predictionData.totalCityAverage
                      ? t("higher than city average")
                      : t("lower than city average")}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.yieldMetricsContainer}>
                {predictionData.cityAverage && (
                  <View style={styles.yieldMetric}>
                    <Text style={[styles.metricLabel, i18n.language === "ur" && styles.rtlText]}>
                      {t("City Average (per acre)")}
                    </Text>
                    <Text style={[styles.metricValue, i18n.language === "ur" && styles.rtlText]}>
                      {predictionData.cityAverage} {t("maunds")}
                    </Text>
                  </View>
                )}

                {predictionData.totalCityAverage && (
                  <View style={styles.yieldMetric}>
                    <Text style={[styles.metricLabel, i18n.language === "ur" && styles.rtlText]}>
                      {t("Total City Average")}
                    </Text>
                    <Text style={[styles.metricValue, i18n.language === "ur" && styles.rtlText]}>
                      {predictionData.totalCityAverage} {t("maunds")}
                    </Text>
                  </View>
                )}

                <View style={styles.yieldMetric}>
                  <Text style={[styles.metricLabel, i18n.language === "ur" && styles.rtlText]}>
                    {t("Total Field Size")}
                  </Text>
                  <Text style={[styles.metricValue, i18n.language === "ur" && styles.rtlText]}>
                    {predictionData.fieldSize} {t("acres")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {predictionData && (
          <View style={[styles.graphCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="chart-areaspline" size={24} color="#3A8A41" />
              <Text style={[styles.cardTitle, i18n.language === "ur" && styles.rtlText]}>
                {t("Yield Forecast Trend")}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: predictionData.predictionHistory.map((p) => {
                    const roundInfo = ROUND_TO_MONTH_MAPPING.find((item) => item.round === p.round) || {
                      month: "Sep",
                      round: 1,
                    }
                    return `${roundInfo.month}\nR${p.round}`
                  }),
                  datasets: [
                    {
                      data: predictionData.predictionHistory.map((p) => p.predictedYield),
                      color: (opacity = 1) => `rgba(58, 138, 65, ${opacity})`,
                      strokeWidth: 2,
                    },
                    ...(predictionData.totalCityAverage
                      ? [
                          {
                            data: Array(predictionData.predictionHistory.length).fill(predictionData.totalCityAverage),
                            color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
                            strokeWidth: 2,
                            withDots: false,
                          },
                        ]
                      : []),
                  ],
                  legend: predictionData.totalCityAverage ? ["Predicted Yield", "City Average"] : ["Predicted Yield"],
                }}
                width={Math.max(Dimensions.get("window").width - 40, predictionData.predictionHistory.length * 60)}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#3A8A41",
                  },
                  propsForLabels: {
                    fontSize: 9,
                    rotation: 0,
                  },
                }}
                bezier
                style={styles.chart}
                fromZero
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withShadow={false}
                withDots={true}
                withScrollableDot={false}
                verticalLabelRotation={0}
                horizontalLabelRotation={0}
                xLabelsOffset={0}
                yLabelsOffset={8}
                segments={5}
              />
            </ScrollView>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#3A8A41" }]} />
                <Text style={[styles.legendText, i18n.language === "ur" && styles.rtlText]}>
                  {t("Predicted Yield")}
                </Text>
              </View>
              {predictionData.totalCityAverage && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#4285F4" }]} />
                  <Text style={[styles.legendText, i18n.language === "ur" && styles.rtlText]}>{t("City Average")}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Days Remaining and Prediction Button */}
        {predictionData && (
          <View style={[styles.daysCard, styles.cardShadow]}>
            <View style={styles.daysRemaining}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#3A8A41" />
              <Text style={[styles.daysText, i18n.language === "ur" && styles.rtlText]}>
                {t("Days Until Next Prediction")}: {predictionData.daysRemaining}
              </Text>
            </View>
            <Button
              title={predictionData.daysRemaining > 0 ? t("Predict Now") : t("Update Prediction")}
              onPress={handlePrediction}
              buttonStyle={styles.predictButton}
              titleStyle={[styles.buttonTitle, i18n.language === "ur" && styles.rtlText]}
              containerStyle={styles.predictButtonContainer}
              icon={<MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />}
            />
          </View>
        )}

        {/* Previous Predictions */}
        {predictionData && predictionData.predictionHistory.length > 0 && (
          <View style={[styles.historyCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="history" size={24} color="#3A8A41" />
              <Text style={[styles.cardTitle, i18n.language === "ur" && styles.rtlText]}>
                {t("Prediction History")}
              </Text>
            </View>
            <View style={[styles.historyHeaderRow, i18n.language === "ur" && styles.rtlRow]}>
              <Text style={[styles.historyHeaderDate, i18n.language === "ur" && styles.rtlText]}>{t("Date")}</Text>
              <Text style={[styles.historyHeaderYield, i18n.language === "ur" && styles.rtlText]}>
                {t("Yield (maunds)")}
              </Text>
              <Text style={[styles.historyHeaderTrend, i18n.language === "ur" && styles.rtlText]}>{t("Trend")}</Text>
            </View>
            {predictionData.predictionHistory
              .slice()
              .reverse()
              .map((prediction, index) => (
                <View key={index} style={[styles.historyItem, i18n.language === "ur" && styles.rtlRow]}>
                  <Text style={[styles.historyDate, i18n.language === "ur" && styles.rtlText]}>
                    {prediction.date.toLocaleDateString()}
                  </Text>
                  <Text style={[styles.historyYield, i18n.language === "ur" && styles.rtlText]}>
                    {prediction.predictedYield}
                  </Text>
                  <View style={[styles.trendContainer, i18n.language === "ur" && { justifyContent: "flex-start" }]}>
                    {prediction.yieldChange !== "N/A" && (
                      <MaterialCommunityIcons
                        name={
                          prediction.yieldChange === "Increased"
                            ? "trending-up"
                            : prediction.yieldChange === "Decreased"
                              ? "trending-down"
                              : "trending-neutral"
                        }
                        size={18}
                        color={
                          prediction.yieldChange === "Increased"
                            ? "#3A8A41"
                            : prediction.yieldChange === "Decreased"
                              ? "#E74C3C"
                              : "#F39C12"
                        }
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.historyTrend,
                        i18n.language === "ur" && styles.rtlText,
                        {
                          color:
                            prediction.yieldChange === "Increased"
                              ? "#3A8A41"
                              : prediction.yieldChange === "Decreased"
                                ? "#E74C3C"
                                : prediction.yieldChange === "Stable"
                                  ? "#F39C12"
                                  : "#666666",
                        },
                      ]}
                    >
                      {t(prediction.yieldChange)}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
      <Toast visible={toastConfig.visible} message={toastConfig.message} type={toastConfig.type} onHide={hideToast} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  predictionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 8,
  },
  yieldContainer: {
    paddingVertical: 12,
  },
  yieldValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3A8A41",
    textAlign: "center",
    marginBottom: 8,
  },
  yieldComparisonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  yieldComparison: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 12,
  },
  yieldMetricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    flexWrap: "wrap",
  },
  yieldMetric: {
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  graphCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  chart: {
    marginVertical: 12,
    borderRadius: 12,
    paddingRight: 20, // Add padding to prevent overflow
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666666",
  },
  daysCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  daysRemaining: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  daysText: {
    fontSize: 18,
    color: "#333333",
    fontWeight: "500",
    marginLeft: 8,
  },
  predictButton: {
    backgroundColor: "#3A8A41",
    borderRadius: 8,
    paddingVertical: 12,
  },
  predictButtonContainer: {
    marginTop: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    marginBottom: 4,
  },
  historyHeaderDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  historyHeaderYield: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  historyHeaderTrend: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textAlign: "right",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  historyDate: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
  },
  historyYield: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    textAlign: "center",
  },
  trendContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  historyTrend: {
    fontSize: 14,
    textAlign: "right",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  addFieldButton: {
    backgroundColor: "#3A8A41",
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  addFieldButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  addFieldButtonContainer: {
    width: "80%",
    marginTop: 16,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  fieldDetailsContainer: {
    marginTop: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666666",
    width: 100,
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
  },
  rtlText: {
    textAlign: "right",
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
})

export default YieldPrediction
