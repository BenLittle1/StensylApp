import { Link, useRouter } from 'expo-router';
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
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { stensylColors } from '@/constants/Colors';
import { NotificationBanner } from '@/components/NotificationBanner';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'error', visible: false });

  const handleSignUp = async () => {
    // Clear any existing notifications
    setNotification({ message: '', type: 'error', visible: false });
    
    if (!email || !password || !fullName) {
      setNotification({
        message: 'Please fill in all fields.',
        type: 'error',
        visible: true
      });
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      // Log the full error for debugging
      console.log('Signup error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message;
      
      // Handle password errors first (most specific)
      if (error.message.includes('Password should be at least') ||
          error.message.includes('weak password') ||
          error.message.includes('password') && error.message.includes('weak')) {
        errorMessage = 'Password must be at least 6 characters long and contain a mix of letters and numbers.';
      } 
      // Then check for duplicate user errors (more specific patterns)
      else if (error.message.includes('User already registered') ||
               (error.message.includes('already registered') && !error.message.includes('password')) ||
               error.message.includes('Email address already registered') ||
               error.code === 'user_already_exists') {
        errorMessage = 'There is already an account associated with this email address. Please try signing in instead.';
      } 
      // Other validation errors
      else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('signup is disabled')) {
        errorMessage = 'Account creation is currently disabled. Please contact support.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many signup attempts. Please wait a moment before trying again.';
      }
      
      setNotification({
        message: errorMessage,
        type: 'error',
        visible: true
      });
    } else {
      // Log the full response for debugging
      console.log('Signup success data:', data);
      
      // User creation was successful
      setNotification({
        message: 'Account created! Please check your email to verify and then sign in.',
        type: 'success',
        visible: true
      });
      
      // Navigate after a brief delay to allow user to see the success message
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join the Stensyl community</Text>
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
              placeholder="Full Name"
              placeholderTextColor={stensylColors.textMuted}
              value={fullName}
              onChangeText={setFullName}
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
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerText}>
                  Already have an account? <Text style={styles.linkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
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
  },
  scrollContainer: {
    flexGrow: 1,
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