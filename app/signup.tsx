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
} from 'react-native';

// Define your theme colors (consistent with signin page)
const stensylColors = {
  background: '#101a23',
  cardBackground: '#223649', // For input backgrounds
  textWhite: '#ffffff',
  textMuted: '#90adcb',
  primaryBlue: '#0c7ff2',
  focusRingBlue: '#0c7ff2',
  errorRed: '#e53e3e', // For potential error messages
};

const StensylSignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [program, setProgram] = useState('');
  const [year, setYear] = useState(''); // Could be a string like "1st", "2nd", or a number

  // Focus states for inputs
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isUniversityFocused, setIsUniversityFocused] = useState(false);
  const [isProgramFocused, setIsProgramFocused] = useState(false);
  const [isYearFocused, setIsYearFocused] = useState(false);

  const router = useRouter();

  const handleSignUp = () => {
    // TODO: Implement your account creation logic here
    // 1. Validate inputs (e.g., passwords match, email format is correct)
    // 2. Make API call to create account
    // 3. Handle success/error responses
    console.log('Sign Up submitted with:', {
      fullName,
      email,
      password,
      university,
      program,
      year,
    });
    if (password !== confirmPassword) {
      // TODO: Show an error message to the user
      console.error("Passwords don't match!");
      return;
    }
    // Example: router.replace('/home'); // Navigate to home screen or email verification on success
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
          keyboardShouldPersistTaps="handled" // Ensures taps outside input dismiss keyboard
        >
          <View style={[styles.mainContainer, { maxWidth: contentMaxWidth }]}>
            {/* Logo Section (Optional, can be removed if not desired on sign-up) */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoBackground}>
                <Text style={styles.logoText}>S</Text>
              </View>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join stensyl today!</Text>

            <View style={styles.form}>
              {/* Full Name */}
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

              {/* Email */}
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

              {/* Password */}
              <TextInput
                style={[styles.input, styles.inputSpacing, isPasswordFocused && styles.inputFocused]}
                placeholder="Password"
                placeholderTextColor={stensylColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                textContentType="newPassword" // Helps with password managers
                accessibilityLabel="Password"
              />

              {/* Confirm Password */}
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

              {/* University */}
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

              {/* Program */}
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

              {/* Year */}
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
              <Link href={"/signin" as any} asChild>
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
    flexGrow: 1, // Allows content to grow and enable scrolling if needed
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Add some vertical padding for scrollable content
    paddingHorizontal: 16,
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24, // Slightly less margin than sign-in
  },
  logoBackground: {
    width: 80, // Slightly smaller logo for sign-up
    height: 80,
    borderRadius: 40,
    backgroundColor: stensylColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40, // Adjusted for smaller logo
    color: stensylColors.textWhite,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28, // Slightly smaller title
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
    marginBottom: 24, // Space before the form
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
    marginTop: 16, // Consistent spacing between inputs and button
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
    marginTop: 32, // More space before "Already have an account?"
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Add some margin at the very bottom
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
