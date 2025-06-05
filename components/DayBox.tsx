import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { stensylColors } from '@/constants/Colors'; // Adjusted import path

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

const dayBoxSize = 30;
const dayBoxMargin = 6;

const styles = StyleSheet.create({
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
});

export default DayBox; 