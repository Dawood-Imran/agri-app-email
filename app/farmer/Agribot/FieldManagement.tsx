import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckBox, Button } from 'react-native-elements';

interface SubOption {
  id: string;
  title: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
  isSelected: boolean;
}

interface Category {
  id: string;
  title: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
  icon: string;
  subOptions: SubOption[];
  isExpanded: boolean;
}

const initialCategories: Category[] = [
  {
    id: 'soil-preparation',
    title: {
      en: 'Soil Preparation Tips',
      ur: 'مٹی کی تیاری کے نکات'
    },
    description: {
      en: 'Learn about soil types and preparation methods',
      ur: 'مٹی کی اقسام اور تیاری کے طریقوں کے بارے میں جانیں'
    },
    icon: 'shovel',
    isExpanded: false,
    subOptions: [
      {
        id: 'soil-type',
        title: {
          en: 'Best soil type for my crop',
          ur: 'میری فصل کے لیے بہترین مٹی کی قسم'
        },
        description: {
          en: 'What soil composition works best?',
          ur: 'کون سی مٹی کی ترکیب بہترین کام کرتی ہے؟'
        },
        isSelected: false
      },
      {
        id: 'fertilizer-choice',
        title: {
          en: 'Organic vs. chemical fertilizers',
          ur: 'نامیاتی بمقابلہ کیمیائی کھاد'
        },
        description: {
          en: 'Which is more effective for my soil?',
          ur: 'میری مٹی کے لیے کون سا زیادہ موثر ہے؟'
        },
        isSelected: false
      },
      {
        id: 'plowing-techniques',
        title: {
          en: 'Plowing and tilling techniques',
          ur: 'ہل چلانے اور زمین کی تیاری کے طریقے'
        },
        description: {
          en: 'Recommended methods for preparing land',
          ur: 'زمین کی تیاری کے لیے تجویز کردہ طریقے'
        },
        isSelected: false
      },
      {
        id: 'soil-testing',
        title: {
          en: 'Soil testing and amendments',
          ur: 'مٹی کی جانچ اور اصلاح'
        },
        description: {
          en: 'How to test soil health and improve fertility',
          ur: 'مٹی کی صحت کی جانچ اور زرخیزی میں بہتری کیسے کریں'
        },
        isSelected: false
      }
    ]
  },
  {
    id: 'irrigation',
    title: {
      en: 'Irrigation Management',
      ur: 'آبپاشی کا انتظام'
    },
    description: {
      en: 'Water management and irrigation techniques',
      ur: 'پانی کا انتظام اور آبپاشی کے طریقے'
    },
    icon: 'water',
    isExpanded: false,
    subOptions: [
      {
        id: 'irrigation-methods',
        title: {
          en: 'Irrigation methods for water conservation',
          ur: 'پانی کی بچت کے لیے آبپاشی کے طریقے'
        },
        description: {
          en: 'Drip, flood, or sprinkler systems',
          ur: 'قطرہ، سیلاب، یا سپرنکلر سسٹم'
        },
        isSelected: false
      },
      {
        id: 'scheduling',
        title: {
          en: 'Scheduling and timing',
          ur: 'آبپاشی کا شیڈول اور وقت'
        },
        description: {
          en: 'Best times of day or seasons to irrigate',
          ur: 'دن یا موسم کے بہترین اوقات'
        },
        isSelected: false
      },
      {
        id: 'water-shortage',
        title: {
          en: 'Water shortage management',
          ur: 'پانی کی کمی کا انتظام'
        },
        description: {
          en: 'Tips on managing irrigation during drought',
          ur: 'خشک سالی کے دوران آبپاشی کے نکات'
        },
        isSelected: false
      },
      {
        id: 'waterlogging',
        title: {
          en: 'Preventing waterlogging',
          ur: 'جل بھراؤ سے بچاؤ'
        },
        description: {
          en: 'How to avoid over-irrigation and crop damage',
          ur: 'زیادہ پانی اور فصل کے نقصان سے کیسے بچیں'
        },
        isSelected: false
      }
    ]
  },
  {
    id: 'pest-control',
    title: {
      en: 'Pest Control',
      ur: 'کیڑے مکوڑوں کا کنٹرول'
    },
    description: {
      en: 'Pest management and prevention strategies',
      ur: 'کیڑے مکوڑوں کا انتظام اور روک تھام کے حکمت عملی'
    },
    icon: 'bug',
    isExpanded: false,
    subOptions: [
      {
        id: 'pest-identification',
        title: {
          en: 'Identifying common pests',
          ur: 'عام کیڑوں کی شناخت'
        },
        description: {
          en: 'What pests are prevalent in my region?',
          ur: 'میرے علاقے میں کون سے کیڑے عام ہیں؟'
        },
        isSelected: false
      },
      {
        id: 'pesticides',
        title: {
          en: 'Organic vs. chemical pesticides',
          ur: 'نامیاتی بمقابلہ کیمیائی کیڑے مار دوائیں'
        },
        description: {
          en: 'Advantages and disadvantages',
          ur: 'فوائد اور نقصانات'
        },
        isSelected: false
      },
      {
        id: 'ipm',
        title: {
          en: 'Integrated Pest Management (IPM)',
          ur: 'مربوط کیڑے کنٹرول (آئی پی ایم)'
        },
        description: {
          en: 'A sustainable, multi-pronged approach',
          ur: 'پائیدار، کثیر الجہتی نقطہ نظر'
        },
        isSelected: false
      },
      {
        id: 'prevention',
        title: {
          en: 'Preventative measures',
          ur: 'احتیاطی تدابیر'
        },
        description: {
          en: 'Techniques to reduce pest infestation before it starts',
          ur: 'کیڑوں کے حملے سے پہلے روک تھام کے طریقے'
        },
        isSelected: false
      }
    ]
  },
  {
    id: 'crop-rotation',
    title: {
      en: 'Crop Rotation & Selection',
      ur: 'فصل کی تبدیلی اور انتخاب'
    },
    description: {
      en: 'Strategic crop planning and rotation',
      ur: 'حکمت عملی کے تحت فصل کی منصوبہ بندی اور تبدیلی'
    },
    icon: 'sync',
    isExpanded: false,
    subOptions: [
      {
        id: 'seasonal-planning',
        title: {
          en: 'Seasonal crop planning',
          ur: 'موسمی فصل کی منصوبہ بندی'
        },
        description: {
          en: 'Which crops to plant each season',
          ur: 'ہر موسم میں کون سی فصلیں لگائیں'
        },
        isSelected: false
      },
      {
        id: 'intercropping',
        title: {
          en: 'Intercropping strategies',
          ur: 'بیک وقت کئی فصلوں کی کاشت کے طریقے'
        },
        description: {
          en: 'Benefits of growing multiple crops together',
          ur: 'ایک ساتھ کئی فصلیں اگانے کے فوائد'
        },
        isSelected: false
      },
      {
        id: 'nutrient-rotation',
        title: {
          en: 'Nutrient management through rotation',
          ur: 'تبدیلی کے ذریعے غذائی انتظام'
        },
        description: {
          en: 'How rotation can help restore soil health',
          ur: 'فصل کی تبدیلی مٹی کی صحت کو کیسے بہتر بناتی ہے'
        },
        isSelected: false
      },
      {
        id: 'market-demand',
        title: {
          en: 'Market demand considerations',
          ur: 'مارکیٹ کی طلب کا خیال'
        },
        description: {
          en: 'Choosing crops that yield higher returns locally',
          ur: 'مقامی طور پر زیادہ منافع دینے والی فصلوں کا انتخاب'
        },
        isSelected: false
      }
    ]
  },
  {
    id: 'fertilizer-management',
    title: {
      en: 'Fertilizer & Nutrient Management',
      ur: 'کھاد اور غذائی اجزاء کا انتظام'
    },
    description: {
      en: 'Effective fertilizer application and nutrient management',
      ur: 'موثر کھاد کا استعمال اور غذائی اجزاء کا انتظام'
    },
    icon: 'leaf',
    isExpanded: false,
    subOptions: [
      {
        id: 'fertilizer-choice',
        title: {
          en: 'Choosing the right fertilizer',
          ur: 'درست کھاد کا انتخاب'
        },
        description: {
          en: 'Organic versus synthetic options',
          ur: 'نامیاتی بمقابلہ مصنوعی اختیارات'
        },
        isSelected: false
      },
      {
        id: 'application',
        title: {
          en: 'Application techniques',
          ur: 'استعمال کے طریقے'
        },
        description: {
          en: 'How to apply fertilizers effectively',
          ur: 'کھاد کو موثر طریقے سے کیسے استعمال کریں'
        },
        isSelected: false
      },
      {
        id: 'timing',
        title: {
          en: 'Determining dosage and timing',
          ur: 'مقدار اور وقت کا تعین'
        },
        description: {
          en: 'Best practices for fertilizer use',
          ur: 'کھاد کے استعمال کے بہترین طریقے'
        },
        isSelected: false
      },
      {
        id: 'deficiencies',
        title: {
          en: 'Identifying nutrient deficiencies',
          ur: 'غذائی اجزاء کی کمی کی شناخت'
        },
        description: {
          en: 'Recognizing signs in crops and addressing them',
          ur: 'فصلوں میں علامات کی شناخت اور ان کا حل'
        },
        isSelected: false
      }
    ]
  }
];

const FieldManagement = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const isRTL = i18n.language === 'ur';

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      isExpanded: cat.id === categoryId ? !cat.isExpanded : cat.isExpanded
    })));
  };

  const toggleSubOption = (categoryId: string, subOptionId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subOptions: cat.subOptions.map(sub => ({
            ...sub,
            isSelected: sub.id === subOptionId ? !sub.isSelected : sub.isSelected
          }))
        };
      }
      return cat;
    }));
  };

  const getSelectedOptions = () => {
    const selected: { categoryId: string; subOptionId: string; }[] = [];
    categories.forEach(cat => {
      cat.subOptions.forEach(sub => {
        if (sub.isSelected) {
          selected.push({
            categoryId: cat.id,
            subOptionId: sub.id
          });
        }
      });
    });
    return selected;
  };

  const handleSubmit = async () => {
    const selectedOptions = getSelectedOptions();
    if (selectedOptions.length === 0) {
      // Show error message
      return;
    }

    setLoading(true);
    try {
      // Format selected options into a list of strings
      const selectedTipsList = selectedOptions.map(option => {
        const category = categories.find(cat => cat.id === option.categoryId);
        const subOption = category?.subOptions.find(sub => sub.id === option.subOptionId);
        return `${category?.title[i18n.language as 'en' | 'ur']} - ${subOption?.title[i18n.language as 'en' | 'ur']}`;
      });

      console.log(selectedTipsList);

      // Send request to backend
      const response = await fetch('/api/field-management/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedTips: selectedTipsList,
          language: i18n.language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get advice');
      }

      const data = await response.json();
      setAdvice(data.advice);
    } catch (error) {
      console.error('Error getting field management advice:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => toggleCategory(category.id)}
    >
      <View style={styles.categoryHeader}>
        <MaterialCommunityIcons
          name={category.icon as any}
          size={24}
          color="#4CAF50"
        />
        <Text style={styles.categoryTitle}>
          {category.title[i18n.language as 'en' | 'ur']}
        </Text>
        <MaterialCommunityIcons
          name={category.isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#4CAF50"
        />
      </View>
      
      {category.isExpanded && (
        <View style={styles.subOptionsContainer}>
          {category.subOptions.map(subOption => (
            <CheckBox
              key={subOption.id}
              title={subOption.title[i18n.language as 'en' | 'ur']}
              checked={subOption.isSelected}
              onPress={() => toggleSubOption(category.id, subOption.id)}
              containerStyle={styles.checkboxContainer}
              textStyle={styles.checkboxText}
              checkedColor="#4CAF50"
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {t('fieldManagement.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('fieldManagement.subtitle')}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.categoriesSection}>
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>

        <Button
          title={t('fieldManagement.getTips')}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          buttonStyle={styles.submitButton}
          containerStyle={styles.submitButtonContainer}
        />

        {advice && (
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceTitle}>{t('fieldManagement.yourAdvice')}</Text>
            <Text style={styles.adviceText}>{advice}</Text>
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
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 10,
  },
  subOptionsContainer: {
    marginTop: 15,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  checkboxText: {
    fontWeight: 'normal',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FFC107',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
  },
  submitButtonContainer: {
    marginVertical: 20,
  },
  adviceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  adviceText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
});

export default FieldManagement; 