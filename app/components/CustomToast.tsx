import React, { useEffect } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  color?: string; // New prop for custom color
  onHide?: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({ 
  visible, 
  message, 
  type = 'error',
  color, // Use the custom color prop
  onHide 
}) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) {
          onHide();
        }
      });
    }
  }, [visible]);

  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'alert-circle';
    }
  };

  const getBackgroundColor = () => {
    // If a custom color is provided, use it; otherwise, use the default based on type
    return color || (type === 'success' ? '#4CAF50' : type === 'error' ? '#FF5252' : '#2196F3');
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity, backgroundColor: getBackgroundColor() }
      ]}
    >
      <MaterialCommunityIcons 
        name={getIconName()} 
        size={24} 
        color="#FFFFFF" 
      />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
}); 

export default CustomToast;
