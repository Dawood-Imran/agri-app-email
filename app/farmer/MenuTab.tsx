import React, { useState, useEffect , useCallback} from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, TouchableOpacity, ImageBackground, Image , Text, Alert } from 'react-native';
import { Card, Icon } from 'react-native-elements';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserProvider';


const API_KEY = "33e96491c93c4bb88bc130136241209";  // Replace with your WeatherAPI key
const BASE_URL = "http://api.weatherapi.com/v1/current.json";

interface WeatherData {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
    humidity: number;
    wind_kph: number;
  };
}



const MenuTab = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { userName, userType, email , city , isLoading , reloadUser} = useUser(); 



useEffect(() => {
  if (!isLoading && city) {
    fetchWeather();
    console.log('Farmer Data Menu Tab:', userName, userType, email, city);
  }
}, [isLoading, city]);




const fetchWeather = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${city}&aqi=no`);
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    const data = await response.json();
    setWeatherData(data);
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    Alert.alert('Weather Fetch Error', 'Unable to fetch weather data. Please try again later.');
  } finally {
    setLoading(false);
  }
};


  const handleReload = () => {
    reloadUser();
  };

 

  const getWeatherIcon = (condition: string): string => {
    const iconMap: { [key: string]: string } = {
      'Sunny': 'sun',
      'Clear': 'moon',
      'Partly cloudy': 'cloud',
      'Cloudy': 'cloud',
      'Overcast': 'cloud',
      'Mist': 'cloud',
      'Patchy rain possible': 'cloud-rain',
      'Patchy snow possible': 'cloud-snow',
      'Patchy sleet possible': 'cloud-sleet',
      'Patchy freezing drizzle possible': 'cloud-drizzle',
      'Thundery outbreaks possible': 'cloud-lightning',
      'Blowing snow': 'wind',
      'Blizzard': 'wind',
      'Fog': 'cloud',
      'Freezing fog': 'cloud',
      // ... other mappings
    };

    return iconMap[condition] || 'cloud'; // Default to 'cloud' if condition is not found
  };
 
  const features = [
    { 
      name: t('yieldPrediction'), 
      icon: require('../../assets/images/farmer-icons/yield.png'), 
      route: '/farmer/YieldPrediction' 
    },
    { 
      name: t('expertConsultation'), 
      icon: require('../../assets/images/farmer-icons/telemarketing.png'), 
      route: '/farmer/ExpertConsultation' 
    },
    { 
      name: t('auctionSystem'), 
      icon: require('../../assets/images/farmer-icons/auction.png'), 
      route: '/farmer/AuctionSystem' 
    },
    { 
      name: t('Field Details'), 
      icon: require('../../assets/images/farmer-icons/wheat.png'), 
      route: '/farmer/FieldDetails'
    },
    { 
      name: t('agricultureSchemes'), 
      icon: require('../../assets/images/farmer-icons/manager.png'), 
      route: '/farmer/SchemesList' 
    },
    { 
      name: t('Agri Bot'),
      icon: require('../../assets/images/farmer-icons/chatbot-logo.png'),
      route: '/farmer/Agribot/LandingPage'
    }
  ];

  if (isLoading || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
        <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const conditionText = weatherData?.current?.condition?.text || t('noData');
  const temperature = weatherData?.current?.temp_c !== undefined ? `${weatherData.current.temp_c}°C` : '--';
  const humidity = weatherData?.current?.humidity !== undefined ? `${weatherData.current.humidity}%` : '--';
  const windSpeed = weatherData?.current?.wind_kph !== undefined ? `${weatherData.current.wind_kph} km/h` : '--';

  

  return (
    <ImageBackground
      source={require('../../assets/images/pexels-tamhasipkhan-11817009.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Hello, {userName}</Text>
            <View style={styles.locationContainer}>
      
          <Image source={require('../../assets/images/farmer-icons/weather-icons/map.png')} style={styles.locationIcon} />
          <Text style={styles.locationText}>{city}</Text>
        </View>
            <Text style={styles.subGreeting}>
              {weatherData ? `It's a ${weatherData.current.condition.text} day!` : 'Loading...'}
            </Text>

            

            {loading && <ActivityIndicator size="large" color="#FFFFFF" />}

          </View>

          <View style={styles.weatherContainer}>
            <View style={styles.weatherRow}>
              <View style={styles.weatherItem}>
                <Image 
                  source={require('../../assets/images/farmer-icons/weather-icons/hot.png')}
                  style={styles.weatherIcon}
                />
                <Text style={styles.weatherValue}>
                  {weatherData ? `${weatherData.current.temp_c}°C` : '--'}
                </Text>
                <Text style={styles.weatherLabel}>{t('temperature')}</Text>
              </View>
  
              <View style={styles.weatherItem}>
                <Image 
                  source={require('../../assets/images/farmer-icons/weather-icons/humidity.png')}
                  style={styles.weatherIcon}
                />
                <Text style={styles.weatherValue}>
                  {weatherData ? `${weatherData.current.humidity}%` : '--'}
                </Text>
                <Text style={styles.weatherLabel}>{t('humidity')}</Text>
              </View>
            </View>

            <View style={styles.weatherRow}>
              <View style={styles.weatherItem}>
                <Image 
                  source={require('../../assets/images/farmer-icons/weather-icons/atmospheric-conditions.png')}
                  style={styles.weatherIcon}
                />
                <Text style={[styles.weatherValue, { fontSize: 16 }]}>
                  {weatherData ? weatherData.current.condition.text : '--'}
                </Text>
                <Text style={styles.weatherLabel}>{t('condition')}</Text>
              </View>

              <View style={styles.weatherItem}>
                <Image 
                  source={require('../../assets/images/farmer-icons/weather-icons/wind.png')}
                  style={styles.weatherIcon}
                />
                <Text style={styles.weatherValue}>
                  {weatherData ? `${weatherData.current.wind_kph} km/h` : '--'}
                </Text>
                <Text style={styles.weatherLabel}>{t('windspeed')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {features.map((feature, index) => (
              <TouchableOpacity key={index} onPress={() => router.push(feature.route as never)}>
                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Image 
                      source={feature.icon}
                      style={styles.featureIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.featureText}>{feature.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 70,
  },
  header: {
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  weatherContainer: {
    padding: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    marginTop: 5,
    
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  locationText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  Location: {
    fontSize: 20,
    color: '#FFFFFF',
    opacity: 0.8,
    
  },
  weatherItem: {
    backgroundColor: 'rgba(182, 141, 141, 0.15)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
  },
  weatherIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  weatherValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
  },
  weatherLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  menuContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  featureCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(97, 177, 90, 0.9)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  featureText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFC107',
    borderRadius: 5,
  },
  reloadButtonText: {
    color: '#1B5E20',
    fontWeight: 'bold',
  },
});

export default MenuTab;
