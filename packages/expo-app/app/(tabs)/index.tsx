import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
    </View>
  );
};

const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const clientId = process.env.EXPO_PUBLIC_AWS_USERPOOL_CLIENTID; 
    const refreshUrl = `https://cognito-idp.us-east-1.amazonaws.com/`;

    if (!refreshToken) return false;

    const response = await axios.post(refreshUrl, {
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: clientId,
    });

    const { IdToken, AccessToken } = response.data.AuthenticationResult;
    await AsyncStorage.setItem('idToken', IdToken);
    await AsyncStorage.setItem('accessToken', AccessToken);
    return true;
  } catch (e) {
    console.error("Error refreshing token:", e);
    return false;
  }
};

const decodeJwt = (token: string) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return null;
  }
};

const isAuthenticated = async () => {
  try {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) return false;

    const decodedToken = decodeJwt(idToken);
    if (!decodedToken || !decodedToken.exp) {
      return false;
    }
    const currentTime = Date.now() / 1000;

    // Check if the token is expired
    if (decodedToken.exp < currentTime) {
      const refreshed = await refreshToken();
      return refreshed;
    }

    return true;
  } catch (e) {
    console.error("Error checking authentication status:", e);
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
