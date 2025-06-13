import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase'; // Adjusted import path
import { stensylColors } from '@/constants/Colors'; // Adjusted import path
import { NotificationBanner } from '@/components/NotificationBanner';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'error', visible: false });

  const handleLogin = async () => {
    // Clear any existing notifications
    setNotification({ message: '', type: 'error', visible: false });
    
    if (!email || !password) {
      setNotification({
        message: 'Please enter both email and password.',
        type: 'error',
        visible: true
      });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Provide user-friendly error messages
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'You may have entered the wrong email address or password or your account might be locked.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setNotification({
        message: errorMessage,
        type: 'error',
        visible: true
      });
    } else {
      // The auth listener in AuthContext will handle the redirect,
      // but we could also explicitly navigate if needed.
      // router.replace('/(tabs)'); // Example of explicit navigation
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavContainer}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue your progress</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Notification Banner */}
          <NotificationBanner
            message={notification.message}
            type={notification.type}
            visible={notification.visible}
            onDismiss={() => setNotification({ ...notification, visible: false })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={stensylColors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={stensylColors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.footerText}>
                Don&apos;t have an account? <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  kavContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: stensylColors.textMuted,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: stensylColors.inputBackground,
    color: stensylColors.textWhite,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: stensylColors.cardBackground,
  },
  button: {
    backgroundColor: stensylColors.primaryAccent,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: stensylColors.disabledButton,
  },
  buttonText: {
    color: stensylColors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: stensylColors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: stensylColors.primaryAccent,
    fontWeight: 'bold',
  },
}); 