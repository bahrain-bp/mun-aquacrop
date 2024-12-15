import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { storage } from '../utils/storage';

// Configure AWS SDK with the region from environment variables
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
    const token = await storage.getItem('accessToken');
    if (token) {
      console.log('Retrieved Token:', token);
      return token;
    } else {
      console.log('No token found');
    }
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
    console.log('Token is valid:', data);
    return data;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
};

const refreshToken = async () => {
  try {
    const storedRefreshToken = await storage.getItem('refreshToken');
    if (!storedRefreshToken) return false;

    const cognito = new CognitoIdentityServiceProvider();
    const params = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.EXPO_PUBLIC_AWS_USERPOOL_CLIENTID || '',
      AuthParameters: {
        REFRESH_TOKEN: storedRefreshToken,
      },
    };

    const data = await cognito.initiateAuth(params).promise();

    if (data.AuthenticationResult) {
      const { IdToken, AccessToken, RefreshToken } = data.AuthenticationResult;
      if (IdToken) {
        await storage.setItem('idToken', IdToken);
      }
      if (AccessToken) {
        await storage.setItem('accessToken', AccessToken);
      }
      if (RefreshToken) {
        await storage.setItem('refreshToken', RefreshToken);
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error refreshing token:', e);
    return false;
  }
};

const isAuthenticated = async () => {
  try {
    const idToken = await getToken();
    if (!idToken) return false;

    const isValid = await validateToken(idToken);
    if (!isValid) {
      const refreshed = await refreshToken();
      return refreshed;
    }

    return true;
  } catch (e) {
    console.error('Error checking authentication status:', e);
    return false;
  }
};

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        router.replace('/screens/DashBoard');
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
      <Text style={styles.title}>Welcome to My App!</Text>

      {/* Navigation Links */}
      <Link style={styles.link} href="/screens/AuthScreen">
        Signup
      </Link>
      <Link style={styles.link} href="/screens/DashBoard">
        Skip Auth
      </Link>
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
  link: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 10,
  },
});
