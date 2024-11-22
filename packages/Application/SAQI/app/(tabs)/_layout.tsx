import { Tabs } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // This will be for the icon color
        tabBarActiveTintColor: "#ffd33d",
        // This will define the header back ground color
        headerStyle: {
          backgroundColor: "#25292e",
        },
        // This will remove the unneeded border
        headerShadowVisible: false,
        // This is the color of the text in the header
        headerTintColor: "#fff",
        // This is the background color of the tabs bar in the end o the page
        tabBarStyle:{
          backgroundColor: "#25292e",
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          headerTitle: 'Home',
          tabBarIcon: ({focused,color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={30} />,
        }} />
      <Tabs.Screen name="about" options={{
        headerTitle: 'about'
      }}/>
      
      <Tabs.Screen name='+not-found' options={{}}/>
    </Tabs>
  );
}
