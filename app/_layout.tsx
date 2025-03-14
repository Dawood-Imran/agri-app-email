import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../i18n'; // Import the i18n configuration
import { Icon } from 'react-native-elements';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LandingPage from './farmer/Agribot/LandingPage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';

import { color } from 'react-native-elements/dist/helpers';
import CustomHeader from '../app/components/CustomHeader';
import { UserProvider } from './context/UserProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './context/AuthContext';




// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        if (!loaded) return;

        const userAuthenticated = await AsyncStorage.getItem('userAuthenticated');
        const userType = await AsyncStorage.getItem('userType');

        if (userAuthenticated === 'true' && userType) {
          const route = {
            pathname: `/${userType.toLowerCase()}/dashboard`
          };
          
          // Delay navigation
          setTimeout(() => {
            router.replace(route as any);
          }, 100);
        }
      } catch (error) {
        console.error('Preparation error:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, [loaded]);

  if (!loaded || !isReady) {
    return <View style={{ flex: 1 }} />;
  }

  const commonHeaderOptions = {
    
    headerStyle: { backgroundColor: '#61B15A' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: 'bold' as const },
  };

  return (
    <UserProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
            <Stack.Screen name="LanguageSelection" options={{ headerShown: false }} />
            <Stack.Screen name="UserSelectionScreen" options={{ headerShown: false }} />
            <Stack.Screen name="SignIn" options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPin" options={{ headerShown: false }} />
            <Stack.Screen name="VerifyPin" options={{ headerShown: false }} />

            {/* Farmer Screens */}
            <Stack.Screen name="farmer/dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/NewUserForm" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/Profile" options={{ ...commonHeaderOptions, title: t('Profile') }} />
            <Stack.Screen name="farmer/Settings" options={{ ...commonHeaderOptions, title: t('Settings') }} />
            <Stack.Screen name="farmer/Help" options={{ ...commonHeaderOptions, title: t('Help') }} />
            <Stack.Screen name="farmer/CoinScreen" options={{ ...commonHeaderOptions, title: t('Coins') }} />
            <Stack.Screen name="farmer/YieldPrediction" options={{ ...commonHeaderOptions, title: t('yieldPrediction') }} />
            <Stack.Screen name="farmer/ExpertConsultation" options={{ ...commonHeaderOptions, title: t('expertConsultation') }} />
            <Stack.Screen name="farmer/BuyCoins" options={{ ...commonHeaderOptions, title: t('buyCoins') }} />
            <Stack.Screen name="farmer/AuctionSystem" options={{ ...commonHeaderOptions, title: t('auctionSystem') }} />
            <Stack.Screen name="farmer/FieldDetails" options={{ ...commonHeaderOptions, title: t('fieldDetails') }} />
            <Stack.Screen name="farmer/SchemesList" options={{ ...commonHeaderOptions, title: t('agricultureSchemes') }} />
            <Stack.Screen name="farmer/SchemeDetails" options={{ ...commonHeaderOptions, title: t('schemeDetails') }} />

            {/* Expert Screens */}
            <Stack.Screen name="expert/dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="expert/NewExpert" options={{ headerShown: false }} />
            <Stack.Screen name="expert/Profile" options={{ ...commonHeaderOptions, title: t('Profile') }} />
            <Stack.Screen name="expert/Settings" options={{ ...commonHeaderOptions, title: t('Settings') }} />
            <Stack.Screen name="expert/Help" options={{ ...commonHeaderOptions, title: t('Help') }} />
            <Stack.Screen name="expert/CoinScreen" options={{ ...commonHeaderOptions, title: t('Coins') }} />
            <Stack.Screen name="expert/MessagesTab" options={{ headerShown: false }} />

            {/* Buyer Screens */}
            <Stack.Screen name="buyer/dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/NewBuyer" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/Profile" options={{ ...commonHeaderOptions, title: t('Profile') }} />    
              <Stack.Screen name="buyer/Settings" options={{ ...commonHeaderOptions, title: t('Settings') }} />
          <Stack.Screen name="buyer/Help" options={{ ...commonHeaderOptions, title: t('Help') }} />
          <Stack.Screen name="buyer/CoinScreen" options={{ ...commonHeaderOptions, title: t('Coins') }} />
          <Stack.Screen name="buyer/AuctionSystemTab" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </UserProvider>
  );
}

