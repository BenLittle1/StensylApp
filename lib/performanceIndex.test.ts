import { calculatePerformanceIndex, Session } from './performanceIndex';

describe('Performance Index', () => {
  it('returns 0 for no sessions', () => {
    expect(calculatePerformanceIndex({ sessions: [] })).toBe(0);
  });

  it('returns high score for perfect week', () => {
    const sessions: Session[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      duration: 120, // 2 hours per day
      goalCompleted: true,
      efficiency: 10,
    }));
    const score = calculatePerformanceIndex({
      sessions,
      dailyGoalCount: 7,
      weeklyGoalCount: 7,
    });
    expect(score).toBeGreaterThanOrEqual(80); // Should be high but realistic
    expect(score).toBeLessThanOrEqual(100);
    console.log('Perfect week score:', score);
  });

  it('penalizes low efficiency', () => {
    const sessions: Session[] = [
      { date: new Date().toISOString(), duration: 120, goalCompleted: true, efficiency: 2 },
      { date: new Date().toISOString(), duration: 120, goalCompleted: true, efficiency: 2 },
    ];
    const score = calculatePerformanceIndex({ sessions, dailyGoalCount: 2, weeklyGoalCount: 2 });
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
    console.log('Low efficiency score:', score);
  });

  it('handles no goals set', () => {
    const sessions: Session[] = [
      { date: new Date().toISOString(), duration: 60, efficiency: 8 },
    ];
    const score = calculatePerformanceIndex({ sessions });
    expect(score).toBeGreaterThan(0);
    console.log('No goals score:', score);
  });

  it('handles partial goal completion', () => {
    const sessions: Session[] = [
      { date: new Date().toISOString(), duration: 60, goalCompleted: true, efficiency: 8 },
      { date: new Date().toISOString(), duration: 60, goalCompleted: false, efficiency: 8 },
    ];
    const score = calculatePerformanceIndex({ sessions, dailyGoalCount: 2, weeklyGoalCount: 2 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
    console.log('Partial goals score:', score);
  });

  it('rewards consistency over cramming', () => {
    // Consistent study: 1 hour per day for 3 days
    const consistentSessions: Session[] = [
      { date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(), duration: 60, efficiency: 8 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), duration: 60, efficiency: 8 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), duration: 60, efficiency: 8 },
    ];
    
    // Cramming: 3 hours in one day
    const crammingSessions: Session[] = [
      { date: new Date().toISOString(), duration: 180, efficiency: 8 },
    ];
    
    const consistentScore = calculatePerformanceIndex({ sessions: consistentSessions });
    const crammingScore = calculatePerformanceIndex({ sessions: crammingSessions });
    
    expect(consistentScore).toBeGreaterThan(crammingScore);
    console.log('Consistent score:', consistentScore, 'vs Cramming score:', crammingScore);
  });
}); 