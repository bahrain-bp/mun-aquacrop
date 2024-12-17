import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import i18n from '../i18n'; // Import the shared i18n instance
//import { I18n } from 'i18n-js';

export default function Page() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [_, forceUpdate] = useState(0); // Used to force a re-render

  // Set the locale whenever the language changes
  useEffect(() => {
    i18n.locale = language;
    forceUpdate((prev) => prev + 1); // Trigger a re-render
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      {/* Display greeting text */}
      <Text style={styles.title}>{i18n.t('greeting')}</Text>

      {/* Navigation Buttons */}
      <Button 
        title={i18n.t('signup')} 
        onPress={() => router.push('/screens/AuthScreen')} 
      />
      <Button 
        title={i18n.t('skipauth')} 
        onPress={() => router.push('/screens/DashBoard')} 
      />

      {/* Language Toggle Button */}
      <Button 
        title={language === 'en' ? 'عربي' : 'English'} 
        onPress={toggleLanguage} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});
