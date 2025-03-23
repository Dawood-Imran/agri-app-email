import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export function useInitialNavigation() {
  const router = useRouter();

  useEffect(() => {
    async function handleInitialNavigation() {
      try {
        const userAuthenticated = await SecureStore.getItemAsync('userAuthenticated');
        const userType = await SecureStore.getItemAsync('userType');

        if (userAuthenticated === 'true' && userType) {
          // Use requestAnimationFrame to ensure the layout is mounted
          requestAnimationFrame(() => {
            router.replace(`/${userType.toLowerCase()}/dashboard`);
          });
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }

    handleInitialNavigation();
  }, []);
} 