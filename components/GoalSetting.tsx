import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { ValidatedInput } from './ValidatedInput';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Goal {
  id: string;
  goal_type: 'daily_minutes' | 'weekly_sessions' | 'daily_sessions' | 'weekly_minutes';
  target_value: number;
  created_at: string;
}

interface GoalSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onGoalSet: (goal: Goal) => void;
  existingGoals?: Goal[];
}

export const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  visible,
  onClose,
  onGoalSet,
  existingGoals = [],
}) => {
  const { user } = useAuth();
  const [selectedGoalType, setSelectedGoalType] = useState<Goal['goal_type']>('daily_minutes');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const goalTypes = [
    {
      type: 'daily_minutes' as const,
      title: 'Daily Study Time',
      description: 'Minutes to study each day',
      icon: 'schedule' as const,
      placeholder: 'e.g., 120 (2 hours)',
      suffix: 'minutes/day',
    },
    {
      type: 'weekly_sessions' as const,
      title: 'Weekly Sessions',
      description: 'Number of study sessions per week',
      icon: 'event-repeat' as const,
      placeholder: 'e.g., 5',
      suffix: 'sessions/week',
    },
    {
      type: 'daily_sessions' as const,
      title: 'Daily Sessions',
      description: 'Number of study sessions per day',
      icon: 'today' as const,
      placeholder: 'e.g., 2',
      suffix: 'sessions/day',
    },
    {
      type: 'weekly_minutes' as const,
      title: 'Weekly Study Time',
      description: 'Total minutes to study per week',
      icon: 'date-range' as const,
      placeholder: 'e.g., 600 (10 hours)',
      suffix: 'minutes/week',
    },
  ];

  const selectedGoal = goalTypes.find(g => g.type === selectedGoalType)!;
  
  // Check if user already has this goal type
  const hasExistingGoal = existingGoals.some(goal => goal.goal_type === selectedGoalType);

  const handleSaveGoal = async () => {
    if (!user || !isValid || !targetValue.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid goal value.');
      return;
    }

    setLoading(true);

    try {
      const goalData = {
        user_id: user.id,
        goal_type: selectedGoalType,
        target_value: parseInt(targetValue, 10),
        is_active: true,
      };

      // If user already has this goal type, update it instead of creating new
      if (hasExistingGoal) {
        const existingGoal = existingGoals.find(g => g.goal_type === selectedGoalType);
        const { error } = await supabase
          .from('goals')
          .update({
            target_value: parseInt(targetValue, 10),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingGoal!.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('goals')
          .insert(goalData)
          .select()
          .single();

        if (error) throw error;
        onGoalSet(data);
      }

      Alert.alert(
        'Goal Set! 🎯',
        `Your ${selectedGoal.title.toLowerCase()} goal has been ${hasExistingGoal ? 'updated' : 'set'}.`
      );
      
      setTargetValue('');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Your Study Goals</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={stensylColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Choose Goal Type:</Text>
            
            {goalTypes.map((goalType) => (
              <TouchableOpacity
                key={goalType.type}
                style={[
                  styles.goalTypeOption,
                  selectedGoalType === goalType.type && styles.goalTypeSelected,
                ]}
                onPress={() => setSelectedGoalType(goalType.type)}
              >
                <View style={styles.goalTypeIcon}>
                  <MaterialIcons
                    name={goalType.icon}
                    size={24}
                    color={selectedGoalType === goalType.type ? stensylColors.primaryAccent : stensylColors.textMuted}
                  />
                </View>
                <View style={styles.goalTypeContent}>
                  <Text style={[
                    styles.goalTypeTitle,
                    selectedGoalType === goalType.type && styles.goalTypeTitleSelected
                  ]}>
                    {goalType.title}
                  </Text>
                  <Text style={styles.goalTypeDescription}>
                    {goalType.description}
                  </Text>
                  {existingGoals.some(g => g.goal_type === goalType.type) && (
                    <Text style={styles.existingGoalLabel}>
                      Current: {existingGoals.find(g => g.goal_type === goalType.type)?.target_value} {goalType.suffix}
                    </Text>
                  )}
                </View>
                {selectedGoalType === goalType.type && (
                  <MaterialIcons name="check-circle" size={20} color={stensylColors.primaryAccent} />
                )}
              </TouchableOpacity>
            ))}

            <ValidatedInput
              label={`Target ${selectedGoal.title}`}
              placeholder={selectedGoal.placeholder}
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="number-pad"
              validationRules={[
                {
                  test: (value) => {
                    const num = parseInt(value, 10);
                    return !isNaN(num) && num > 0 && num <= 1440; // Max 24 hours for minutes
                  },
                  message: 'Please enter a valid positive number'
                }
              ]}
              onValidationChange={handleValidationChange}
              required
              style={styles.targetInput}
            />

            <Text style={styles.helpText}>
              💡 Set realistic goals that challenge you but are achievable. You can always adjust them later!
            </Text>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                (!isValid || loading) && styles.disabledButton
              ]}
              onPress={handleSaveGoal}
              disabled={!isValid || loading}
            >
              <Text style={styles.modalButtonText}>
                {loading ? 'Saving...' : hasExistingGoal ? 'Update Goal' : 'Set Goal'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxHeight: '85%',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: stensylColors.inputBackground,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  goalTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalTypeSelected: {
    borderColor: stensylColors.primaryAccent,
    backgroundColor: `${stensylColors.primaryAccent}15`,
  },
  goalTypeIcon: {
    marginRight: 12,
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  goalTypeTitleSelected: {
    color: stensylColors.primaryAccent,
  },
  goalTypeDescription: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  existingGoalLabel: {
    fontSize: 12,
    color: stensylColors.primaryAccent,
    marginTop: 4,
    fontWeight: '500',
  },
  targetInput: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  helpText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    margin: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: stensylColors.inputBackground,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  saveButton: {
    backgroundColor: stensylColors.primaryAccent,
  },
  cancelButton: {
    backgroundColor: stensylColors.disabledButton,
  },
  disabledButton: {
    backgroundColor: stensylColors.disabledButton,
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
  },
});