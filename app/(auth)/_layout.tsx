import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  // This layout will hide the header for the auth screens
  // and they will not be part of the main tab navigator.
  return <Stack screenOptions={{ headerShown: false }} />;
} 