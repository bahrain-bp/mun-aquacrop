// // app/(tabs)/_layout.tsx
// import React from 'react';
// import { Tabs } from 'expo-router';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import { useColorScheme } from 'react-native';
//
// function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
//   return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
// }
//
// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }
