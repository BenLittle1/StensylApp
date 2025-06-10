import { calculatePerformanceIndex, Session } from './performanceIndex';

// Based on the screenshot: 1 session, 1 minute, today
const yourCurrentSessions: Session[] = [
  {
    date: new Date().toISOString(), // today
    duration: 1, // 1 minute as shown in the profile
    // No goalCompleted or efficiency data visible
  }
];

const expectedScore = calculatePerformanceIndex({
  sessions: yourCurrentSessions,
  dailyGoalCount: 1, // You have 1 daily goal set (6m time goal)
  weeklyGoalCount: 0,
});

console.log('Your expected Performance Index:', expectedScore);
console.log('Breakdown:');
console.log('- 1 study day this week');
console.log('- 1 minute total study time'); 
console.log('- 1 daily goal set (6m), but not completed (1m < 6m)');
console.log('- No efficiency rating provided');

export { expectedScore }; 