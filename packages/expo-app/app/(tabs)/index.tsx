import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
    </View>
  );
};

export default function Page() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App!</Text>
      
      {/* Navigation Links */}
      <Link style={styles.link} href="/screens/SignupScreen">
        Go to Signup
      </Link>
      <Link style={styles.link} href="/screens/LoginScreen">
        Go to Login
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
