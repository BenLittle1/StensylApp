import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  showIcon?: boolean;
  style?: any;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  showIcon = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <MaterialIcons 
          name="hourglass-empty" 
          size={32} 
          color={stensylColors.primaryAccent} 
          style={styles.icon}
        />
      )}
      <ActivityIndicator 
        size={size} 
        color={stensylColors.primaryAccent} 
        style={styles.spinner}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

// Specific loading states for different screens
export const FeedLoadingState: React.FC = () => (
  <LoadingState 
    message="Loading your study sessions..." 
    showIcon={true}
  />
);

export const ProfileLoadingState: React.FC = () => (
  <LoadingState 
    message="Loading your analytics..." 
    showIcon={true}
  />
);

export const SessionSavingState: React.FC = () => (
  <LoadingState 
    message="Saving your study session..." 
    size="small"
  />
);

// Skeleton loader for feed items
export const FeedItemSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonHeader}>
      <View style={[styles.skeletonBox, styles.skeletonAvatar]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonBox, styles.skeletonTitle]} />
        <View style={[styles.skeletonBox, styles.skeletonSubtitle]} />
      </View>
    </View>
    <View style={[styles.skeletonBox, styles.skeletonBody]} />
    <View style={styles.skeletonFooter}>
      <View style={[styles.skeletonBox, styles.skeletonButton]} />
      <View style={[styles.skeletonBox, styles.skeletonButton]} />
    </View>
  </View>
);

// Multiple skeleton items for initial loading
export const FeedSkeletonLoader: React.FC = () => (
  <View style={styles.skeletonList}>
    <FeedItemSkeleton />
    <FeedItemSkeleton />
    <FeedItemSkeleton />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: stensylColors.background,
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Skeleton loading styles
  skeletonContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  skeletonBox: {
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 6,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonTitle: {
    height: 16,
    marginBottom: 6,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    width: '50%',
  },
  skeletonBody: {
    height: 60,
    width: '100%',
  },
  skeletonButton: {
    height: 32,
    width: 80,
  },
  skeletonList: {
    paddingTop: 16,
  },
}); 