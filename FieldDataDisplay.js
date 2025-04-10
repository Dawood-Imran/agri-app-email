import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { firebase } from '../firebase/config';

const FieldDataDisplay = ({ navigation }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCropType, setSelectedCropType] = useState('All');
  const [cropTypes, setCropTypes] = useState(['All']);

  useEffect(() => {
    const subscriber = firebase
      .firestore()
      .collection('fields')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const fieldsList = [];
          const cropTypesSet = new Set(['All']);
          
          querySnapshot.forEach((documentSnapshot) => {
            const field = {
              id: documentSnapshot.id,
              ...documentSnapshot.data(),
              sowingDate: new Date(documentSnapshot.data().sowingDate),
            };
            fieldsList.push(field);
            cropTypesSet.add(field.cropType);
          });
          
          setFields(fieldsList);
          setCropTypes(Array.from(cropTypesSet));
          setLoading(false);
        },
        (error) => {
          console.error(error);
          Alert.alert('Error', 'Failed to load field data.');
          setLoading(false);
        }
      );

    // Unsubscribe from events when component unmounts
    return () => subscriber();
  }, []);

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const filteredFields = selectedCropType === 'All'
    ? fields
    : fields.filter(field => field.cropType === selectedCropType);

  const renderCropTypeButton = (cropType) => (
    <TouchableOpacity
      key={cropType}
      style={[
        styles.cropTypeButton,
        selectedCropType === cropType && styles.selectedCropTypeButton,
      ]}
      onPress={() => setSelectedCropType(cropType)}
    >
      <Text
        style={[
          styles.cropTypeButtonText,
          selectedCropType === cropType && styles.selectedCropTypeButtonText,
        ]}
      >
        {cropType}
      </Text>
    </TouchableOpacity>
  );

  const renderFieldCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cropType}>{item.cropType}</Text>
        <Text style={styles.soilType}>{item.soilType} Soil</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.fieldInfo}>
          <Text style={styles.infoLabel}>Number of Fields:</Text>
          <Text style={styles.infoValue}>{item.numberOfFields}</Text>
        </View>
        
        <View style={styles.fieldInfo}>
          <Text style={styles.infoLabel}>Area:</Text>
          <Text style={styles.infoValue}>{item.areaInAcres} acres</Text>
        </View>
        
        <View style={styles.fieldInfo}>
          <Text style={styles.infoLabel}>Sowing Date:</Text>
          <Text style={styles.infoValue}>{formatDate(item.sowingDate)}</Text>
        </View>
        
        {item.latitude && item.longitude && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Location:</Text>
            <Text style={styles.locationCoords}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading field data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Fields</Text>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Crop Type:</Text>
        <FlatList
          data={cropTypes}
          renderItem={({ item }) => renderCropTypeButton(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cropTypesList}
        />
      </View>
      
      {filteredFields.length > 0 ? (
        <FlatList
          data={filteredFields}
          renderItem={renderFieldCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No fields found for {selectedCropType === 'All' ? 'any crop type' : selectedCropType}.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('FieldDataForm')}
          >
            <Text style={styles.addButtonText}>Add Field Data</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {filteredFields.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('FieldDataForm')}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2E7D32',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  cropTypesList: {
    flexGrow: 0,
    marginBottom: 8,
  },
  cropTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  selectedCropTypeButton: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  cropTypeButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  selectedCropTypeButtonText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 12,
  },
  cropType: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  soilType: {
    color: '#E8F5E9',
    fontSize: 14,
  },
  cardBody: {
    padding: 16,
  },
  fieldInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  locationInfo: {
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
    color: '#388E3C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default FieldDataDisplay;