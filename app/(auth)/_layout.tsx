import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  // This layout can be used to configure a stack navigator for the (auth) group
  // For example, common headers or screen options for signin/signup.
  return <Stack screenOptions={{ headerShown: false }} />;
} 