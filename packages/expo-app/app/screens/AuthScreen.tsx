// app/screens/AuthScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { storage } from '../utils/storage';
import i18n from '../i18n'; // Import the shared i18n instance
import CountrySelect from '../components/CountrySelect';

const API_URL = process.env.EXPO_PUBLIC_API_ENDPOINT; // Replace with your actual API Gateway URL

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullname, setFullname] = useState('');
  const [challengeResponse, setChallengeResponse] = useState('');
  const [isChallengeStep, setIsChallengeStep] = useState(false);
  const [session, setSession] = useState('');
  const [sub, setSub] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [countryCode, setCountryCode] = useState('BH');
  const [callingCode, setCallingCode] = useState('+973');
  const [countryFlag, setCountryFlag] = useState('🇧🇭');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const router = useRouter();

  const onSelectCountry = (country: { code: string; dial_code: string; flag: string }) => {
    setCountryCode(country.code);
    setCallingCode(country.dial_code);
    setCountryFlag(country.flag);
  };

  const handleAuthentication = async () => {
    setLoading(true);
    try {
      const fullPhoneNumber = `${callingCode}${phoneNumber}`;
      const response = await axios.post(
        `${API_URL}/auth/InitiateAuthentication`,
        {
          phoneNumber: fullPhoneNumber,
          fullname,
          isLogin: activeTab === 'login'
        }
      );

      const { session, challengeName, sub } = response.data;

      if (challengeName === 'CUSTOM_CHALLENGE') {
        setSession(session);
        setSub(sub);
        setIsChallengeStep(true);
        Alert.alert('Challenge Sent', 'Please enter the verification code sent to your phone.');
      } else {
        Alert.alert('Error', 'Unexpected authentication flow.');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error 
        ? error.response.data.error 
        : 'Failed to initiate authentication.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChallenge = async () => {
    setLoading(true);
    try {
      // Call the /auth/VerifyChallenge endpoint
      const response = await axios.post(
        `${API_URL}/auth/VerifyChallenge`,
        {
          session,
          challengeAnswer: challengeResponse,
          sub,
          phoneNumber,
          fullname,
        }
      );

      const { idToken, accessToken } = response.data;


      // Save the token using the unified storage utility
      const saveToken = async (idToken: string): Promise<void> => {
        try {
          await storage.setItem('idToken', idToken);
          await storage.setItem('accessToken', accessToken);

          console.log('Token saved successfully!');
        } catch (error) {
          console.error('Error saving token:', error);
        }
      };

      await saveToken(idToken);

      if (idToken && accessToken) {
        Alert.alert('Success', 'Authentication successful!');
        // Navigate to the home screen
        router.push('/screens/DashBoard');
      } else {
        Alert.alert('Error', 'Unexpected response. Contact support.');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error ? error.response.data.error : 'Failed to confirm the challenge.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    await handleAuthentication();
  };

  const handleRegisterSubmit = async () => {
    if (!phoneNumber || !fullname) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    await handleAuthentication();
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'login' && styles.activeTab]}
        onPress={() => setActiveTab('login')}
      >
        <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'register' && styles.activeTab]}
        onPress={() => setActiveTab('register')}
      >
        <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Register</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhoneInput = () => (
    <View style={styles.phoneInputContainer}>
      <TouchableOpacity
        style={styles.countryPickerButton}
        onPress={() => setCountryPickerVisible(true)}
      >
        <Text style={styles.flagText}>{countryFlag}</Text>
        <Text style={styles.callingCodeText}>{callingCode}</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.phoneInput}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone number"
        keyboardType="phone-pad"
      />
      <CountrySelect
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={onSelectCountry}
      />
    </View>
  );

  if (isChallengeStep) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image 
            source={{ uri: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/saqi-logo-2' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.card}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>Enter the code sent to your phone</Text>
            <TextInput
              style={styles.input}
              value={challengeResponse}
              onChangeText={setChallengeResponse}
              placeholder="Enter verification code"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyChallenge}
              disabled={loading || !challengeResponse}
            >
              <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={{ uri: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/saqi-logo-2' }}
          style={styles.logo}
          resizeMode="contain"
        />
        {renderTabs()}
        <View style={styles.card}>
          {activeTab === 'login' ? (
            <>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login with your phone number</Text>
              {renderPhoneInput()}
              <TouchableOpacity onPress={() => setActiveTab('register')}>
                <Text style={styles.redirectText}>New to the app? Register Here!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleLoginSubmit}
                disabled={loading || !phoneNumber}
              >
                <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Login'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Register with your details</Text>
              {renderPhoneInput()}
              <TextInput
                style={styles.input}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Full Name"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleRegisterSubmit}
                disabled={loading || !phoneNumber || !fullname}
              >
                <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Register'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    borderRadius: 12,
    backgroundColor: '#E8EDF3',
    padding: 5,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    color: '#8895A7',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2D3748',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
    color: '#2D3748',
  },
  button: {
    backgroundColor: '#2B6CB0',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2B6CB0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  redirectText: {
    color: '#2B6CB0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16, 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F7FAFC',
    marginRight: 8,
    minWidth: 100,
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  callingCodeText: {
    fontSize: 16,
    color: '#2D3748',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
    color: '#2D3748',
  },
});

export default AuthScreen;
