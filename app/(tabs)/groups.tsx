import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { Stack } from 'expo-router';

export default function GroupsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: 'Study Groups'
        }} 
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Study Groups</Text>
        
        {/* Coming Soon Section */}
        <View style={styles.comingSoonContainer}>
          <MaterialIcons name="groups" size={64} color={stensylColors.primaryAccent} />
          <Text style={styles.comingSoonTitle}>Coming Soon! 🚀</Text>
          <Text style={styles.comingSoonText}>
            Join study rooms, compete with friends, and chat with other learners in real-time.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <MaterialIcons name="video-call" size={24} color={stensylColors.primaryAccent} />
              <Text style={styles.featureText}>Virtual Study Rooms</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="leaderboard" size={24} color={stensylColors.primaryAccent} />
              <Text style={styles.featureText}>Group Leaderboards</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="chat" size={24} color={stensylColors.primaryAccent} />
              <Text style={styles.featureText}>Group Chat</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="emoji-events" size={24} color={stensylColors.primaryAccent} />
              <Text style={styles.featureText}>Group Challenges</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notifyButton}>
            <MaterialIcons name="notifications" size={20} color={stensylColors.textWhite} />
            <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
          </TouchableOpacity>
        </View>
        
        {/* Phase 3 Info */}
        <View style={styles.phaseContainer}>
          <Text style={styles.phaseTitle}>🛣️ Development Roadmap</Text>
          <Text style={styles.phaseText}>
            Study Groups is part of Phase 3 of Stensyl development. We're currently focused on perfecting the core study tracking experience in Phase 1.
          </Text>
          <View style={styles.phaseList}>
            <Text style={styles.phaseItem}>✅ Phase 1: Core Study Tracking & Goals</Text>
            <Text style={styles.phaseItem}>🚧 Phase 2: Content Creation & Sharing</Text>
            <Text style={styles.phaseItem}>🔮 Phase 3: Collaborative Study Groups</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 32,
    textAlign: 'center',
  },
  comingSoonContainer: {
    alignItems: 'center',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    width: '100%',
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: stensylColors.textWhite,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: stensylColors.textWhite,
    marginLeft: 12,
    fontWeight: '500',
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  notifyButtonText: {
    color: stensylColors.textWhite,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  phaseContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 12,
  },
  phaseText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  phaseList: {
    marginTop: 8,
  },
  phaseItem: {
    fontSize: 14,
    color: stensylColors.textWhite,
    marginBottom: 8,
    paddingLeft: 8,
  },
}); 