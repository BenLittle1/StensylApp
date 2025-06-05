import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button, Alert } from 'react-native';
// import { useRouter } from 'expo-router'; // useRouter might not be needed if redirection is handled by root layout
import { useAuth } from '../../context/AuthContext'; // Adjusted path

const stensylColors = {
  background: '#101a23',
  textWhite: '#ffffff',
  primaryBlue: '#0c7ff2',
};

const HomeScreen = () => {
  const { user, signOut } = useAuth();

  const firstName = user?.user_metadata?.first_name || 'User';

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation to signin page will be handled by the root layout observing auth state changes
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error?.message || 'An unexpected error occurred.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {firstName}!</Text>
        <Text style={styles.infoText}>
          You are now logged in.
        </Text>
        <Button title="Sign Out" onPress={handleSignOut} color={stensylColors.primaryBlue} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 18,
    color: stensylColors.textWhite,
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default HomeScreen; 