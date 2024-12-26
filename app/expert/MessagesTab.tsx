import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { useUser } from '../context/UserProvider';

const MessagesTab = () => {

  const { email , city , address , experienceYears} = useUser();
  console.log('User data from UserProvider in the Messages Tab:', email, city, address, experienceYears);

  return (
    <View style={styles.container}>
      <Text style={styles.txt}>Messages will appear here</Text>

      <Text style ={styles.txt}>Email: {email}</Text>
      <Text style ={styles.txt}>City: {city}</Text>
      <Text style ={styles.txt}>Address: {address}</Text>
      <Text style ={styles.txt}>Experience: {experienceYears}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt:{
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  }
});

export default MessagesTab;
