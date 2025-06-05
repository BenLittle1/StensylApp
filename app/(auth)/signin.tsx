import { Link, useRouter } from 'expo-router'; // For navigation
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Updated path for Supabase client

// Define your theme colors for easy reuse
const stensylColors = {
  background: '#101a23',
  cardBackground: '#223649', // For logo and input backgrounds
  textWhite: '#ffffff',
  textMuted: '#90adcb',
  primaryBlue: '#0c7ff2',
  focusRingBlue: '#0c7ff2',
};

const StensylSigninScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Login Failed', 'Please enter both email and password.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      Alert.alert('Sign-In Error', 'Invalid email or password. Please check your credentials and try again.');
    } else if (data.user && data.session) {
      const firstName = data.user.user_metadata?.first_name || 'User';
      
      setEmail('');
      setPassword('');
      
      // Navigate to home screen within the (app) group
      router.replace('/(app)/home'); 
      // We will handle passing params like firstName via context or a global store later
      // For now, the home screen will fetch the user from context
    } else {
      Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const contentMaxWidth = Math.min(screenWidth * 0.9, 420);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={[styles.mainContainer, { maxWidth: contentMaxWidth }]}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoBackground}>
              <Text style={styles.logoText}>S</Text>
            </View>
          </View>
          <Text style={styles.title}>Welcome to Stensyl</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                isEmailFocused && styles.inputFocused,
              ]}
              placeholder="Email"
              placeholderTextColor={stensylColors.textMuted}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Email"
            />
            <TextInput
              style={[
                styles.input,
                isPasswordFocused && styles.inputFocused,
                { marginTop: 24 },
              ]}
              placeholder="Password"
              placeholderTextColor={stensylColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              autoComplete="current-password"
              textContentType="password"
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              style={[styles.button, { marginTop: 24 }]} 
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            {/* Link to signup within the (auth) group */}
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: stensylColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    color: stensylColors.textWhite,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : -0.25,
    color: stensylColors.textWhite,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: stensylColors.textWhite,
    borderWidth: 2,
    borderColor: stensylColors.cardBackground,
  },
  inputFocused: {
    borderColor: stensylColors.focusRingBlue,
  },
  button: {
    width: '100%',
    backgroundColor: stensylColors.primaryBlue,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    lineHeight: 22,
    letterSpacing: 0.015 * 16,
  },
  signupContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.primaryBlue,
  },
});

export default StensylSigninScreen; 