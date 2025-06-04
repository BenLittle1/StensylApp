import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView, // This will be handled by (tabs)/_layout.tsx
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ContributionGraph, LineChart } from 'react-native-chart-kit';
// import { useRouter, Href } from 'expo-router'; // Removed, header navigation handled by layout

// Define your theme colors
const stensylColors = {
  background: '#101a23',
  // headerBackground: 'rgba(16, 26, 35, 0.8)', // Defined in shared layout
  textWhite: '#ffffff',
  // iconWhite: '#ffffff', // Defined in shared layout
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

// HeaderIconButton is now part of app/(tabs)/_layout.tsx
// interface HeaderIconButtonProps { /* ... */ }
// const HeaderIconButton = ({ iconName, onPress }: HeaderIconButtonProps) => ( /* ... */ );

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
  // const router = useRouter(); // Header navigation is handled by (tabs)/_layout.tsx
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

  // Header navigation handlers are now in (tabs)/_layout.tsx
  // const handleNotificationsPress = () => { /* ... */ };
  // const handleSearchPress = () => { /* ... */ };
  // const handleMessagesPress = () => { /* ... */ };
  // const handleStudyLogPress = () => { /* ... */ };

  const handleAdvancedStatsPress = () => {
    console.log("Advanced Statistics button pressed!");
    // router.push('/advancedstats' as Href);
  };

  return (
    // No SafeAreaView, StatusBar, or Header View here.
    // These are provided by app/(tabs)/_layout.tsx
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
        {/* Removed footerSpacer as paddingBottom on contentContainer or ScrollView should handle space for bottom nav */}
      </View>
    </ScrollView>
  );
};

const pageHorizontalPadding = 16; 
const graphBoxInset = 10; 
const graphBoxInternalPadding = 8; 

const styles = StyleSheet.create({
  // safeArea: { flex: 1, backgroundColor: stensylColors.background }, // Removed
  // headerContainer: {}, // Removed
  // headerInnerContainer: { /* ... */ }, // Removed
  // headerActions: { /* ... */ }, // Removed
  // headerIconTouchable: { /* ... */ }, // Removed
  // headerTitle: { /* ... */ }, // Removed

  contentScrollView: { 
    flex: 1, // Ensure ScrollView takes up the space given by the layout's contentArea
    backgroundColor: stensylColors.background, // Set background here if needed, or layout handles it
  },
  contentContainer: {
    paddingVertical: 20, // Top and bottom padding for the scrollable content
    // alignItems: 'flex-start', // Default, items will take full width unless styled otherwise
    // flexGrow: 1, // Not always needed if ScrollView itself is flex:1
    paddingBottom: 80, // MODIFIED: Add significant padding for the bottom nav bar
  },
  pageTitle: {
    fontSize: 22, fontWeight: 'bold', color: stensylColors.textWhite,
    marginBottom: 20, paddingHorizontal: pageHorizontalPadding, 
    marginTop: 16, // Add some top margin if this is the first content after header
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
    paddingHorizontal: pageHorizontalPadding, // Align button with page padding
    // marginTop: 24, // This was here, ensure it's needed or if graphSectionContainer's marginBottom is enough
    // marginBottom: 10, // This was here
  },
  advancedStatsButton: {
    backgroundColor: stensylColors.buttonBackground,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 24, // Add margin here if placeholder text was removed
  },
  advancedStatsButtonText: {
    color: stensylColors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {},
  // footerSpacer: { height: 20, backgroundColor: stensylColors.background }, // Removed
});

export default StudyStatisticsScreen;



