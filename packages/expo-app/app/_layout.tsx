// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Define the main tab navigator */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Define standalone screens */}
      <Stack.Screen name="screens/SignupScreen" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="screens/LoginScreen" options={{ title: 'Login' }} />
    </Stack>
  );
}
