import { Stack } from 'expo-router';
import React from 'react';

export default function AppScreensLayout() {
  // This layout can be used to configure a stack navigator for the (app) group
  // For example, common headers for all authenticated screens.
  return <Stack screenOptions={{ headerShown: false }} />;
} 