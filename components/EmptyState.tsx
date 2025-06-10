import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name={icon} 
          size={64} 
          color={stensylColors.textMuted} 
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {actionText && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <MaterialIcons 
            name="play-circle-filled" 
            size={20} 
            color={stensylColors.textWhite} 
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Specific empty state for the feed screen
export const FeedEmptyState: React.FC = () => {
  const router = useRouter();
  
  const handleStartStudying = () => {
    router.push('/(tabs)/study');
  };

  return (
    <EmptyState
      icon="auto-stories"
      title="Ready to start studying?"
      subtitle="Track your study sessions and build amazing learning habits. Your first session is just a tap away!"
      actionText="Start Your First Session"
      onActionPress={handleStartStudying}
    />
  );
};

// Specific empty state for profile with no data
export const ProfileEmptyState: React.FC = () => {
  const router = useRouter();
  
  const handleStartStudying = () => {
    router.push('/(tabs)/study');
  };

  return (
    <EmptyState
      icon="trending-up"
      title="No data yet"
      subtitle="Complete some study sessions to see your progress and analytics here."
      actionText="Log Your First Session"
      onActionPress={handleStartStudying}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: stensylColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: stensylColors.inputBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: stensylColors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
  },
}); 