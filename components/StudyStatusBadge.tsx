import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';

interface StudyStatusBadgeProps {
  isStudying: boolean;
  studyTime?: string;
  compact?: boolean;
}

export const StudyStatusBadge: React.FC<StudyStatusBadgeProps> = ({ 
  isStudying, 
  studyTime = '00:00', 
  compact = false 
}) => {
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isStudying) {
      const pulseAnimations = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimations.start();

      return () => {
        pulseAnimations.stop();
        pulseAnimation.setValue(1);
      };
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isStudying, pulseAnimation]);

  if (!isStudying) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Animated.View style={[styles.compactIndicator, { opacity: pulseAnimation }]}>
          <MaterialIcons name="school" size={16} color={stensylColors.textWhite} />
        </Animated.View>
        <Text style={styles.compactText}>Studying</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, { opacity: pulseAnimation }]}>
        <MaterialIcons name="school" size={20} color={stensylColors.textWhite} />
      </Animated.View>
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>Focus Mode</Text>
        <Text style={styles.timeText}>{studyTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  indicator: {
    marginRight: 8,
  },
  compactIndicator: {
    marginRight: 4,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  statusText: {
    color: stensylColors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    color: stensylColors.textWhite,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    opacity: 0.9,
  },
  compactText: {
    color: stensylColors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
}); 