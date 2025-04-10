import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

export interface FieldData {
  id: string;
  cropType: string;
  soilType: string;
  sowingDate: Date;
  areaInAcres: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
}

export const useFields = () => {
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to view your fields');
        return;
      }

      const fieldsRef = collection(db, 'users', user.uid, 'fields');
      const querySnapshot = await getDocs(fieldsRef);
      
      const fieldsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sowingDate: doc.data().sowingDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as FieldData[];

      setFields(fieldsList);
    } catch (err) {
      console.error('Error fetching fields:', err);
      setError('Failed to load field data');
    } finally {
      setLoading(false);
    }
  };

  const addField = async (fieldData: Omit<FieldData, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to save field data');
        return;
      }

      const fieldsRef = collection(db, 'users', user.uid, 'fields');
      await addDoc(fieldsRef, {
        ...fieldData,
        createdAt: Timestamp.now(),
        sowingDate: Timestamp.fromDate(fieldData.sowingDate),
        userId: user.uid,
      });

      // Refresh fields after adding
      await fetchFields();
      return true;
    } catch (err) {
      console.error('Error saving field data:', err);
      setError('Failed to save field data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return {
    fields,
    loading,
    error,
    fetchFields,
    addField,
  };
}; 