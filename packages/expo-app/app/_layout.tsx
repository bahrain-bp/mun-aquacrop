// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Define the main tab navigator */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Define standalone screens */}
      <Stack.Screen name="screens/AuthScreen" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="screens/DashBoard" options={{ title: 'DashBoard' }} />
        <Stack.Screen name="screens/Recommendation" options={{ title: 'Recommendation' }} />
        <Stack.Screen name="screens/Crop" options={{ title: 'Crop' }} />
    </Stack>
  );
}
