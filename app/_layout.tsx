import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { stensylColors } from '@/constants/Colors';

const InitialLayout = () => {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait until the session is loaded

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is not signed in and not in the auth group,
    // redirect them to the login page.
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // If the user is signed in and in the auth group (e.g., on login page),
    // redirect them to the main app (tabs).
    else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  // This Stack defines the root-level navigation structure.
  // It allows access to both the main app (tabs) and the auth flow.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* You can add other top-level screens here if needed, e.g., a global modal */}
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: stensylColors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: stensylColors.textMuted
  }
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}

