import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

const InitialLayout = () => {
  const { isLoading } = useAuth(); // Only need isLoading here for the loading indicator

  // The complex redirection logic is removed.
  // app/index.tsx now handles displaying content based on auth state.

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0c7ff2" />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  // This Stack defines the root-level navigation structure.
  // The main screen is now index.tsx.
  return (
    <Stack>
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Screens for (auth) and (app) groups are removed as their layouts and main screens are deleted */}
      {/* If you add new screens in new groups, you might add group navigators here or in their own _layout.tsx */}
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101a23',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#90adcb'
  }
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
