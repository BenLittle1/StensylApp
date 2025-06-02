import { MaterialIcons } from '@expo/vector-icons';
import { Href, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Define your theme colors
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  cardBackground: '#1a2633', // Background for each notification item
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee', // For highlights or icons
  unreadNotificationBg: 'rgba(11, 128, 238, 0.1)', // Subtle background for unread items
};

// Interface for a Notification item
type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

interface NotificationItemData {
  id: string;
  type: NotificationType;
  user: { // User who initiated the notification
    id: string;
    name: string;
    avatarUrl?: string; // Optional
  };
  postId?: string; // ID of the post related to the notification (for likes/comments)
  postSnippet?: string; // A short snippet of the post content
  commentSnippet?: string; // A short snippet of the comment
  timestamp: string; // e.g., "2h ago", "Yesterday"
  isRead: boolean;
}

// Component to render a single notification item
const NotificationItem: React.FC<{ item: NotificationItemData; onPress: () => void }> = ({ item, onPress }) => {
  let iconName: keyof typeof MaterialIcons.glyphMap = 'notifications';
  let actionText = '';

  switch (item.type) {
    case 'like':
      iconName = 'favorite';
      actionText = 'liked your post';
      break;
    case 'comment':
      iconName = 'chat-bubble';
      actionText = 'commented on your post';
      break;
    case 'follow':
      iconName = 'person-add';
      actionText = 'started following you';
      break;
    case 'mention':
      iconName = 'alternate-email'; // Or 'mention' if available and suitable
      actionText = `mentioned you in a ${item.postId ? 'post' : 'comment'}`;
      break;
  }

  return (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={onPress}
    >
      <View style={styles.notificationIconContainer}>
        <MaterialIcons name={iconName} size={24} color={stensylColors.primaryAccent} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.userName}>{item.user.name}</Text> {actionText}.
          {item.postSnippet && <Text style={styles.snippetText}> "{item.postSnippet}"</Text>}
          {item.commentSnippet && <Text style={styles.snippetText}> "{item.commentSnippet}"</Text>}
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};


const NotificationsScreen = () => {
  const router = useRouter();
  // Placeholder data for notifications
  const [notifications, setNotifications] = useState<NotificationItemData[]>([
    {
      id: '1',
      type: 'like',
      user: { id: 'u1', name: 'Ben Little' },
      postId: 'p123',
      postSnippet: 'Focused study session...',
      timestamp: '15m ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'comment',
      user: { id: 'u2', name: 'Sophia Carter' },
      postId: 'p123',
      commentSnippet: 'Great insights, Ben!',
      timestamp: '1h ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'follow',
      user: { id: 'u3', name: 'Alex Chen' },
      timestamp: '3h ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'mention',
      user: { id: 'u4', name: 'StudyBuddyApp' },
      postId: 'p456',
      postSnippet: 'Check out this new feature...',
      timestamp: 'Yesterday',
      isRead: true,
    },
    {
      id: '5',
      type: 'like',
      user: { id: 'u5', name: 'Jane Doe' },
      postId: 'p789',
      postSnippet: 'My study setup for finals...',
      timestamp: '2 days ago',
      isRead: true,
    },
  ]);

  // In a real app, you would fetch this data and handle marking as read
  useEffect(() => {
    // fetchNotifications().then(data => setNotifications(data));
  }, []);

  const handleNotificationPress = (item: NotificationItemData) => {
    console.log('Notification pressed:', item.id);
    // Mark as read (locally for now)
    setNotifications(prev => prev.map(n => n.id === item.id ? {...n, isRead: true} : n));

    // Navigate to relevant screen
    if (item.postId && (item.type === 'like' || item.type === 'comment' || item.type === 'mention')) {
      // Assuming you have a way to navigate to a specific post, perhaps via feed or a post detail screen
      // For comments, you might navigate directly to the comments section of that post
      router.push(`/comments/${item.postId}` as Href); // Or to the post itself
    } else if (item.type === 'follow') {
      router.push(`/profile/${item.user.id}` as Href); // Navigate to user's profile
    }
    // Add other navigation logic as needed
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          title: 'Notifications', 
          headerStyle: { backgroundColor: stensylColors.headerBackground },
          headerTintColor: stensylColors.iconWhite,
          headerTitleStyle: { color: stensylColors.textWhite },
          headerBackTitle: "",
        }} 
      />
      
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem item={item} onPress={() => handleNotificationPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholderText}>No new notifications.</Text>
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
    paddingTop: 10, // Space from header
    paddingBottom: 20, 
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.cardBackground,
    paddingHorizontal: pageHorizontalPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)', // Subtle separator
  },
  unreadNotification: {
    backgroundColor: stensylColors.unreadNotificationBg, // Highlight unread items
  },
  notificationIconContainer: {
    marginRight: 12,
    width: 30, // Fixed width for icon alignment
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1, // Allow text content to take remaining space
  },
  notificationText: {
    color: stensylColors.textWhite,
    fontSize: 15,
    lineHeight: 20,
  },
  userName: {
    fontWeight: 'bold',
  },
  snippetText: {
    color: stensylColors.textMuted,
    fontStyle: 'italic',
  },
  timestamp: {
    color: stensylColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: stensylColors.primaryAccent,
    marginLeft: 10, // Space from the content
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
  },
});

export default NotificationsScreen;
