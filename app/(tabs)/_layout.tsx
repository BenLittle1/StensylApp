import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Make sure this path is correct
import TabBarBackground from '@/components/ui/TabBarBackground'; // Make sure this path is correct
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index" // Corresponds to app/(tabs)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study" // This MUST match your filename: app/(tabs)/study.tsx
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="timer" color={color} />,
        }}
      />
      {/* START OF NEW TAB CONFIGURATION FOR HISTORY SCREEN */}
      <Tabs.Screen
        name="history" // This will correspond to app/(tabs)/history.tsx
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />, 
          // Other potential icon names: "clock.arrow.circlepath", "book.closed.fill", or whatever your IconSymbol supports
        }}
      />
      {/* END OF NEW TAB CONFIGURATION FOR HISTORY SCREEN */}
      <Tabs.Screen
        name="explore" // Corresponds to app/(tabs)/explore.tsx
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}