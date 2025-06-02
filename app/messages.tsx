import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Define your theme colors
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  cardBackground: '#1a2633', // Background for each chat item
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee',
  unreadMessageColor: '#0b80ee', // Color for unread message indicator or count
  onlineIndicator: '#4CAF50', // Green for online status
};

// Interface for a Chat/Conversation item
interface Conversation {
  id: string; // Unique ID for the conversation
  userName: string;
  avatarUrl?: string; // Optional
  lastMessage: string;
  timestamp: string; // e.g., "10:32 AM", "Yesterday"
  unreadCount?: number; // Optional number of unread messages
  isOnline?: boolean; // Optional online status
}

// Component to render a single conversation item
const ConversationItem: React.FC<{ item: Conversation; onPress: () => void }> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.chatItemContainer} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {/* Placeholder for Avatar */}
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={24} color={stensylColors.textMuted} />
          </View>
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.messagePreviewContainer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};


const MessagesScreen = () => {
  const router = useRouter();
  // Placeholder data for conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'chat1',
      userName: 'Ben Little',
      lastMessage: 'Sounds good, let me know when you\'re free!',
      timestamp: '11:45 AM',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 'chat2',
      userName: 'Sophia Carter',
      lastMessage: 'Okay, I will send you the notes later today.',
      timestamp: 'Yesterday',
      isOnline: false,
    },
    {
      id: 'chat3',
      userName: 'Alex Chen',
      lastMessage: 'Did you finish the assignment for CS101?',
      timestamp: 'Mon',
      unreadCount: 0, // Or undefined
      isOnline: true,
    },
    {
      id: 'chat4',
      userName: 'Study Group CS',
      lastMessage: 'Meeting at 3 PM in the library.',
      timestamp: 'Sun',
      isOnline: false,
    },
  ]);

  // In a real app, you would fetch this data
  useEffect(() => {
    // fetchConversations().then(data => setConversations(data));
  }, []);

  const handleNewChatPress = () => {
    console.log('New Chat pressed');
    // Navigate to a screen to select a user or start a new chat
    // For example: router.push('/newchat'); or router.push('/selectUserForChat');
    // For now, let's just log it.
  };

  const handleConversationPress = (conversation: Conversation) => {
    console.log('Pressed conversation with:', conversation.userName, 'ID:', conversation.id);
    // Navigate to the specific chat screen, passing the conversation ID or user ID
    // Example: router.push(`/chat/${conversation.id}` as Href);
    // Or if it's a 1-on-1 chat, you might use the other user's ID.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          title: 'Messages', 
          headerStyle: { backgroundColor: stensylColors.headerBackground },
          headerTintColor: stensylColors.iconWhite,
          headerTitleStyle: { color: stensylColors.textWhite },
          headerBackTitleVisible: false,
          headerRight: () => ( // Add New Chat button to header
            <TouchableOpacity onPress={handleNewChatPress} style={{ marginRight: 15 }}>
              <MaterialIcons name="add-comment" size={26} color={stensylColors.iconWhite} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationItem item={item} onPress={() => handleConversationPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholderText}>No messages yet.</Text>
            <Text style={styles.placeholderText}>Start a new conversation!</Text>
          </View>
        }
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
  listContentContainer: {
    paddingTop: 10, 
    paddingBottom: 20, 
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.cardBackground, // Can be same as page bg or slightly different
    paddingHorizontal: pageHorizontalPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)', 
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative', // For online indicator positioning
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: stensylColors.background, // Darker placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: stensylColors.onlineIndicator,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: stensylColors.cardBackground, // To make it pop from avatar
  },
  chatContent: {
    flex: 1, 
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  timestamp: {
    fontSize: 12,
    color: stensylColors.textMuted,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: stensylColors.textMuted,
    flexShrink: 1, // Allow message to shrink if unread count is present
  },
  unreadBadge: {
    backgroundColor: stensylColors.unreadMessageColor,
    borderRadius: 10,
    minWidth: 20, // Ensure a nice circular shape for single digits
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCountText: {
    color: stensylColors.textWhite,
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, 
  },
  placeholderText: {
    fontSize: 16,
    color: stensylColors.textMuted, 
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MessagesScreen;
