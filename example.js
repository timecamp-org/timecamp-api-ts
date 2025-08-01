require('dotenv').config();
const { TimeCampAPI } = require('./dist');

// Example usage
async function example() {
  try {
    // Get API key from environment variable or use placeholder
    const apiKey = process.env.TIMECAMP_API_KEY || "your-api-key-here";
    
    if (apiKey === "your-api-key-here") {
      console.log('Please set TIMECAMP_API_KEY environment variable or update the example with your actual API key');
      return;
    }

    const timecampApi = new TimeCampAPI(apiKey);
    
    console.log('🔍 Getting current user...');
    const user = await timecampApi.user.get();
    console.log('Current user:', user);
    
    console.log('\n⏱️ Testing timer functionality...');
    
    // Check current timer status
    console.log('\n📊 Checking timer status...');
    const initialStatus = await timecampApi.timer.status();
    console.log('Initial timer status:', initialStatus);
    
    // Start a timer
    console.log('\n▶️ Starting timer...');
    const startedTimer = await timecampApi.timer.start({
      note: 'Testing TimeCamp API timer functionality',
      task_id: undefined // You can specify a task_id if you have one
    });
    console.log('Timer started:', startedTimer);
    
    // Wait for 5 seconds
    console.log('\n⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check timer status again
    console.log('\n📊 Checking timer status after start...');
    const runningStatus = await timecampApi.timer.status();
    console.log('Running timer status:', runningStatus);
    
    // Stop the timer
    console.log('\n⏹️ Stopping timer...');
    const stoppedTimer = await timecampApi.timer.stop();
    console.log('Timer stopped:', stoppedTimer);
    
    // Final status check
    console.log('\n📊 Final timer status...');
    const finalStatus = await timecampApi.timer.status();
    console.log('Final timer status:', finalStatus);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

example();