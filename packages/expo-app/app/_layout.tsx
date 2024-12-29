// app/_layout.tsx
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import i18n from './i18n'; // Import the shared i18n instance
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        const activeLanguage = savedLanguage || 'en'; // Default to English if no preference exists
        setLanguage(activeLanguage);
        i18n.locale = activeLanguage;
      } catch (error) {
        console.error("Error loading language:", error);
        setLanguage('en'); // Fallback to English on error
        i18n.locale = 'en';
      }
    };

    loadLanguage();
  }, []);

  return (
    <Stack>
      {/* Define the main tab navigator */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Define standalone screens */}
      <Stack.Screen name="screens/AuthScreen" options={{ title: i18n.t('signup') }} />
      <Stack.Screen name="screens/DashBoard" options={{ title: i18n.t('dashboard') }} />
      <Stack.Screen name="screens/Recommendation" options={{ title: i18n.t('rectitle') }} />
      <Stack.Screen name="screens/Crop" options={{ title: i18n.t('crop') }} />
    </Stack>
  );
}