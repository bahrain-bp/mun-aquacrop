import { Text, View, StyleSheet } from 'react-native';
 import { Link } from 'expo-router'; 
import React from 'react';

const API_URL = process.env.EXPO_PUBLIC_DEV_API_URL; // Replace with your actual API URL
export default function Index() {
  console.log("Hello")
  console.log(API_URL)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      <Link href="/about" style={styles.button}>
        Go to About screen
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
