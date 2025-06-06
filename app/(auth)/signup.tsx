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

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Account created! Please check your email to verify and then sign in.');
      router.replace('/(auth)/login');
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