import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { stensylColors } from '@/constants/Colors';
import { Stack } from 'expo-router';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          This screen is a placeholder for future features, like discovering other users or content.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
  },
});
