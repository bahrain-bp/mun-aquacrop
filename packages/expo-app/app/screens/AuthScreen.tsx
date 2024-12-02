// app/screens/AuthScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'https://om9882jcr2.execute-api.us-east-1.amazonaws.com'; // Replace with your actual API Gateway URL


const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullname, setFullname] = useState('');
  const [challengeResponse, setChallengeResponse] = useState('');
  const [isChallengeStep, setIsChallengeStep] = useState(false);
  const [session, setSession] = useState('');
  const [sub, setSub] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuthentication = async () => {
    setLoading(true);
    try {
      // Call the /auth/InitiateAuthentication endpoint
      const response = await axios.post(
        `${API_URL}/auth/InitiateAuthentication`,
        {
          phoneNumber,
          fullname,
        }
      );

      const { session, challengeName, sub } = response.data;

      if (challengeName === 'CUSTOM_CHALLENGE') {
        setSession(session); // Save the session to use in the challenge response
        setSub(sub); // Save the sub to use in the challenge response
        setIsChallengeStep(true); // Move to challenge step
        Alert.alert('Challenge Sent', 'Please enter the verification code sent to your phone.');
      } else {
        Alert.alert('Error', 'Unexpected authentication flow.');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error ? error.response.data.error : 'Failed to initiate authentication.';
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

  return (
    <View style={styles.container}>
      {!isChallengeStep ? (
        <>
          <Text style={styles.label}>Enter Phone Number:</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1234567890"
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Enter Fullname:</Text>
          <TextInput
            style={styles.input}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Fullname"
          />
          <Button
            title={loading ? 'Processing...' : 'Continue'}
            onPress={handleAuthentication}
            disabled={loading || !phoneNumber || !fullname}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter Verification Code:</Text>
          <TextInput
            style={styles.input}
            value={challengeResponse}
            onChangeText={setChallengeResponse}
            placeholder="Verification Code"
            keyboardType="numeric"
          />
          <Button
            title={loading ? 'Verifying...' : 'Verify'}
            onPress={handleVerifyChallenge}
            disabled={loading || !challengeResponse}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    padding: 8,
    fontSize: 16,
  },
});

export default AuthScreen;
