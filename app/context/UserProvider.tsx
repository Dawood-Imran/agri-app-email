import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth , onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import based on your file structure

interface UserContextProps {
  userName: string;
  userType: string;
  email: string;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
}


const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  

  const fetchUser = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
          setUserType(userDoc.data().userType);

          console.log("user type ",userType)
 
          if (userType === 'Farmer') {
            
          const userTypeRef = doc(db, userDoc.data()?.userType.toLowerCase(), user.uid);
          const userTypeDoc = await getDoc(userTypeRef);

          if (userTypeDoc.exists()) {
            setEmail(userTypeDoc.data().email);
            setCity(userTypeDoc.data().city);
            setAddress(userTypeDoc.data().address);

            console.log('Farmer data fetched from User Provider:', userDoc.data(), userTypeDoc.data());

          } else {
            console.error('User data not found');
          }
             
          }

          if (userType === 'Expert') {
            
            const userTypeRef = doc(db, userDoc.data()?.userType.toLowerCase(), user.uid);
            const userTypeDoc = await getDoc(userTypeRef);
  
            if (userTypeDoc.exists()) {
              setEmail(userTypeDoc.data().email);
              setCity(userTypeDoc.data().city);
              setAddress(userTypeDoc.data().address);
              setExperienceYears(userTypeDoc.data().experienceYears);
  
              console.log('Expert data fetched from User Provider:', userDoc.data(), userTypeDoc.data());
  
            } else {
              console.error('User data not found');
            }
              
            }

        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUser();
      } else {
        // Reset user data if not authenticated
        setUserName(''); 
        setUserType(''); 
        setEmail('');
        setCity('');
        setAddress('');  
        setExperienceYears(0);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userName, userType, email , city , address , experienceYears }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};