// app/screens/AuthScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';



const API_URL = process.env.API_ENDPOINT;

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [challengeResponse, setChallengeResponse] = useState('');
  const [isChallengeStep, setIsChallengeStep] = useState(false);
  const [session, setSession] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuthentication = async () => {
    setLoading(true);
    try {
      // Call the /auth/InitiateAuthentication endpoint
      const response = await axios.post(
        process.env.API_ENDPOINT+'/auth/InitiateAuthentication',
        {
          phoneNumber,
        }
      );

      const { session, challengeName } = response.data;

      if (challengeName === 'CUSTOM_CHALLENGE') {
        setSession(session); // Save the session to use in the challenge response
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
        'https://3yd00spnvj.execute-api.us-east-1.amazonaws.com/auth/VerifyChallenge',
        {
          session,
          challengeAnswer: challengeResponse,
        }
      );

      const { idToken, accessToken } = response.data;

      if (idToken && accessToken) {
        Alert.alert('Success', 'Authentication successful!');
        // Navigate to the home screen
        router.push('/(tabs)/two');
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
          <Button
            title={loading ? 'Processing...' : 'Continue'}
            onPress={handleAuthentication}
            disabled={loading || !phoneNumber}
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
