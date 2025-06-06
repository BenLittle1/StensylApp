import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Define your theme colors
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  inputBackground: '#223649',
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee', 
  cardBackground: '#1a2633', 
  activeFilterBackground: '#0b80ee',
  inactiveFilterBackground: '#223649', 
  filterTextActive: '#FFFFFF',
  filterTextInactive: '#90aecb',
  listItemHover: 'rgba(255, 255, 255, 0.05)', 
};

type SearchFilter = 'Users' | 'Posts';

interface UserResult {
  id: string;
  name: string;
  username: string;
  avatar?: string; 
}

interface PostResult {
  id: string;
  userName: string;
  descriptionSnippet: string;
  timestamp: string;
}

const SearchScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('Posts'); 
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'React Native tips',
    'Expo Router examples',
    'Data visualization',
    'Study motivation',
  ]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setUserResults([]);
      setPostResults([]);
      return;
    }
    // Add current search to recent searches when a search is actually performed (e.g., after a delay or on submit)
    // For this example, we'll just filter based on current text.
    // A more robust solution would add to recent searches upon successful search/selection.

    setIsLoading(true);
    const timer = setTimeout(() => {
      if (activeFilter === 'Users') {
        setUserResults([
          { id: 'u1', name: 'Ben Little', username: 'benl', avatar: 'person' },
          { id: 'u2', name: 'Sophia Carter', username: 'sophia_c', avatar: 'person' },
          { id: 'u3', name: `User ${searchText} 1`, username: `user_${searchText.toLowerCase()}_1`},
        ].filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()) || user.username.toLowerCase().includes(searchText.toLowerCase())));
        setPostResults([]);
      } else { // Posts
        setPostResults([
          { id: 'p1', userName: 'Ben Little', descriptionSnippet: `Focused study session... ${searchText}`, timestamp: '2h ago' },
          { id: 'p2', userName: 'Alex Chen', descriptionSnippet: `Midterm prep for ${searchText} is intense!`, timestamp: '1d ago' },
          { id: 'p3', userName: 'Sophia Carter', descriptionSnippet: `Talking about ${searchText} consistency.`, timestamp: '3d ago' },
        ].filter(post => post.descriptionSnippet.toLowerCase().includes(searchText.toLowerCase()) || post.userName.toLowerCase().includes(searchText.toLowerCase())));
        setUserResults([]);
      }
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchText, activeFilter]);

  const handleSearchSubmit = () => {
    console.log('Searching for:', searchText, 'Filter:', activeFilter);
    if (searchText.trim() && !recentSearches.includes(searchText.trim())) {
      setRecentSearches(prevSearches => [searchText.trim(), ...prevSearches.slice(0, 4)]); // Add to top, keep last 5
    }
  };

  const handleRecentSearchPress = (term: string) => {
    setSearchText(term);
  };

  // MODIFIED: Handler for deleting a recent search item
  const handleDeleteRecentSearch = (termToDelete: string) => {
    setRecentSearches(prevSearches => prevSearches.filter(term => term !== termToDelete));
  };

  const renderUserResult = ({ item }: { item: UserResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => router.push(`/profile/${item.username}`)}>
      <View style={styles.avatarPlaceholder}>
        <MaterialIcons name={item.avatar as any || 'person'} size={24} color={stensylColors.textMuted} />
      </View>
      <View>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPostResult = ({ item }: { item: PostResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => router.push(`/feed`)}> 
      <View>
        <Text style={styles.resultName}>{item.userName}</Text>
        <Text style={styles.resultDescription}>{item.descriptionSnippet}</Text>
        <Text style={styles.resultTimestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  // MODIFIED: Component to render a recent search item with delete button
  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <View style={styles.recentSearchItemContainer}>
      <TouchableOpacity 
        style={styles.recentSearchTextContainer} 
        onPress={() => handleRecentSearchPress(item)}
      >
        <MaterialIcons name="history" size={20} color={stensylColors.textMuted} style={styles.recentSearchIcon} />
        <Text style={styles.recentSearchText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteRecentSearchButton}
        onPress={() => handleDeleteRecentSearch(item)}
      >
        <MaterialIcons name="close" size={20} color={stensylColors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.placeholderText}>Searching...</Text>
        </View>
      );
    }

    if (searchText.trim() !== '') {
      return (
        <FlatList
          data={activeFilter === 'Users' ? userResults : postResults}
          renderItem={activeFilter === 'Users' ? renderUserResult : renderPostResult}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyResultsContainer}>
              <Text style={styles.placeholderText}>
                No results found for &quot;{searchText}&quot;
              </Text>
            </View>
          }
          contentContainerStyle={styles.resultsListContainer}
          keyboardShouldPersistTaps="handled"
        />
      );
    } else if (recentSearches.length > 0) {
      return (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={(item, index) => `recent-${index}`}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      );
    } else {
      return (
        <View style={styles.emptyResultsContainer}>
          <Text style={styles.placeholderText}>Search for users or posts.</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ 
        title: 'Search', 
        headerStyle: { backgroundColor: stensylColors.headerBackground },
        headerTintColor: stensylColors.iconWhite,
        headerTitleStyle: { color: stensylColors.textWhite },
        headerBackTitleVisible: false,
      }} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, isSearchFocused && styles.inputWrapperFocused]}>
          <MaterialIcons name="search" size={24} color={isSearchFocused ? stensylColors.primaryAccent : stensylColors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Stensyl..."
            placeholderTextColor={stensylColors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit} // Adds search term to recent on submit
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <MaterialIcons name="cancel" size={20} color={stensylColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterMenuContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'Posts' ? styles.filterButtonActive : styles.filterButtonInactive,
          ]}
          onPress={() => setActiveFilter('Posts')}
        >
          <Text style={activeFilter === 'Posts' ? styles.filterTextActive : styles.filterTextInactive}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'Users' ? styles.filterButtonActive : styles.filterButtonInactive,
          ]}
          onPress={() => setActiveFilter('Users')}
        >
          <Text style={activeFilter === 'Users' ? styles.filterTextActive : styles.filterTextInactive}>Users</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  searchContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 10, 
    paddingBottom: 10,
    backgroundColor: stensylColors.background, 
    borderBottomWidth: 1,
    borderBottomColor: stensylColors.cardBackground,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground, 
  },
  inputWrapperFocused: {
    borderColor: stensylColors.primaryAccent, 
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: stensylColors.textWhite,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    paddingVertical: 12,
    paddingHorizontal: pageHorizontalPadding,
    backgroundColor: stensylColors.background, 
    borderBottomWidth: 1,
    borderBottomColor: stensylColors.cardBackground,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20, 
  },
  filterButtonActive: {
    backgroundColor: stensylColors.activeFilterBackground,
  },
  filterButtonInactive: {
    backgroundColor: stensylColors.inactiveFilterBackground,
  },
  filterTextActive: {
    color: stensylColors.filterTextActive,
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterTextInactive: {
    color: stensylColors.filterTextInactive,
    fontSize: 14,
  },
  resultsListContainer: { 
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 10,
    flexGrow: 1, 
  },
  resultItem: {
    backgroundColor: stensylColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: stensylColors.inputBackground, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultName: {
    color: stensylColors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultUsername: { 
    color: stensylColors.textMuted,
    fontSize: 14,
  },
  resultDescription: { 
    color: stensylColors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  resultTimestamp: { 
    color: stensylColors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyResultsContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: { 
    color: stensylColors.textMuted,
    textAlign: 'center',
    fontSize: 16,
  },
  recentSearchesContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 20,
    flex: 1, 
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 15,
  },
  // MODIFIED: Styles for Recent Search Item with Delete Button
  recentSearchItemContainer: { // New container for text and delete button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes text to left, delete to right
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: stensylColors.cardBackground,
  },
  recentSearchTextContainer: { // Container for icon and text, makes them pressable together
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allows this part to take up available space
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    color: stensylColors.textWhite,
    fontSize: 16,
    flexShrink: 1, // Allows text to shrink if too long before delete icon
  },
  deleteRecentSearchButton: {
    paddingLeft: 10, // Add some padding to make the touch target larger
    paddingVertical: 5, // Vertical padding for touch target
  },
});

export default SearchScreen;
