import { Redirect } from 'expo-router';
import React from 'react';

export default function AppIndex() {
  // This component now ONLY redirects to the main tab navigator.
  // All other imports, styles, and logic have been removed.
  return <Redirect href="/(tabs)" />;
} 