import { Redirect } from 'expo-router';

export default function AppIndex() {
  // For now, always redirect to signin
  // Later, we can add logic here to check for an active session
  return <Redirect href="/signin" />;
} 