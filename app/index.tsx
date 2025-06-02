import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define your theme colors (optional, but good for consistency)
const themeColors = {
  background: '#f0f0f0', 
  text: '#333333',
  primary: '#007AFF', 
  cardBackground: '#ffffff',
  separator: '#dddddd',
  textMuted: '#666666', 
};

const TemporaryNavigationScreen = () => {
  // Add your page routes here
  const pages = [
    { name: 'Sign In Screen', path: '/signin' },
    { name: 'Sign Up Screen', path: '/signup' }, 
    { name: 'Profile Page (Home)', path: '/home' }, 
    { name: 'Feed Screen', path: '/feed' },
    { name: 'Search Screen', path: '/search' },
    { name: 'Study Statistics Screen', path: '/studystats' }, // Assuming filename is studystats.tsx
    { name: 'Study Log Screen', path: '/studyLog' }, 
    { name: 'Notifications Screen', path: '/notifications' }, 
    { name: 'Messages Screen', path: '/messages' },
    { name: 'Study Tracker Screen', path: '/studyTracker' }, // MODIFIED: Added Study Tracker
    // Note: Dynamic routes like '/comments/[postId]' are typically navigated to from other screens
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>App Navigation</Text>
        <Text style={styles.subtitle}>Use these links to navigate to different pages.</Text>

        <View style={styles.linksContainer}>
          {pages.map((page, index) => (
            <Link key={index} href={page.path as any} asChild>
              <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>{page.name}</Text>
                <Text style={styles.linkPathText}>{page.path}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <Text style={styles.footerText}>
          This is a temporary navigation page. Update `app/index.tsx` to your main app screen later.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.text,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  linksContainer: {
    width: '100%',
    maxWidth: 400,
  },
  linkButton: {
    backgroundColor: themeColors.cardBackground,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkText: {
    fontSize: 18,
    fontWeight: '500',
    color: themeColors.primary,
  },
  linkPathText: {
    fontSize: 12,
    color: themeColors.text,
    marginTop: 4,
  },
  footerText: {
    marginTop: 40,
    fontSize: 12,
    color: themeColors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});

export default TemporaryNavigationScreen;


