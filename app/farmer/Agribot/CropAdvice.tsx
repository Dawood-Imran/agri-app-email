import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-elements';
import CustomHeader from '../../components/CustomHeader';

interface FormData {
  cropType: string;
  growthStage: string;
  soilType: string;
  issue: string;
  selectedQuestions: string[];
}

interface AdviceResponse {
  question: string;
  options: string[];
}

const CropAdvice = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    cropType: '',
    growthStage: '',
    soilType: '',
    issue: '',
    selectedQuestions: [],
  });

  const questions = {
    nutrient: [
      "What color changes have you noticed in the leaves?",
      "Are the symptoms appearing in new or old leaves?",
      "Have you applied any fertilizers recently?",
    ],
    water: [
      "How often do you irrigate the field?",
      "Have you noticed any waterlogging?",
      "Are the leaves wilting despite watering?",
    ],
    growth: [
      "Is the growth stunted compared to surrounding plants?",
      "Are there any visible deformities?",
      "When did you first notice the poor growth?",
    ],
    yield: [
      "How does the current yield compare to previous seasons?",
      "Are the fruits/grains smaller than usual?",
      "Have you noticed any pest damage?",
    ],
  };

  const mockAdviceResponse: AdviceResponse[] = [
    {
      question: "Recommended action for your crop:",
      options: [
        "Apply balanced NPK fertilizer",
        "Increase irrigation frequency",
        "Consider organic amendments",
      ],
    },
    {
      question: "Prevention measures:",
      options: [
        "Regular soil testing",
        "Crop rotation",
        "Improved drainage",
      ],
    },
  ];

  const handleSubmit = async () => {
    // Check if any required field is empty
    const isFormValid = 
      formData.cropType !== '' && 
      formData.growthStage !== '' && 
      formData.soilType !== '' && 
      formData.issue !== '';

    // Only check for selected questions if an issue is selected
    const areQuestionsSelected = formData.issue ? formData.selectedQuestions.length > 0 : true;

    if (!isFormValid || !areQuestionsSelected) {
      Alert.alert(
        t('Error'),
        t('agribot.cropAdvice.errors.allFieldsRequired'),
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Here you would make the API call to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      setShowResponse(true);
    } catch (error) {
      Alert.alert(
        t('Error'),
        t('agribot.cropAdvice.errors.submissionFailed'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => {
      if (prev.includes(answer)) {
        return prev.filter(a => a !== answer);
      }
      return [...prev, answer];
    });
  };

  if (showResponse) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t('agribot.cropAdvice.title')}</Text>
          
          {mockAdviceResponse.map((response, index) => (
            <View key={index} style={styles.responseSection}>
              <Text style={styles.questionText}>{response.question}</Text>
              <View style={styles.optionsContainer}>
                {response.options.map((option, optIndex) => (
                  <TouchableOpacity
                    key={optIndex}
                    style={[
                      styles.optionButton,
                      selectedAnswers.includes(option) && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleAnswerSelect(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAnswers.includes(option) && styles.optionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <Button
            title="Get More Advice"
            onPress={() => setShowResponse(false)}
            buttonStyle={styles.submitButton}
            titleStyle={styles.submitButtonText}
            containerStyle={styles.submitButtonContainer}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('agribot.cropAdvice.title')}</Text>
        
        {/* Crop Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.cropAdvice.cropType')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.cropType}
              onValueChange={(value) => setFormData({ ...formData, cropType: value })}
              style={styles.picker}
            >
              <Picker.Item label={t('agribot.plantDiseases.selectCrop')} value="" />
              {Object.entries(t('agribot.cropAdvice.cropOptions', { returnObjects: true }))
                .map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
          </View>
        </View>

        {/* Growth Stage Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.cropAdvice.growthStage')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.growthStage}
              onValueChange={(value) => setFormData({ ...formData, growthStage: value })}
              style={styles.picker}
            >
              <Picker.Item label={t('agribot.cropAdvice.growthStage')} value="" />
              {Object.entries(t('agribot.cropAdvice.growthStageOptions', { returnObjects: true }))
                .map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
          </View>
        </View>

        {/* Soil Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.cropAdvice.soilType')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.soilType}
              onValueChange={(value) => setFormData({ ...formData, soilType: value })}
              style={styles.picker}
            >
              <Picker.Item label={t('agribot.cropAdvice.soilType')} value="" />
              {Object.entries(t('agribot.cropAdvice.soilTypeOptions', { returnObjects: true }))
                .map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
          </View>
        </View>

        {/* Issue Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('agribot.cropAdvice.issue')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.issue}
              onValueChange={(value) => {
                setFormData({ ...formData, issue: value, selectedQuestions: [] });
              }}
              style={styles.picker}
            >
              <Picker.Item label={t('agribot.cropAdvice.issue')} value="" />
              {Object.entries(t('agribot.cropAdvice.issueOptions', { returnObjects: true }))
                .map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
          </View>
        </View>

        {/* Questions Selection */}
        {formData.issue && questions[formData.issue as keyof typeof questions] && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Relevant Questions:</Text>
            <View style={styles.questionsContainer}>
              {questions[formData.issue as keyof typeof questions].map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.questionButton,
                    formData.selectedQuestions.includes(question) && styles.questionButtonSelected,
                  ]}
                  onPress={() => {
                    const selected = formData.selectedQuestions.includes(question)
                      ? formData.selectedQuestions.filter(q => q !== question)
                      : [...formData.selectedQuestions, question];
                    setFormData({ ...formData, selectedQuestions: selected });
                  }}
                >
                  <Text
                    style={[
                      styles.questionText,
                      formData.selectedQuestions.includes(question) && styles.questionTextSelected,
                    ]}
                  >
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title={loading ? t('agribot.loading') : t('agribot.submit')}
          onPress={handleSubmit}
          disabled={loading}
          buttonStyle={styles.submitButton}
          titleStyle={styles.submitButtonText}
          containerStyle={styles.submitButtonContainer}
        />
        {loading && <ActivityIndicator style={styles.loader} color="#4CAF50" />}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  picker: {
    height: 50,
  },
  questionsContainer: {
    gap: 10,
  },
  questionButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  questionButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  questionText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  questionTextSelected: {
    color: 'white',
  },
  responseSection: {
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  optionButtonSelected: {
    backgroundColor: '#FFC107',
  },
  optionText: {
    color: '#1B5E20',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FFC107',
    borderRadius: 25,
    height: 50,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonContainer: {
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default CropAdvice; 