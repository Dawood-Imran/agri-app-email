import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MenuTab from './MenuTab';
import AccountTab from './AccountTab';
import CoinScreen from './CoinScreen';
import CoinDisplay from '../../components/CoinDisplay';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size = 26 }: { name: string; color: string; size?: number }) => (
  <View style={styles.iconContainer}>
    <MaterialCommunityIcons name={name} size={size} color={color} />
  </View>
);

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const [coins, setCoins] = useState(100); // Example initial value
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName = '';

          if (route.name === t('menu')) {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === t('account')) {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <TabIcon name={iconName} color={color} />;
        },
        tabBarActiveTintColor: '#FFC107',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        tabBarStyle: {
          backgroundColor: '#61B15A',
          height: 70,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          position: 'absolute',
          bottom: 5,
          left: 20,
          right: 20,
          borderRadius: 15,
          marginHorizontal: 20,
          marginVertical: 10,
          
        },
        tabBarItemStyle: {
          marginTop: 10,
          height: 50,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 5,
          marginBottom: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#61B15A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => {
          
          return (
            <TouchableOpacity onPress={() => navigation.navigate('farmer/CoinScreen')}>
              <CoinDisplay coins={coins} />
            </TouchableOpacity>
          );
        },
      })}
    >
      <Tab.Screen name={t('menu')} component={MenuTab} />
      <Tab.Screen name={t('account')} component={AccountTab} />
      
    </Tab.Navigator>
  );
};

const styles = {
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  coinButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
};

export default FarmerDashboard;
