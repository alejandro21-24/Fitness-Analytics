require('dotenv').config();

const { workoutCalculator } = require('./workoutReader');
const { healthMetricsCounter } = require('./healthReader');

async function processFiles() {
  const userName = process.env.USER_NAME || 'Athlete';
  const weeklyGoal = parseInt(process.env.WEEKLY_GOAL, 10);

  console.log(`Processing data for: ${userName}`);

  try {
    console.log('📁 Reading workout data...');
    const workoutResult = await workoutCalculator('./data/workouts.csv');

    console.log('📁 Reading health data...');
    const healthResult = await healthMetricsCounter('./data/health-metrics.json');

    if (!workoutResult || !healthResult) {
      console.log('⚠️ Could not finish the summary because one of the files failed to load.');
      return;
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Workouts found: ${workoutResult.totalWorkouts}`);
    console.log(`Total workout minutes: ${workoutResult.totalMinutes}`);
    console.log(`Health entries found: ${healthResult.totalEntries}`);

    if (Number.isNaN(weeklyGoal)) {
      console.log('⚠️ WEEKLY_GOAL is missing or invalid in your .env file.');
      return;
    }

    console.log(`Weekly goal: ${weeklyGoal} minutes`);

    if (workoutResult.totalMinutes > weeklyGoal) {
      console.log(`🎉 Congratulations ${userName}! You have exceeded your weekly goal!`);
    } else if (workoutResult.totalMinutes === weeklyGoal) {
      console.log(`🎉 Great job ${userName}! You met your weekly goal!`);
    } else {
      const remaining = weeklyGoal - workoutResult.totalMinutes;
      console.log(`💪 Keep going ${userName}! You need ${remaining} more minutes to reach your weekly goal.`);
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

processFiles();

module.exports = { processFiles };