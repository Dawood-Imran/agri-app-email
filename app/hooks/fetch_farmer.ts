// hooks/fetch_farmer.ts
import { useState, useEffect, useCallback } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db, my_auth } from '../../firebaseConfig';

interface FarmerData {
  name: string;
  email: string;
  city: string;
  address: string;
  phoneNumber: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export const useFarmer = () => {
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmerData = useCallback(async () => {
    const currentUser = my_auth.currentUser;
    if (!currentUser) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const farmerRef = doc(db, 'farmer', currentUser.uid);
      const farmerSnap = await getDoc(farmerRef);

      if (farmerSnap.exists()) {
        setFarmerData(farmerSnap.data() as FarmerData);
      } else {
        setFarmerData(null);
        console.warn('No farmer data found for user:', currentUser.uid);
      }
    } catch (err: any) {
      console.error('Error fetching farmer data:', err);
      setError(err.message || 'Failed to fetch farmer data');
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadFarmerData = () => {
    setLoading(true);
    fetchFarmerData();
  };

  useEffect(() => {
    fetchFarmerData();
  }, [fetchFarmerData]);

  return { farmerData, loading, error, reloadFarmerData };
};