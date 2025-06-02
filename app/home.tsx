import { MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router'; // MODIFIED: Import useRouter and Href
import React from 'react'; // Removed useState as it's not used here directly
import {
  Dimensions,
  FlatList, // Keep FlatList as it's used for the posts grid
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const numColumns = 3;
const postGap = 4; // Gap between posts

// Define your theme colors for consistency
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  cardBackground: '#1a2633',
  textWhite: '#ffffff',
  textMuted: '#90aecb',
  primaryBlue: '#0b80ee',
  iconWhite: '#ffffff',
  avatarPlaceholderIcon: '#6b7280',
  divider: '#374151',
  postPlaceholder: '#ffffff', // Color for the placeholder post squares
};

interface HeaderIconButtonProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

const HeaderIconButton = ({ iconName, onPress }: HeaderIconButtonProps) => (
  <TouchableOpacity style={styles.headerIconTouchable} onPress={onPress}>
    <MaterialIcons name={iconName} size={28} color={stensylColors.iconWhite} />
  </TouchableOpacity>
);

const showDebugStyles = false; // Set to false to remove debug styles

const StensylHomePage = () => {
  const router = useRouter(); // MODIFIED: Initialize router for header actions
  const postsData = Array.from({ length: 9 }).map((_, i) => ({ id: `post-${i}` }));

  // MODIFIED: Header navigation handlers
  const handleNotificationsPress = () => {
    router.push('/notifications' as Href);
    console.log('Notifications icon pressed on Home page');
  };
  const handleSearchPress = () => {
    router.push('/search' as Href);
    console.log('Search icon pressed on Home page');
  };
  const handleMessagesPress = () => {
    router.push('/messages' as Href);
    console.log('Messages icon pressed on Home page');
  };
  const handleStudyLogPress = () => {
    router.push('/studyLog' as Href); // Assuming filename is studyLog.tsx
    console.log('Study Log icon pressed on Home page');
  };


  const renderPostItem = ({ item, index }: { item: { id: string }, index: number }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    return (
      <View
        style={[
          styles.postGridItemWrapper,
          isLastInRow && { marginRight: 0 } 
        ]}
      >
        <View style={styles.postGridItemSquare}>
          {showDebugStyles && <Text style={{ fontSize: 8, color: 'black', textAlign:'center' }}>Post {index + 1}</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={stensylColors.background} />

      {/* MODIFIED: Header updated to match FeedScreen and StudyStatisticsScreen */}
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

      <FlatList
        ListHeaderComponent={
          <>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <MaterialIcons name="person" size={60} color={stensylColors.avatarPlaceholderIcon} />
              </View>
              <View>
                <Text style={styles.profileName}>Ben Little</Text>
                <Text style={styles.profileLocation}>Toronto, ON</Text>
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1.2K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>850</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </View>

            {/* Bio Section */}
            <Text style={styles.bioText}>
              App developer and designer. Sharing my health and fitness journey.
            </Text>

            {/* Divider */}
            <View style={styles.divider} />
          </>
        }
        data={postsData}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        style={styles.gridListStyle}
        contentContainerStyle={styles.gridListContentContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footerSpacer} />
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16;
const availableWidthForGrid = screenWidth - (pageHorizontalPadding * 2);
const postItemCalculatedWidth = (availableWidthForGrid - (postGap * (numColumns - 1))) / numColumns;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: stensylColors.background },
  headerContainer: {},
  headerInnerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: pageHorizontalPadding,
    paddingVertical: 10, backgroundColor: stensylColors.headerBackground,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerIconTouchable: { padding: 8, borderRadius: 999 },
  headerTitle: { color: stensylColors.textWhite, fontSize: 24, fontWeight: 'bold', letterSpacing: -0.015 * 24 },

  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24, paddingHorizontal: pageHorizontalPadding, marginTop: 16 },
  avatarContainer: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#d1d5db', // Kept original light grey for avatar bg
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: stensylColors.primaryBlue,
  },
  profileName: { color: stensylColors.textWhite, fontSize: 20, fontWeight: 'bold' },
  profileLocation: { color: stensylColors.textMuted, fontSize: 14 },
  statsSection: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: stensylColors.cardBackground, padding: 12, borderRadius: 12, marginBottom: 24, marginHorizontal: pageHorizontalPadding,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
  },
  statItem: { alignItems: 'center' },
  statNumber: { color: stensylColors.textWhite, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: stensylColors.textMuted, fontSize: 12 },
  bioText: { color: stensylColors.textWhite, fontSize: 14, lineHeight: 14 * 1.625, marginBottom: 24, paddingHorizontal: pageHorizontalPadding + 4 },
  divider: {
    borderTopWidth: 1,
    borderColor: stensylColors.divider,
    marginBottom: 16, 
    marginHorizontal: pageHorizontalPadding
  },

  gridListStyle: {
    flex: 1,
  },
  gridListContentContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 0,      
    paddingBottom: 16,
    ...(showDebugStyles ? { backgroundColor: 'rgba(255,0,0,0.2)'} : {}),
  },
  postGridItemWrapper: {
    width: postItemCalculatedWidth,
    marginRight: postGap,
    marginBottom: postGap,
  },
  postGridItemSquare: {
    aspectRatio: 1,
    backgroundColor: stensylColors.postPlaceholder,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    ...(showDebugStyles ? { borderWidth: 1, borderColor: 'blue' } : {}),
  },
  footerSpacer: { height: 20, backgroundColor: stensylColors.background },
});

export default StensylHomePage;
