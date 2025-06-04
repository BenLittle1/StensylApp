import { MaterialIcons } from '@expo/vector-icons';
import React from 'react'; // Removed useState as it's not used here directly
import {
  Dimensions,
  FlatList,
  // SafeAreaView, // Removed
  // StatusBar, // Removed
  StyleSheet,
  Text,
  // TouchableOpacity, // Removed (HeaderIconButton is in shared layout)
  View,
} from 'react-native';
// import { useRouter, Href } from 'expo-router'; // Removed, header navigation handled by layout

const screenWidth = Dimensions.get('window').width;
const numColumns = 3;
const postGap = 4; 

// Define your theme colors for consistency
const stensylColors = {
  background: '#101a23',
  // headerBackground: 'rgba(16, 26, 35, 0.8)', // Defined in shared layout
  cardBackground: '#1a2633',
  textWhite: '#ffffff',
  textMuted: '#90aecb',
  primaryBlue: '#0b80ee',
  // iconWhite: '#ffffff', // Defined in shared layout
  avatarPlaceholderIcon: '#6b7280',
  divider: '#374151',
  postPlaceholder: '#ffffff', 
};

// HeaderIconButton is now part of app/(tabs)/_layout.tsx
// interface HeaderIconButtonProps { /* ... */ }
// const HeaderIconButton = ({ iconName, onPress }: HeaderIconButtonProps) => { /* ... */ };

const showDebugStyles = false; 

const StensylHomePage = () => {
  // const router = useRouter(); // Header navigation is handled by (tabs)/_layout.tsx
  const postsData = Array.from({ length: 9 }).map((_, i) => ({ id: `post-${i}` }));

  // Header navigation handlers are now in (tabs)/_layout.tsx
  // const handleNotificationsPress = () => { /* ... */ };
  // const handleSearchPress = () => { /* ... */ };
  // const handleMessagesPress = () => { /* ... */ };
  // const handleStudyLogPress = () => { /* ... */ };


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
    // No SafeAreaView or StatusBar here; provided by app/(tabs)/_layout.tsx
    // No Header View here; provided by app/(tabs)/_layout.tsx
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
      style={styles.gridListStyle} // Ensures FlatList takes available space if needed
      contentContainerStyle={styles.gridListContentContainer}
      showsVerticalScrollIndicator={false}
    />
    // No footerSpacer needed if padding is handled by layout or FlatList's contentContainerStyle
  );
};

const pageHorizontalPadding = 16;
const availableWidthForGrid = screenWidth - (pageHorizontalPadding * 2);
const postItemCalculatedWidth = (availableWidthForGrid - (postGap * (numColumns - 1))) / numColumns;

const styles = StyleSheet.create({
  // safeArea: { flex: 1, backgroundColor: stensylColors.background }, // Removed
  // headerContainer: {}, // Removed
  // headerInnerContainer: { /* ... */ }, // Removed
  // headerActions: { /* ... */ }, // Removed
  // headerIconTouchable: { /* ... */ }, // Removed
  // headerTitle: { /* ... */ }, // Removed

  profileSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    marginBottom: 24, 
    paddingHorizontal: pageHorizontalPadding, 
    marginTop: 16 // Add some top margin if this is the first content after header
  },
  avatarContainer: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#d1d5db', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: stensylColors.primaryBlue,
  },
  profileName: { color: stensylColors.textWhite, fontSize: 20, fontWeight: 'bold' },
  profileLocation: { color: stensylColors.textMuted, fontSize: 14 },
  statsSection: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: stensylColors.cardBackground, padding: 12, borderRadius: 12, 
    marginBottom: 24, marginHorizontal: pageHorizontalPadding,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, 
    shadowRadius: 4.65, elevation: 8,
  },
  statItem: { alignItems: 'center' },
  statNumber: { color: stensylColors.textWhite, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: stensylColors.textMuted, fontSize: 12 },
  bioText: { 
    color: stensylColors.textWhite, fontSize: 14, lineHeight: 14 * 1.625, 
    marginBottom: 24, paddingHorizontal: pageHorizontalPadding + 4 
  },
  divider: {
    borderTopWidth: 1,
    borderColor: stensylColors.divider,
    marginBottom: 16, 
    marginHorizontal: pageHorizontalPadding
  },

  gridListStyle: {
    // flex: 1, // This FlatList will be inside a View with flex:1 from the layout
  },
  gridListContentContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 0, // If divider has marginBottom, this can be 0
    // The paddingBottom for the bottom nav bar is handled by the structure in (tabs)/_layout.tsx
    // The contentArea in (tabs)/_layout.tsx is flex: 1, and the bottomNavBar has a fixed height.
    // Add some padding if the last item is too close to where the nav bar would be.
    paddingBottom: 10, 
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
  // footerSpacer: { height: 20, backgroundColor: stensylColors.background }, // Removed
});

export default StensylHomePage;

