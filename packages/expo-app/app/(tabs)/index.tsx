import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button ,ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { storage } from '../utils/storage';
import i18n from '../i18n';

// Configure AWS SDK with the region from environment variabless
AWS.config.update({
  region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1', // Default to 'us-east-1' if not set
});

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
    </View>
  );
};

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
    if (!storedRefreshToken) return false;

    const cognito = new CognitoIdentityServiceProvider();
    const params = {
      ClientId: process.env.EXPO_PUBLIC_AWS_USERPOOL_CLIENTID || '',
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        'REFRESH_TOKEN': storedRefreshToken,
        'CLIENT_ID': process.env.EXPO_PUBLIC_AWS_USERPOOL_CLIENTID || '',
      },
    };

    const data = await cognito.initiateAuth(params).promise();

    if (data.AuthenticationResult) {
      const { AccessToken, IdToken } = data.AuthenticationResult;
      if (AccessToken) await storage.setItem('accessToken', AccessToken);
      if (IdToken) await storage.setItem('idToken', IdToken);
      return { success: true, accessToken: AccessToken };
    }
    return { success: false, accessToken: null };
  } catch (e) {
    console.error('Error refreshing token:', e);
    return { success: false, accessToken: null };
  }
};

const isAuthenticated = async () => {
  try {
    const accessToken = await getToken();
    if (!accessToken) return { authenticated: false, userName: '' };

    try {
      const validation = await validateToken(accessToken);
      return { authenticated: true, userName: validation.userName };
    } catch (error) {
      // Token expired, try refreshing
      if ((error as any).code === 'NotAuthorizedException') {
        const refreshResult = await refreshToken();
        if (refreshResult && refreshResult.success && refreshResult.accessToken) {
          const validation = await validateToken(refreshResult.accessToken);
          return { authenticated: true, userName: validation.userName };
        }
      }
      return { authenticated: false, userName: '' };
    }
  } catch (e) {
    console.error('Error checking authentication status:', e);
    return { authenticated: false, userName: '' };
  }
};

export default function Page() {
  const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en');
  const [_, forceUpdate] = useState(0); // Used to force a re-render

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
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
