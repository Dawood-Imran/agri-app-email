import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Audio from 'expo-av';

interface Message {
  id: string;
  text?: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string;
}

const ChatScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { farmerId, farmerName, consultationId } = route.params as any;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image 
            source={require('../../assets/images/farmer.png')} 
            style={styles.farmerAvatar}
          />
          <View>
            <Text style={styles.farmerName}>{farmerName}</Text>
            <Text style={styles.farmerStatus}>{t('online')}</Text>
          </View>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: '#FFFFFF',
    });
  }, [navigation, farmerName]);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        sender: 'expert',
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'expert' ? styles.sentMessage : styles.receivedMessage
    ]}>
      {item.type === 'text' && (
        <Text style={styles.messageText}>{item.text}</Text>
      )}
      {item.type === 'image' && item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
      )}
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton}>
          <Ionicons name="image" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.mediaButton}>
          <Ionicons name="mic" size={24} color="#4CAF50" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={t('typeMessage')}
          value={input}
          onChangeText={setInput}
          multiline
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  farmerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  farmerStatus: {
    color: '#E8F5E9',
    fontSize: 14,
  },
  headerButton: {
    marginLeft: 8,
  },
  chatContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#000000',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  mediaButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
});

export default ChatScreen;