import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/CustomHeader';

interface Category {
  key: string;
  title: string;
  icon: string;
  tips: string[];
}

const FieldManagement = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      key: 'water',
      title: t('agribot.fieldManagement.categories.water'),
      icon: 'water',
      tips: t('agribot.fieldManagement.tips.water', { returnObjects: true }) as string[],
    },
    {
      key: 'soil',
      title: t('agribot.fieldManagement.categories.soil'),
      icon: 'shovel',
      tips: t('agribot.fieldManagement.tips.soil', { returnObjects: true }) as string[],
    },
    {
      key: 'fertilizer',
      title: t('agribot.fieldManagement.categories.fertilizer'),
      icon: 'leaf',
      tips: t('agribot.fieldManagement.tips.fertilizer', { returnObjects: true }) as string[],
    },
    {
      key: 'weather',
      title: t('agribot.fieldManagement.categories.weather'),
      icon: 'weather-partly-cloudy',
      tips: t('agribot.fieldManagement.tips.water', { returnObjects: true }) as string[],
    },
    {
      key: 'machinery',
      title: t('agribot.fieldManagement.categories.machinery'),
      icon: 'tractor',
      tips: t('agribot.fieldManagement.tips.water', { returnObjects: true }) as string[],
    },
  ];

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.key && styles.selectedCard,
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={32}
        color={selectedCategory === item.key ? '#FFC107' : '#4CAF50'}
      />
      <Text style={[
        styles.categoryTitle,
        selectedCategory === item.key && styles.selectedText,
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderTip = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.tipCard}>
      <View style={styles.tipNumberContainer}>
        <Text style={styles.tipNumber}>{index + 1}</Text>
      </View>
      <Text style={styles.tipText}>{item}</Text>
    </View>
  );

  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory);

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('agribot.fieldManagement.title')}</Text>

        {/* Categories */}
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        {/* Tips */}
        {selectedCategory && selectedCategoryData && (
          <View style={styles.tipsContainer}>
            <Text style={styles.categoryHeader}>{selectedCategoryData.title}</Text>
            <FlatList
              data={selectedCategoryData.tips}
              renderItem={renderTip}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    backgroundColor: '#2E7D32',
  },
  categoryTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedText: {
    color: 'white',
  },
  tipsContainer: {
    marginTop: 20,
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipNumberContainer: {
    backgroundColor: '#FFC107',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tipNumber: {
    color: '#1B5E20',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});

export default FieldManagement; 