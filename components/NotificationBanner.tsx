import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';

interface NotificationBannerProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  visible: boolean;
  onDismiss?: () => void;
  style?: any;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type,
  visible,
  onDismiss,
  style,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'error': return 'error';
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          background: '#FEE2E2',
          border: '#FECACA',
          text: '#991B1B',
          icon: '#DC2626'
        };
      case 'success':
        return {
          background: '#D1FAE5',
          border: '#A7F3D0',
          text: '#065F46',
          icon: '#059669'
        };
      case 'warning':
        return {
          background: '#FEF3C7',
          border: '#FDE68A',
          text: '#92400E',
          icon: '#D97706'
        };
      case 'info':
        return {
          background: '#DBEAFE',
          border: '#BFDBFE',
          text: '#1E40AF',
          icon: '#3B82F6'
        };
      default:
        return {
          background: '#F3F4F6',
          border: '#D1D5DB',
          text: '#374151',
          icon: '#6B7280'
        };
    }
  };

  if (!visible) return null;

  const colors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }, style]}>
      <View style={styles.content}>
        <MaterialIcons 
          name={getIconName()} 
          size={20} 
          color={colors.icon} 
          style={styles.icon}
        />
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <MaterialIcons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
}); 