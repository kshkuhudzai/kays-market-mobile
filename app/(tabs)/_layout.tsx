import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2ecc71', // Our marketplace green
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#2c3e50',
        },
      }}>

      {/* Tab 1: The Home Screen we just built */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <FontAwesome name="shopping-bag" size={24} color={color} />,
          headerTitle: 'Kays Market',
        }}
      />

      {/* Tab 2: The Sell Screen we are about to build */}
      <Tabs.Screen
        name="two"
        options={{
          title: 'Sell',
          tabBarIcon: ({ color }) => <FontAwesome name="camera" size={24} color={color} />,
          headerTitle: 'Post a New Item',
        }}
      />
    </Tabs>
  );
}