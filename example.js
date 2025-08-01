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
    
    const user = await timecampApi.user.get();
    console.log('Current user:', user);
    
    
    // Check current timer status
    const initialStatus = await timecampApi.timer.status();
    console.log('Initial timer status:', initialStatus);
    
    // Start a timer
    // console.log('\n▶️ Starting timer...');
    // const startedTimer = await timecampApi.timer.start({
    //   note: 'Testing TimeCamp API timer functionality',
    //   task_id: undefined // You can specify a task_id if you have one
    // });
    // console.log('Timer started:', startedTimer);
    
    // // Wait for 5 seconds
    // console.log('\n⏳ Waiting 5 seconds...');
    // await new Promise(resolve => setTimeout(resolve, 5000));
    
    // // Check timer status again
    // console.log('\n📊 Checking timer status after start...');
    // const runningStatus = await timecampApi.timer.status();
    // console.log('Running timer status:', runningStatus);
    
    // // Stop the timer
    // console.log('\n⏹️ Stopping timer...');
    // const stoppedTimer = await timecampApi.timer.stop();
    // console.log('Timer stopped:', stoppedTimer);
    
    // // Final status check
    // console.log('\n📊 Final timer status...');
    // const finalStatus = await timecampApi.timer.status();
    // console.log('Final timer status:', finalStatus);
    
    // Get recent time entries
    const entries = await timecampApi.timeEntries.get({
      date_from: '2025-04-01',
      date_to: '2025-04-05',
      user_ids: 'me'
    });
    console.log(`Found ${entries.length} time entries:`);
    entries.slice(0, 3).forEach(entry => {
      console.log(`- ${entry.name || 'No task'}: ${entry.duration}s on ${entry.date} (${entry.description})`);
    });
    
    // // Create a new time entry
    // console.log('\n✨ Creating a new time entry...');
    // const createResult = await timecampApi.timeEntries.create({
    //   date: '2024-01-15',
    //   duration: 3600, // 1 hour in seconds
    //   description: 'API integration testing',
    //   start_time: '14:00:00',
    //   end_time: '15:00:00'
    // });
    
    // if (createResult.success) {
    //   console.log(`✅ Created time entry with ID: ${createResult.id}`);
      
    //   // Update the time entry
    //   console.log('\n📝 Updating the time entry...');
    //   const updateResult = await timecampApi.timeEntries.update(parseInt(createResult.id), {
    //     description: 'Updated: API integration testing and validation',
    //     duration: 5400 // 1.5 hours
    //   });
      
    //   if (updateResult.success) {
    //     console.log(`✅ Updated time entry: ${updateResult.message}`);
        
    //     // Delete the time entry (cleanup)
    //     console.log('\n🗑️  Cleaning up - deleting the test time entry...');
    //     const deleteResult = await timecampApi.timeEntries.delete(parseInt(createResult.id));
        
    //     if (deleteResult.success) {
    //       console.log(`✅ Deleted time entry: ${deleteResult.message}`);
    //     } else {
    //       console.log(`❌ Failed to delete: ${deleteResult.message}`);
    //     }
    //   } else {
    //     console.log(`❌ Failed to update: ${updateResult.message}`);
    //   }
    // } else {
    //   console.log(`❌ Failed to create: ${createResult.message}`);
    // }
    
    // Get tasks (if available)
    try {
      const tasksResult = await timecampApi.tasks.getActiveUserTasks();
      if (tasksResult.success && tasksResult.data) {
        console.log(`Found ${tasksResult.data.length} active tasks:`);
        tasksResult.data.slice(0, 3).forEach(task => {
          console.log(`- Task ID ${task.task_id}: ${task.name}`);
        });
      } else {
        console.log('No tasks found or error fetching tasks');
      }
    } catch (error) {
      console.log('Could not fetch tasks:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

example();