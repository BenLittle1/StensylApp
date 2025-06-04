import { MaterialIcons } from '@expo/vector-icons';
import { Href, Slot, useRouter, useSegments } from 'expo-router';
import React from 'react';
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Define your theme colors (consistent across the app)
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)', // Or your main background
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  primaryAccent: '#0b80ee', // Active tab color
  iconColor: '#90aecb', // Inactive tab icon color
  bottomNavBackground: '#161F27', // Can be same as header or slightly different
};

// Reusable Icon Button for Header (from your other files)
interface HeaderIconButtonProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}
const HeaderIconButton = ({ iconName, onPress }: HeaderIconButtonProps) => (
  <TouchableOpacity style={styles.headerIconTouchable} onPress={onPress}>
    <MaterialIcons name={iconName} size={28} color={stensylColors.iconWhite} />
  </TouchableOpacity>
);

// Bottom Navigation Tab Component
interface BottomNavItemProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  targetPath: Href;
  isActive: boolean;
  isProfile?: boolean; 
}
const BottomNavItem: React.FC<BottomNavItemProps> = ({ iconName, targetPath, isActive, isProfile }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace(targetPath)}>
      {isProfile ? (
        <View style={[styles.profilePicPlaceholder, isActive && styles.profilePicActive]}>
          {/* In a real app, you'd put an <Image /> component here for the user's avatar */}
          <MaterialIcons name="account-circle" size={28} color={isActive ? stensylColors.primaryAccent : stensylColors.iconColor} />
        </View>
      ) : (
        <MaterialIcons name={iconName} size={28} color={isActive ? stensylColors.primaryAccent : stensylColors.iconColor} />
      )}
    </TouchableOpacity>
  );
};

const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 80 : 65; // Adjust height, more for iOS due to home indicator area

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments(); // segments = ['feed'], ['studyTracker'], etc.
  
  // Determine current route for active tab.
  // For a layout route like (tabs), segments[0] will be the screen name.
  // If segments is empty, it might be the initial route of the group.
  const currentScreen = segments[0] || 'feed'; // Default to 'feed' if no segment (initial route)

  // Header navigation handlers (consistent across screens in this layout)
  const handleNotificationsPress = () => router.push('/notifications' as Href);
  const handleSearchPress = () => router.push('/search' as Href);
  const handleMessagesPress = () => router.push('/messages' as Href);
  const handleStudyLogPress = () => router.push('/studyLog' as Href);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={stensylColors.background} />
      
      {/* Shared Top Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInnerContainer}>
          <View style={styles.headerActions}>
            <HeaderIconButton iconName="notifications-none" onPress={handleNotificationsPress} />
            <HeaderIconButton iconName="search" onPress={handleSearchPress} />
          </View>
          <Text style={styles.headerTitle}>stensyl</Text>
          <View style={styles.headerActions}>
            <HeaderIconButton iconName="chat-bubble-outline" onPress={handleMessagesPress} />
            <HeaderIconButton iconName="article" onPress={handleStudyLogPress} />
          </View>
        </View>
      </View>

      {/* Content of the current screen within the (tabs) group */}
      <View style={styles.contentArea}>
        <Slot /> 
      </View>

      {/* Shared Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <BottomNavItem iconName="home" targetPath="/feed" isActive={currentScreen === 'feed'} />
        <BottomNavItem iconName="timer" targetPath="/studyTracker" isActive={currentScreen === 'studyTracker'} />
        <BottomNavItem iconName="group" targetPath="/groups" isActive={currentScreen === 'groups'} />
        <BottomNavItem iconName="show-chart" targetPath="/studystats" isActive={currentScreen === 'studystats'} />
        <BottomNavItem iconName="account-circle" targetPath="/home" isActive={currentScreen === 'home'} isProfile />
      </View>
    </SafeAreaView>
  );
}

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  headerContainer: {
    // This View is part of the SafeAreaView flow
  },
  headerInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: pageHorizontalPadding,
    paddingVertical: 10,
    backgroundColor: stensylColors.headerBackground, 
    borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4, 
  },
  headerIconTouchable: {
    padding: 8,
    borderRadius: 999,
  },
  headerTitle: {
    color: stensylColors.textWhite,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.015 * 24,
  },
  contentArea: {
    flex: 1, // This is where the screen content (Slot) will go and take up available space
    // The individual screens (feed.tsx, etc.) should NOT have their own SafeAreaView
    // if they are rendered within this layout's SafeAreaView.
  },
  bottomNavBar: {
    flexDirection: 'row',
    height: BOTTOM_NAV_HEIGHT,
    backgroundColor: stensylColors.bottomNavBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    alignItems: 'flex-start', // Align icons towards the top of the bar
    justifyContent: 'space-around',
    paddingTop: 8, // Padding at the top of the nav bar items
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, // More padding for iOS home indicator
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  profilePicPlaceholder: {
    width: 30, 
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicActive: {
    // Example: Add a border to the active profile icon
    // borderColor: stensylColors.primaryAccent,
    // borderWidth: 2,
  },
});
