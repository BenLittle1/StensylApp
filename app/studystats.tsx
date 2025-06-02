import { MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router'; // MODIFIED: Import useRouter and Href
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ContributionGraph, LineChart } from 'react-native-chart-kit';

// Define your theme colors
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  cardBackground: '#1a2633',
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee',
  chartBoxBackground: '#1a2633', 
  chartLabelColor: 'rgba(255, 255, 255, 0.7)',
  chartGridColor: 'rgba(255, 255, 255, 0.2)',
  dotFillColor: '#FFFFFF',
  chartAreaFillColor: '#CCCCCC',
  buttonBackground: '#0b80ee', 
  buttonText: '#FFFFFF',
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

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, iconName }) => (
  <View style={styles.statCard}>
    {iconName && (
      <MaterialIcons name={iconName} size={24} color={stensylColors.primaryAccent} style={styles.statCardIcon} />
    )}
    <Text style={styles.statCardValue}>{value}</Text>
    <Text style={styles.statCardLabel}>{label}</Text>
  </View>
);

// Function to generate placeholder contribution data
const generateContributionData = (endDate: Date, numDays: number, fillProbability: number) => {
  const data = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - i);
    const dateString = date.toISOString().split('T')[0]; 
    if (Math.random() < fillProbability) { 
      data.push({ date: dateString, count: 1 }); 
    }
  }
  return data.reverse(); 
};


const StudyStatisticsScreen = () => {
  const router = useRouter(); // MODIFIED: Initialize router for header actions
  const [studyStreak, setStudyStreak] = useState(12);
  const [hoursThisWeek, setHoursThisWeek] = useState(8.5); 

  const dailyHoursData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], 
    datasets: [
      {
        data: [0, Math.random()*12, Math.random()*12, Math.random()*12, Math.random()*12, Math.random()*12, 12].map(v=>parseFloat(v.toFixed(1))),
        color: (opacity = 1) => stensylColors.primaryAccent, 
        strokeWidth: 3,
        fillShadowGradient: stensylColors.chartAreaFillColor,
        fillShadowGradientOpacity: 0.2,
      },
    ],
  };

  const screenWidth = Dimensions.get("window").width;
  const lineChartDrawableWidth = screenWidth - (pageHorizontalPadding + graphBoxInset) * 2 - (graphBoxInternalPadding * 2);


  const contributionData = useMemo(() => {
    const currentYear = new Date().getFullYear(); 
    const yearEndDate = new Date(currentYear, 11, 31); 
    const daysInYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 366 : 365;
    return generateContributionData(yearEndDate, daysInYear, 0.65); 
  }, []);

  const lineChartSpecificConfig = { 
    backgroundColor: stensylColors.chartBoxBackground, 
    backgroundGradientFrom: stensylColors.chartBoxBackground,
    backgroundGradientTo: stensylColors.chartBoxBackground,
    decimalPlaces: 1, 
    color: (opacity = 1) => stensylColors.chartLabelColor,
    labelColor: (opacity = 1) => stensylColors.chartLabelColor,
    style: { 
      borderRadius: 12,
      paddingLeft: 0, 
      paddingRight: 16, 
    }, 
    propsForDots: { r: "6", strokeWidth: "2", stroke: stensylColors.primaryAccent, fill: stensylColors.dotFillColor },
    propsForBackgroundLines: { stroke: stensylColors.chartGridColor, strokeDasharray: "" },
    segments: 4, 
  };

  const contributionGraphChartConfig = { 
    backgroundGradientFrom: stensylColors.chartBoxBackground, 
    backgroundGradientTo: stensylColors.chartBoxBackground,
    color: (opacity = 1) => `rgba(11, 128, 238, ${opacity})`, 
    labelColor: (opacity = 1) => stensylColors.chartLabelColor, 
  };

  // MODIFIED: Header navigation handlers (matching FeedScreen)
  const handleNotificationsPress = () => {
    router.push('/notifications' as Href);
    console.log('Notifications icon pressed on Stats page');
  };
  const handleSearchPress = () => {
    router.push('/search' as Href);
    console.log('Search icon pressed on Stats page');
  };
  const handleMessagesPress = () => {
    router.push('/messages' as Href);
    console.log('Messages icon pressed on Stats page');
  };
  const handleStudyLogPress = () => {
    router.push('/studyLog' as Href); // Assuming filename is studyLog.tsx
    console.log('Study Log icon pressed on Stats page');
  };

  const handleAdvancedStatsPress = () => {
    console.log("Advanced Statistics button pressed!");
    // router.push('/advancedstats' as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={stensylColors.background} />
      {/* MODIFIED: Header updated to match FeedScreen */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInnerContainer}>
          <View style={styles.headerActions}>
            <HeaderIconButton iconName="notifications-none" onPress={handleNotificationsPress} />
            <HeaderIconButton iconName="search" onPress={handleSearchPress} />
          </View>
          <Text style={styles.headerTitle}>stensyl</Text>
          <View style={styles.headerActions}>
            <HeaderIconButton iconName="chat-bubble-outline" onPress={handleMessagesPress} />
            <HeaderIconButton iconName="article" onPress={handleStudyLogPress} />
          </View>
        </View>
      </View>


      <ScrollView style={styles.contentScrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.pageTitle}>Study Statistics</Text>

          <View style={styles.statsRowContainer}>
            <StatCard label="Study Streak" value={`${studyStreak} days`} iconName="local-fire-department" />
            <StatCard label="Hours This Week" value={`${hoursThisWeek} h`} iconName="timer" />
          </View>

          {/* Line Chart Section */}
          <View style={styles.graphSectionContainer}> 
            <Text style={styles.chartTitle}>Daily Study Progress (This Week)</Text>
            <View style={styles.chartBox}> 
              <LineChart
                data={dailyHoursData} 
                width={lineChartDrawableWidth} 
                height={240} 
                yAxisLabel="" yAxisSuffix=" h" 
                chartConfig={lineChartSpecificConfig} 
                bezier style={styles.chartStyle} fromZero={true} 
              />
            </View>
          </View>

          {/* Monthly Study Activity Section */}
          <View style={styles.graphSectionContainer}> 
            <Text style={styles.chartTitle}>Study Activity ({new Date().getFullYear()})</Text> 
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.chartBox} 
            >
              <ContributionGraph
                values={contributionData}
                endDate={new Date(new Date().getFullYear(), 11, 31)} 
                numDays={(new Date().getFullYear() % 4 === 0 && new Date().getFullYear() % 100 !== 0) || new Date().getFullYear() % 400 === 0 ? 366 : 365} 
                width={screenWidth * 2.5 > 700 ? screenWidth * 2.5 : 700} 
                height={220}
                chartConfig={contributionGraphChartConfig}
                squareSize={16} 
                gutterSize={2} 
                tooltipDataAttrs={() => ({})}
                style={styles.contributionGraphStyle} 
              />
            </ScrollView>
          </View>

          {/* Advanced Statistics Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.advancedStatsButton} onPress={handleAdvancedStatsPress}>
              <Text style={styles.advancedStatsButtonText}>Advanced Statistics</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color={stensylColors.buttonText} style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      <View style={styles.footerSpacer} />
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16; 
const graphBoxInset = 10; 
const graphBoxInternalPadding = 8; 

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
  contentScrollView: { flex: 1 },
  contentContainer: {
    paddingVertical: 20,
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 22, fontWeight: 'bold', color: stensylColors.textWhite,
    marginBottom: 20, paddingHorizontal: pageHorizontalPadding, 
  },
  statsRowContainer: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    marginBottom: 24, paddingHorizontal: pageHorizontalPadding, 
  },
  statCard: {
    flex: 1, backgroundColor: stensylColors.cardBackground, borderRadius: 12,
    padding: 16, alignItems: 'center', marginHorizontal: 4,
  },
  statCardIcon: { marginBottom: 8 },
  statCardValue: { fontSize: 24, fontWeight: 'bold', color: stensylColors.textWhite, marginBottom: 4 },
  statCardLabel: { fontSize: 13, color: stensylColors.textMuted, textAlign: 'center' },
  
  graphSectionContainer: { 
    width: '100%',
    paddingHorizontal: pageHorizontalPadding + graphBoxInset, 
    marginBottom: 24,
  },
  chartTitle: { 
    fontSize: 16, fontWeight: '600', color: stensylColors.textWhite,
    marginBottom: 12, alignSelf: 'flex-start', 
  },
  chartBox: { 
    backgroundColor: stensylColors.chartBoxBackground, 
    borderRadius: 12, 
    padding: graphBoxInternalPadding, 
    overflow: 'hidden', 
  },
  chartStyle: { }, 
  contributionGraphStyle: {},
  buttonContainer: { 
    width: '100%',
    paddingHorizontal: pageHorizontalPadding,
    marginTop: 24, 
    marginBottom: 10, 
  },
  advancedStatsButton: {
    backgroundColor: stensylColors.buttonBackground,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  advancedStatsButtonText: {
    color: stensylColors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {},
  footerSpacer: { height: 20, backgroundColor: stensylColors.background },
});

export default StudyStatisticsScreen;


