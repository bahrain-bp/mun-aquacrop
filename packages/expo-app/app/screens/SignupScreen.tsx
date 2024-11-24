// app/screens/SignupScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn, confirmSignIn } from '@aws-amplify/auth';

const SignupScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [challengeResponse, setChallengeResponse] = useState('');
  const [isChallengeStep, setIsChallengeStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Start the custom authentication flow
      const { nextStep } = await signIn({
        username: phoneNumber,
        options: {
          authFlowType: 'CUSTOM_WITHOUT_SRP',
        },
      });

      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
        setIsChallengeStep(true);
        Alert.alert('Challenge Received', 'Please enter the verification code.');
      } else {
        Alert.alert('Error', 'Unexpected authentication flow.');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message || 'An error occurred during sign-in.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChallenge = async () => {
    setLoading(true);
    try {
      // Respond to the custom challenge
      const { nextStep } = await confirmSignIn({
        challengeResponse,
      });

      if (!nextStep) {
        Alert.alert('Success', 'Authentication successful!');
        router.push('/screens/LoginScreen'); // Navigate to the home screen
      } else {
        Alert.alert('Error', 'Unexpected next step. Contact support.');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message || 'Failed to confirm the challenge.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
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
            title={loading ? 'Starting...' : 'Sign In'}
            onPress={handleSignIn}
            disabled={loading || !phoneNumber}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter Challenge Response:</Text>
          <TextInput
            style={styles.input}
            value={challengeResponse}
            onChangeText={setChallengeResponse}
            placeholder="Challenge Response"
            keyboardType="numeric"
          />
          <Button
            title={loading ? 'Verifying...' : 'Confirm Challenge'}
            onPress={handleConfirmChallenge}
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

export default SignupScreen;
