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
} from 'react-native';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    // TODO: Implement your authentication logic here
    console.log('Login submitted with:', username, password);
    // Example: router.replace('/home'); // Navigate to home screen on success
  };

  // For `max-w-md` equivalent (md is typically 768px in web, adjust for mobile needs)
  const screenWidth = Dimensions.get('window').width;
  const contentMaxWidth = Math.min(screenWidth * 0.9, 420); // Adjust 420 as needed

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={[styles.mainContainer, { maxWidth: contentMaxWidth }]}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoBackground}>
              <Text style={styles.logoText}>S</Text>
            </View>
          </View>

          {/* Welcome Text */}
          <Text style={styles.title}>Welcome to Stensyl</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Form Inputs */}
          <View style={styles.form}>
            {/* Username */}
            <TextInput
              style={[
                styles.input,
                isUsernameFocused && styles.inputFocused,
              ]}
              placeholder="Username"
              placeholderTextColor={stensylColors.textMuted}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(false)}
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username" // For iOS autofill
              accessibilityLabel="Username" // For sr-only
            />

            {/* Password */}
            <TextInput
              style={[
                styles.input,
                isPasswordFocused && styles.inputFocused,
                { marginTop: 24 }, // space-y-6 between inputs
              ]}
              placeholder="Password"
              placeholderTextColor={stensylColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              autoComplete="current-password"
              textContentType="password" // For iOS autofill
              accessibilityLabel="Password" // For sr-only
            />

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, { marginTop: 24 }]} // space-y-6
              onPress={handleLogin}
              activeOpacity={0.85} // Simulates hover:bg-opacity-90
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <Link href={"/signup" as any} asChild>
              {/* Ensure you have an app/signup.tsx file or adjust href */}
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
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    padding: 16, // p-4 from group/design-root
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center', // Center children like logo and text
  },
  logoWrapper: {
    alignItems: 'center', // Center the logo itself
    marginBottom: 32, // mb-8
  },
  logoBackground: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48, // rounded-full
    backgroundColor: stensylColors.cardBackground, // bg-[#223649]
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48, // Adjusted from text-3xl to make 'S' prominent
    color: stensylColors.textWhite,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30, // text-3xl (Tailwind text-3xl is often 30px or 1.875rem)
    fontWeight: 'bold',
    // tracking-tighter:
    letterSpacing: Platform.OS === 'ios' ? -0.5 : -0.25, // Adjust for platform differences
    color: stensylColors.textWhite,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8, // mt-2
    fontSize: 14, // text-sm
    color: stensylColors.textMuted, // text-[#90adcb]
    textAlign: 'center',
    marginBottom: 32, // Creates space before the form (part of space-y-8 effect)
  },
  form: {
    width: '100%',
    // space-y-6 is handled by adding marginTop to individual form elements
  },
  input: {
    width: '100%',
    height: 56, // h-14
    backgroundColor: stensylColors.cardBackground, // bg-[#223649]
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 16, // p-4 for horizontal padding
    fontSize: 16, // text-base
    color: stensylColors.textWhite,
    // placeholder:text-[#90adcb] is handled by placeholderTextColor prop
    // border-none initially, border added on focus
    borderWidth: 2, // Prepare for focus ring
    borderColor: stensylColors.cardBackground, // Initial border same as background (invisible "offset")
  },
  inputFocused: {
    borderColor: stensylColors.focusRingBlue, // focus:ring-[#0c7ff2]
    // The ring-offset is achieved by the initial borderColor matching the input's own background,
    // and the page background (stensylColors.background) being different.
  },
  button: {
    width: '100%',
    backgroundColor: stensylColors.primaryBlue, // bg-[#0c7ff2]
    paddingHorizontal: 20, // px-5
    paddingVertical: 14, // py-3.5 (approx 0.875rem * 16px/rem)
    borderRadius: 8, // rounded-lg
    justifyContent: 'center',
    alignItems: 'center',
    // shadow-sm (React Native shadows are different per platform)
    // iOS:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    // Android:
    elevation: 2,
  },
  buttonText: {
    fontSize: 16, // text-base
    fontWeight: 'bold', // font-bold
    color: stensylColors.textWhite,
    lineHeight: 22, // Adjust for leading-normal (approx 1.5 * fontSize for text-base)
    letterSpacing: 0.015 * 16, // tracking-[0.015em]
  },
  signupContainer: {
    marginTop: 40, // mt-10
    flexDirection: 'row', // To place text and link side-by-side
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14, // text-sm
    color: stensylColors.textMuted,
  },
  signupLink: {
    fontSize: 14, // text-sm
    fontWeight: '600', // font-semibold
    color: stensylColors.primaryBlue, // text-[#0c7ff2]
    // hover:text-opacity-80 -> use activeOpacity on TouchableOpacity
  },
});

export default StensylSigninScreen; 