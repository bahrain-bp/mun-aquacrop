import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button , ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { storage } from '../utils/storage';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure AWS SDK with the region from environment variables
AWS.config.update({
  region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1', // Default to 'us-east-1' if not set
});

const getToken = async () => {
  try {
    return await storage.getItem('accessToken');
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

const validateToken = async (accessToken: string) => {
  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  const params = {
    AccessToken: accessToken,
  };

  try {
    const data = await cognitoidentityserviceprovider.getUser(params).promise();
    const userName = data.UserAttributes.find(attr => attr.Name === 'name')?.Value || '';
    if (userName) {
      await storage.setItem('userName', userName);
    }
    return { isValid: true, userName };
  } catch (error) {
    return { isValid: false, userName: '' };
  }
};

const refreshToken = async () => {
  try {
    const storedRefreshToken = await storage.getItem('refreshToken');
    if (!storedRefreshToken) return { success: false, accessToken: null };

    const cognito = new CognitoIdentityServiceProvider();
    const params = {
      ClientId: process.env.EXPO_PUBLIC_AWS_USERPOOL_CLIENTID || '',
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: storedRefreshToken,
        CLIENT_ID: process.env.EXPO_PUBLIC_AWS_USERPOOL_CLIENTID || '',
      },
    };

    const data = await cognito.initiateAuth(params).promise();

    if (data.AuthenticationResult) {
      const { AccessToken, IdToken } = data.AuthenticationResult;
      
      // Store both tokens
      if (AccessToken) await storage.setItem('accessToken', AccessToken);
      if (IdToken) await storage.setItem('idToken', IdToken);
      
      return { success: true, accessToken: AccessToken, idToken: IdToken };
    }
    return { success: false, accessToken: null, idToken: null };
  } catch (e) {
    console.error('Error refreshing token:', e);
    // Clear all tokens on refresh failure
    await storage.removeItem('accessToken');
    await storage.removeItem('idToken');
    await storage.removeItem('refreshToken');
    return { success: false, accessToken: null, idToken: null };
  }
};

const isAuthenticated = async () => {
  try {
    const accessToken = await getToken();
    const idToken = await storage.getItem('idToken');
    
    if (!accessToken || !idToken) {
      const refreshResult = await refreshToken();
      if (!refreshResult.success) {
        return { authenticated: false, userName: '' };
      }
    }

    if (!accessToken) {
      throw new Error('Access token is missing');
    }
    const validation = await validateToken(accessToken);
    if (!validation.isValid) {
      const refreshResult = await refreshToken();
      if (!refreshResult.success) {
        return { authenticated: false, userName: '' };
      }
      return { authenticated: true, userName: validation.userName };
    }

    return { authenticated: true, userName: validation.userName };
  } catch (e) {
    console.error('Error checking authentication status:', e);
    return { authenticated: false, userName: '' };
  }
};

export default function Page() {
  const router = useRouter();
  const [language, setLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the saved language preference

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
      } finally {
        setLoading(false); // Mark loading as complete
      }
    };

    loadLanguage();
  }, []);

  // Toggle the language and save the preference
  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18n.locale = newLang;
    try {
      await AsyncStorage.setItem('language', newLang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { authenticated, userName } = await isAuthenticated();
      if (authenticated) {
        router.replace({
          pathname: '/screens/DashBoard',
          params: { userName }
        });
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
      // Display a loading indicator while the language is being loaded
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
      source={{ uri: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/saqi-logo-2' }}
      style={styles.logo}
      />

      {/* Display greeting text */}
      <Text style={styles.title}>{i18n.t('greeting')}</Text>
  
      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push('/screens/AuthScreen')}
        >
          <Text style={styles.buttonText}>{i18n.t('signup')}</Text>
        </TouchableOpacity>
        
      </View>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    color: '#032239',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#032239',
  },
  skipButton: {
    backgroundColor: '#032239',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flagsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  flagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 40,
    height: 30,
  },
  flagText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
