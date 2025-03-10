import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3_p03SKoRhslo4O3IRNSRRVdlenOr7wE",
    authDomain: "agroboost-e1cc5.firebaseapp.com",
    projectId: "agroboost-e1cc5",
    storageBucket: "agroboost-e1cc5.appspot.com",
    messagingSenderId: "149622729159",
    appId: "1:149622729159:android:8c38b2758e03a5d59111e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const my_auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { db };
export default app; 