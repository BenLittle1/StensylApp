import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';

interface StudyTemplate {
  id: string;
  subject: string;
  duration: number; // in minutes
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  description: string;
}

interface StudyTemplatesProps {
  onTemplateSelect: (template: StudyTemplate) => void;
  compact?: boolean;
}

const studyTemplates: StudyTemplate[] = [
  {
    id: 'math',
    subject: 'Mathematics',
    duration: 25,
    icon: 'calculate',
    color: '#3B82F6',
    description: '25min focused math session'
  },
  {
    id: 'science',
    subject: 'Science',
    duration: 30,
    icon: 'science',
    color: '#10B981',
    description: '30min science deep dive'
  },
  {
    id: 'english',
    subject: 'English',
    duration: 20,
    icon: 'menu-book',
    color: '#F59E0B',
    description: '20min reading & writing'
  },
  {
    id: 'history',
    subject: 'History',
    duration: 25,
    icon: 'history-edu',
    color: '#8B5CF6',
    description: '25min historical study'
  },
  {
    id: 'language',
    subject: 'Language',
    duration: 15,
    icon: 'translate',
    color: '#EF4444',
    description: '15min language practice'
  },
  {
    id: 'programming',
    subject: 'Programming',
    duration: 45,
    icon: 'code',
    color: '#06B6D4',
    description: '45min coding session'
  },
  {
    id: 'review',
    subject: 'Review',
    duration: 20,
    icon: 'replay',
    color: '#84CC16',
    description: '20min review & recap'
  },
  {
    id: 'custom',
    subject: 'Custom',
    duration: 25,
    icon: 'edit',
    color: stensylColors.primaryAccent,
    description: 'Create your own session'
  }
];

const StudyTemplateCard: React.FC<{
  template: StudyTemplate;
  onPress: () => void;
  compact?: boolean;
}> = ({ template, onPress, compact = false }) => {
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress}>
        <View style={[styles.compactIconContainer, { backgroundColor: template.color + '20' }]}>
          <MaterialIcons name={template.icon} size={20} color={template.color} />
        </View>
        <Text style={styles.compactSubject}>{template.subject}</Text>
        <Text style={styles.compactDuration}>{template.duration}m</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.templateCard} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: template.color + '20' }]}>
        <MaterialIcons name={template.icon} size={28} color={template.color} />
      </View>
      <View style={styles.templateContent}>
        <Text style={styles.templateSubject}>{template.subject}</Text>
        <Text style={styles.templateDescription}>{template.description}</Text>
      </View>
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{template.duration}m</Text>
      </View>
    </TouchableOpacity>
  );
};

export const StudyTemplates: React.FC<StudyTemplatesProps> = ({
  onTemplateSelect,
  compact = false
}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactTitle}>Quick Start</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactScrollContent}
        >
          {studyTemplates.slice(0, 6).map((template) => (
            <StudyTemplateCard
              key={template.id}
              template={template}
              onPress={() => onTemplateSelect(template)}
              compact={true}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Templates</Text>
      <Text style={styles.subtitle}>Choose a template to get started quickly</Text>
      <ScrollView style={styles.templatesContainer}>
        {studyTemplates.map((template) => (
          <StudyTemplateCard
            key={template.id}
            template={template}
            onPress={() => onTemplateSelect(template)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  compactContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: stensylColors.textWhite,
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginBottom: 20,
  },
  templatesContainer: {
    maxHeight: 400,
  },
  compactScrollContent: {
    paddingRight: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  compactCard: {
    alignItems: 'center',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 80,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  templateContent: {
    flex: 1,
  },
  templateSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  compactSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 4,
    textAlign: 'center',
  },
  templateDescription: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  durationBadge: {
    backgroundColor: stensylColors.primaryAccent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.primaryAccent,
  },
  compactDuration: {
    fontSize: 10,
    color: stensylColors.textMuted,
    textAlign: 'center',
  },
});

export default StudyTemplates; 