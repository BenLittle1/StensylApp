import React from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { stensylColors } from '@/constants/Colors';

export default function TabTwoScreen() {
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          This is a placeholder for future features.
        </Text>
        
        {user && (
          <Text style={styles.userInfo}>
            Currently signed in as: {user.email}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Sign Out" onPress={signOut} color={stensylColors.primaryAccent} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfo: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '60%',
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
