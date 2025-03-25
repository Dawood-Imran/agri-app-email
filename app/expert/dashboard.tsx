import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MessagesTab from './MessagesTab';
import AccountTab from './AccountTab';
import CoinDisplay from '../../components/CoinDisplay';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size = 26 }: { name: string; color: string; size?: number }) => (
  <View style={styles.iconContainer}>
    <MaterialCommunityIcons name={name as any} size={size} color={color} />
  </View>
);

const ExpertDashboard = () => {
  const { t, i18n } = useTranslation();
  const [coins, setCoins] = useState(500);
  const navigation = useNavigation();

  const screenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: '#FFC107',
    tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
    tabBarStyle: {
      backgroundColor: '#4CAF50',
      height: 70,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      borderRadius: 15,
      paddingBottom: 8,
      paddingHorizontal: 10,
    },
    tabBarItemStyle: {
      marginTop: 10,
      height: 50,
      paddingBottom: 5,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 5,
      marginBottom: 8,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    headerStyle: {
      backgroundColor: '#4CAF50',
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 20,
      textAlign: i18n.language === 'ur' ? 'right' : 'left',
    },
    headerTitleAlign: i18n.language === 'ur' ? 'left' : 'left',
    headerRight: () => (
      <TouchableOpacity
        style={styles.coinButton}
        onPress={() => navigation.navigate('expert/CoinScreen' as never)}
      >
        <CoinDisplay coins={coins} />
      </TouchableOpacity>
    ),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color }) => {
          let iconName = '';

          if (route.name === t('messages')) {
            iconName = focused ? 'message-text' : 'message-text-outline';
          } else if (route.name === t('account')) {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <TabIcon name={iconName} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name={t('messages')} 
        component={MessagesTab}
        options={{
          title: t('messages'),
        }}
      />
      <Tab.Screen 
        name={t('account')} 
        component={AccountTab}
        options={{
          title: t('account'),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginHorizontal:20,
    
  },
  coinButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    
    elevation: 3,
  },
});

export default ExpertDashboard;
