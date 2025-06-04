import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // Stack might not be needed if header comes from layout
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Re-use stensylColors or define locally if preferred
const stensylColors = {
  background: '#101a23',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  inputBackground: '#223649',
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee',
  cardBackground: '#1a2633',
  successGreen: '#48BB78',
};

interface GroupSearchResult {
  id: string;
  name: string; // e.g., "CS101 - Intro to Computer Science"
  university?: string; // Optional, if you plan to support multiple
  members: number; // Placeholder
  isJoined?: boolean; // Placeholder
}

const GroupItem: React.FC<{ item: GroupSearchResult; onJoin: (group: GroupSearchResult) => void }> = ({ item, onJoin }) => {
  return (
    <View style={styles.groupItemContainer}>
      <View style={styles.groupItemInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.university && <Text style={styles.groupUniversity}>{item.university}</Text>}
        <Text style={styles.groupMembers}>{item.members} members</Text>
      </View>
      <TouchableOpacity 
        style={[styles.joinButton, item.isJoined && styles.joinedButton]} 
        onPress={() => onJoin(item)}
        disabled={item.isJoined}
      >
        <Text style={styles.joinButtonText}>{item.isJoined ? 'Joined' : 'Join'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const GroupsScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<GroupSearchResult[]>([]);
  const [myGroups, setMyGroups] = useState<string[]>([]); // Store IDs of joined groups

  // Placeholder groups data
  const allAvailableGroups: GroupSearchResult[] = [
    { id: 'g1', name: 'CS101 - Intro to Computer Science', university: 'State University', members: 120 },
    { id: 'g2', name: 'MATH202 - Calculus II', university: 'State University', members: 85 },
    { id: 'g3', name: 'PHYS150 - General Physics I', university: 'Tech Institute', members: 95 },
    { id: 'g4', name: 'CHEM100 - Principles of Chemistry', university: 'State University', members: 110 },
    { id: 'g5', name: 'ENG101 - English Composition', university: 'City College', members: 70 },
    { id: 'g6', name: 'HIST200 - World History', university: 'Tech Institute', members: 60 },
  ];

  useEffect(() => {
    if (searchText.trim() === '') {
      setSearchResults([]); // Clear results if search is empty
      return;
    }
    const filteredGroups = allAvailableGroups.filter(group =>
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (group.university && group.university.toLowerCase().includes(searchText.toLowerCase()))
    ).map(group => ({ ...group, isJoined: myGroups.includes(group.id) }));
    setSearchResults(filteredGroups);
  }, [searchText, myGroups]);

  const handleJoinGroup = (group: GroupSearchResult) => {
    // Simulate joining a group
    if (!myGroups.includes(group.id)) {
      setMyGroups(prev => [...prev, group.id]);
      Alert.alert("Group Joined!", `You have joined ${group.name}.`);
      // In a real app, you'd make an API call here
      // and then navigate to the group's page or update UI accordingly
      // For now, we just update the 'isJoined' status for the search results
      setSearchResults(prevResults => 
        prevResults.map(r => r.id === group.id ? {...r, isJoined: true} : r)
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* The header is now provided by app/(tabs)/_layout.tsx */}
      {/* You can use <Stack.Screen options={{...}} /> here if you need to customize */}
      {/* this specific screen's header options (e.g., title if different from tab label) */}
       <Stack.Screen options={{ title: 'Groups' }} />


      <View style={styles.searchBarContainer}>
        <View style={[styles.inputWrapper, isSearchFocused && styles.inputWrapperFocused]}>
          <MaterialIcons name="search" size={24} color={isSearchFocused ? stensylColors.primaryAccent : stensylColors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes or groups..."
            placeholderTextColor={stensylColors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <MaterialIcons name="cancel" size={20} color={stensylColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={searchResults}
        renderItem={({ item }) => <GroupItem item={item} onJoin={handleJoinGroup} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          // You could add a "My Groups" section here if desired
          searchText.trim() === '' && myGroups.length > 0 ? (
            <View style={styles.myGroupsSection}>
              <Text style={styles.sectionTitle}>My Groups</Text>
              {/* Placeholder for displaying joined groups */}
              {myGroups.map(groupId => {
                const group = allAvailableGroups.find(g => g.id === groupId);
                return group ? <Text key={groupId} style={styles.myGroupItem}>{group.name}</Text> : null;
              })}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyResultsContainer}>
            <Text style={styles.placeholderText}>
              {searchText.trim() === '' ? 'Find study groups for your classes.' : `No groups found for "${searchText}".`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.resultsListContainer}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  searchBarContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingVertical: 10,
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
  resultsListContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 10,
    flexGrow: 1,
  },
  groupItemContainer: {
    backgroundColor: stensylColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupItemInfo: {
    flex: 1, // Allow text to take available space
    marginRight: 10,
  },
  groupName: {
    color: stensylColors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  groupUniversity: {
    color: stensylColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  groupMembers: {
    color: stensylColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinedButton: {
    backgroundColor: stensylColors.successGreen,
  },
  joinButtonText: {
    color: stensylColors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  placeholderText: {
    color: stensylColors.textMuted,
    textAlign: 'center',
    fontSize: 16,
  },
  myGroupsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 10,
  },
  myGroupItem: {
    color: stensylColors.textWhite,
    fontSize: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: stensylColors.inputBackground,
  }
});

export default GroupsScreen;
