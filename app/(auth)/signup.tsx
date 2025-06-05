import { Link, useRouter } from 'expo-router'; // For navigation
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Updated path for Supabase client

// Define your theme colors (consistent with signin page)
const stensylColors = {
  background: '#101a23',
  cardBackground: '#223649', // For input backgrounds
  textWhite: '#ffffff',
  textMuted: '#90adcb',
  primaryBlue: '#0c7ff2',
  focusRingBlue: '#0c7ff2',
  errorRed: '#e53e3e',
};

const StensylSignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [program, setProgram] = useState('');
  const [year, setYear] = useState('');

  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isUniversityFocused, setIsUniversityFocused] = useState(false);
  const [isProgramFocused, setIsProgramFocused] = useState(false);
  const [isYearFocused, setIsYearFocused] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields (Full Name, Email, Password).');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', "The passwords you entered don't match. Please re-enter them.");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const userMetadata: { [key: string]: any } = {
      full_name: fullName.trim(),
      first_name: fullName.trim().split(' ')[0],
    };
    if (university.trim()) userMetadata.university = university.trim();
    if (program.trim()) userMetadata.program = program.trim();
    if (year.trim()) userMetadata.year_of_study = year.trim();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: userMetadata,
      },
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else if (data.user) {
      if (!data.session && data.user.identities && data.user.identities.length > 0) {
         Alert.alert(
          'Registration Successful!',
          'Please check your email to confirm your account before signing in.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/signin') }] // Updated redirect path
        );
      } else {
        Alert.alert(
          'Registration Successful!',
          'Your account has been created. You can now sign in.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/signin') }] // Updated redirect path
        );
      }
       setFullName('');
       setEmail('');
       setPassword('');
       setConfirmPassword('');
       setUniversity('');
       setProgram('');
       setYear('');
    } else {
        Alert.alert('Sign Up Failed', 'An unexpected error occurred during registration. Please try again.');
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
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.mainContainer, { maxWidth: contentMaxWidth }]}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoBackground}>
                <Text style={styles.logoText}>S</Text>
              </View>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join stensyl today!</Text>
            <View style={styles.form}>
              <TextInput
                style={[styles.input, isFullNameFocused && styles.inputFocused]}
                placeholder="Full Name"
                placeholderTextColor={stensylColors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setIsFullNameFocused(true)}
                onBlur={() => setIsFullNameFocused(false)}
                autoCapitalize="words"
                textContentType="name"
                accessibilityLabel="Full Name"
              />
              <TextInput
                style={[styles.input, styles.inputSpacing, isEmailFocused && styles.inputFocused]}
                placeholder="Email Address"
                placeholderTextColor={stensylColors.textMuted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel="Email Address"
              />
              <TextInput
                style={[styles.input, styles.inputSpacing, isPasswordFocused && styles.inputFocused]}
                placeholder="Password"
                placeholderTextColor={stensylColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                textContentType="newPassword"
                accessibilityLabel="Password"
              />
              <TextInput
                style={[styles.input, styles.inputSpacing, isConfirmPasswordFocused && styles.inputFocused]}
                placeholder="Confirm Password"
                placeholderTextColor={stensylColors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
                textContentType="newPassword"
                accessibilityLabel="Confirm Password"
              />
              <TextInput
                style={[styles.input, styles.inputSpacing, isUniversityFocused && styles.inputFocused]}
                placeholder="University (Optional)"
                placeholderTextColor={stensylColors.textMuted}
                value={university}
                onChangeText={setUniversity}
                onFocus={() => setIsUniversityFocused(true)}
                onBlur={() => setIsUniversityFocused(false)}
                autoCapitalize="words"
                accessibilityLabel="University"
              />
              <TextInput
                style={[styles.input, styles.inputSpacing, isProgramFocused && styles.inputFocused]}
                placeholder="Program (Optional)"
                placeholderTextColor={stensylColors.textMuted}
                value={program}
                onChangeText={setProgram}
                onFocus={() => setIsProgramFocused(true)}
                onBlur={() => setIsProgramFocused(false)}
                autoCapitalize="sentences"
                accessibilityLabel="Program"
              />
              <TextInput
                style={[styles.input, styles.inputSpacing, isYearFocused && styles.inputFocused]}
                placeholder="Year of Study (e.g., 1st, 2nd, Grad) (Optional)"
                placeholderTextColor={stensylColors.textMuted}
                value={year}
                onChangeText={setYear}
                onFocus={() => setIsYearFocused(true)}
                onBlur={() => setIsYearFocused(false)}
                accessibilityLabel="Year of Study"
              />
              <TouchableOpacity
                style={[styles.button, styles.inputSpacing]}
                onPress={handleSignUp}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              {/* Link to signin within the (auth) group */}
              <Link href="/(auth)/signin" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
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
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: stensylColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    color: stensylColors.textWhite,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : -0.25,
    color: stensylColors.textWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
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
  inputSpacing: {
    marginTop: 16,
  },
  inputFocused: {
    borderColor: stensylColors.focusRingBlue,
  },
  button: {
    width: '100%',
    backgroundColor: stensylColors.primaryBlue,
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
  signInContainer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.primaryBlue,
  },
});

export default StensylSignupScreen; 