import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Corrected path
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native'; // For loading

const InitialLayout = () => {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    // For inAppGroup, we also consider if segments are defined. An empty segments array might mean the root.
    const inAppGroup = segments.length > 0 && segments[0] === '(app)';

    if (session && !inAppGroup) {
      router.replace('/(app)/home');
    } else if (!session && !inAuthGroup) {
      // If not in auth group and not logged in, go to signin
      // This handles the case where the initial route might be index or an app route directly.
      router.replace('/(auth)/signin');
    }
    // If isLoading is false, and conditions above are not met, 
    // user is in the correct group for their auth state, so no redirect needed.

  }, [session, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0c7ff2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // This Stack defines the root-level navigation structure.
  // Screens within (auth) and (app) groups will be managed by their own _layout.tsx files if they exist.
  return (
    <Stack>
      {/* index is used as an initial entry point, often for splash or initial checks */}
      {/* Redirection logic above should handle moving away from index quickly */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Defines that an (auth) group exists. Its screens are in app/(auth)/ */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* Defines that an (app) group exists. Its screens are in app/(app)/ */}
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
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
