import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons

export default function TabLayout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // 1. Check if the user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          router.replace('/login');
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 2. Add a logout function to clear the token and kick them to login
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/login');
  };

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2ecc71',
        headerShown: true, // FIX 1: Turns header on so it doesn't hit the status bar
        headerRight: () => ( // FIX 2: Adds the logout button to the top right
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        )
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> // FIX 3: Restores icons
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Sell',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={24} color={color} /> // FIX 3: Restores icons
        }}
      />
    </Tabs>
  );
}