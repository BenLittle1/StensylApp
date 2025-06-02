import { MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    Share,
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
  cardBackground: '#1a2633', 
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee',
  studyDayFilled: '#0b80ee', 
  studyDayEmpty: 'rgba(255, 255, 255, 0.15)', 
  postPlaceholderBg: '#394B59', 
  iconColor: '#90aecb', 
};

// Reusable Icon Button for Header
interface HeaderIconButtonProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}
const HeaderIconButton = ({ iconName, onPress }: HeaderIconButtonProps) => (
  <TouchableOpacity style={styles.headerIconTouchable} onPress={onPress}>
    <MaterialIcons name={iconName} size={28} color={stensylColors.iconWhite} />
  </TouchableOpacity>
);

// Weekly Progress Day Box Component
interface DayBoxProps {
  dayInitial: string;
  studied: boolean;
  isCurrentDay?: boolean;
}
const DayBox: React.FC<DayBoxProps> = ({ dayInitial, studied, isCurrentDay }) => (
  <View
    style={[
      styles.dayBox,
      studied ? styles.dayBoxStudied : styles.dayBoxEmpty,
      isCurrentDay && styles.dayBoxCurrent,
    ]}
  >
    <Text style={styles.dayBoxText}>{dayInitial}</Text>
  </View>
);

// Post Item Component
interface PostItemProps {
  id: string; 
  userName: string;
  avatarUrl?: string; 
  timestamp: string;
  location: string;
  timeStudied: string;
  description: string;
}
const PostItem: React.FC<PostItemProps> = ({
  id, 
  userName,
  timestamp,
  location,
  timeStudied,
  description,
}) => {
  const router = useRouter(); 

  const handleCommentPress = () => {
    console.log(`Attempting to navigate to comments for post ID: ${id}.`); 
    if (id) {
      router.push(`/comments/${id}` as Href); 
    } else {
      console.error("Post ID is undefined for comment navigation.");
    }
  };

  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `Check out this study post by ${userName} on Stensyl! "${description.substring(0, 100)}..."\n\n#StensylApp #StudyMotivation`,
        title: `Post by ${userName} on Stensyl`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Content shared successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share action dismissed.');
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={24} color={stensylColors.textMuted} />
        </View>
        <View style={styles.postHeaderTextContainer}>
          <Text style={styles.postUserName}>{userName}</Text>
          <Text style={styles.postMetaText}>{timestamp} | {location}</Text>
        </View>
        <View style={styles.postTimeStudiedContainer}>
          <Text style={styles.postTimeStudiedLabel}>Time Studied</Text>
          <Text style={styles.postTimeStudiedValue}>{timeStudied}</Text>
        </View>
      </View>

      {/* Post Description */}
      <Text style={styles.postDescription}>{description}</Text>

      {/* Post Content Placeholder */}
      <View style={styles.postContentPlaceholder} />

      {/* Post Actions */}
      <View style={styles.postActionsContainer}>
        <TouchableOpacity style={styles.postActionButton}>
          <MaterialIcons name="thumb-up-off-alt" size={22} color={stensylColors.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton} onPress={handleCommentPress}> 
          <MaterialIcons name="chat-bubble-outline" size={22} color={stensylColors.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton} onPress={handleSharePress}>
          <MaterialIcons name="share" size={22} color={stensylColors.iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const FeedScreen = () => {
  const router = useRouter(); 
  const [studyStreak, setStudyStreak] = useState(12); 
  const [weeklyStudyDays, setWeeklyStudyDays] = useState([
    true, true, false, true, false, true, false 
  ]);
  const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = new Date().getDay(); 
  
  const [posts, setPosts] = useState<PostItemProps[]>([
    { id: '1', userName: 'Ben Little', timestamp: '7:07 PM', location: 'Kingston, Ontario', timeStudied: '2.5h', description: 'Focused study session tonight working on my new React Native project. Making good progress! Feeling motivated. 🚀' },
    { id: '2', userName: 'Sophia Carter', timestamp: 'Yesterday', location: 'Toronto, Ontario', timeStudied: '1.0h', description: 'Quick review of last week\'s notes. Consistency is key.' },
    { id: '3', userName: 'Alex Chen', timestamp: '2 days ago', location: 'Vancouver, BC', timeStudied: '3.0h', description: 'Grinding for midterms. This new study spot is amazing for concentration.' },
  ]);

  const handleSearchPress = () => { 
    router.push('/search' as Href); 
    console.log('Search icon pressed, navigating to /search');
  };

  const handleStudyLogPress = () => {
    router.push('/studyLog' as Href); 
    console.log('Study Log icon pressed, navigating to /studyLog');
  };

  // MODIFIED: Handler for the new notifications icon
  const handleNotificationsPress = () => {
    router.push('/notifications' as Href);
    console.log('Notifications icon pressed, navigating to /notifications');
  };
  
  // MODIFIED: Handler for the messages icon
  const handleMessagesPress = () => {
    router.push('/messages' as Href);
    console.log('Messages icon pressed, navigating to /messages');
  };

  const renderPost = ({ item }: { item: PostItemProps }) => <PostItem {...item} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={stensylColors.background} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInnerContainer}>
          <View style={styles.headerActions}>
            {/* MODIFIED: Changed icon from 'add' to 'notifications-none' and onPress */}
            <HeaderIconButton iconName="notifications-none" onPress={handleNotificationsPress} /> 
            <HeaderIconButton iconName="search" onPress={handleSearchPress} /> 
          </View>
          <Text style={styles.headerTitle}>stensyl</Text>
          <View style={styles.headerActions}>
            {/* MODIFIED: Updated onPress for messages icon */}
            <HeaderIconButton iconName="chat-bubble-outline" onPress={handleMessagesPress} /> 
            <HeaderIconButton iconName="article" onPress={handleStudyLogPress} /> 
          </View>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        ListHeaderComponent={ 
          <View style={styles.feedHeaderContent}>
            {/* Weekly Progress Section */}
            <View style={styles.weeklyProgressContainer}>
              <View style={styles.dayBoxesContainer}>
                {dayInitials.map((initial, index) => (
                  <DayBox
                    key={index}
                    dayInitial={initial}
                    studied={weeklyStudyDays[index]}
                    isCurrentDay={ (currentDayIndex === index && currentDayIndex !==0) || (currentDayIndex === 0 && index === 6) }
                  />
                ))}
              </View>
              <View style={styles.streakInfoContainer}> 
                <MaterialIcons name="local-fire-department" size={22} color={stensylColors.primaryAccent} style={styles.streakIcon} />
                <Text style={styles.streakText}>{studyStreak}</Text> 
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.feedListContainer}
      />
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16;
const dayBoxSize = 30; 
const dayBoxMargin = 6; 

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: stensylColors.background },
  headerContainer: {},
  headerInnerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: pageHorizontalPadding, paddingVertical: 10,
    backgroundColor: stensylColors.headerBackground,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerIconTouchable: { padding: 8, borderRadius: 999 },
  headerTitle: { color: stensylColors.textWhite, fontSize: 24, fontWeight: 'bold', letterSpacing: -0.015 * 24 },
  
  feedHeaderContent: { 
    paddingHorizontal: pageHorizontalPadding, 
    paddingTop: 16, 
    paddingBottom: 8, 
  },
  weeklyProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: pageHorizontalPadding, 
    marginBottom: 16,
  },
  dayBoxesContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  dayBox: {
    width: dayBoxSize,
    height: dayBoxSize,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: dayBoxMargin, 
  },
  dayBoxStudied: {
    backgroundColor: stensylColors.studyDayFilled,
  },
  dayBoxEmpty: {
    backgroundColor: stensylColors.studyDayEmpty,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dayBoxCurrent: {
    borderWidth: 2,
    borderColor: stensylColors.textWhite, 
  },
  dayBoxText: {
    color: stensylColors.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakInfoContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 5,
  },
  streakText: {
    color: stensylColors.textWhite,
    fontSize: 18, 
    fontWeight: 'bold', 
  },

  feedListContainer: {
    paddingBottom: 20, 
  },
  postContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: pageHorizontalPadding, 
    marginBottom: 16, 
    marginHorizontal: pageHorizontalPadding, 
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: stensylColors.postPlaceholderBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postHeaderTextContainer: {
    flex: 1, 
  },
  postUserName: {
    color: stensylColors.textWhite,
    fontWeight: 'bold',
    fontSize: 15,
  },
  postMetaText: {
    color: stensylColors.textMuted,
    fontSize: 12,
  },
  postTimeStudiedContainer: {
    alignItems: 'flex-end',
  },
  postTimeStudiedLabel: {
    color: stensylColors.textMuted,
    fontSize: 11,
  },
  postTimeStudiedValue: { 
    color: stensylColors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  postDescription: {
    color: stensylColors.textWhite,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postContentPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9, 
    backgroundColor: stensylColors.postPlaceholderBg,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActionsContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 20, 
  },
});

export default FeedScreen;

