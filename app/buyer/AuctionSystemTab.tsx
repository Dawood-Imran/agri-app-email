import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-elements';

const AuctionSystemTab = () => {
  // This is a placeholder. In the future, this will be populated with actual auction items.
  const auctionItems = [];

  return (
      <View  style={styles.container}>
      <ScrollView>
      <Text style={styles.title}>Auction System</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  auctionCard: {

    borderRadius: 10,
    marginBottom: 10,
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default AuctionSystemTab;
