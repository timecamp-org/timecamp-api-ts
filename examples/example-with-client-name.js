const { TimeCampAPI } = require('./dist');

/**
 * Complete example showing how to use TimeCamp API with custom client name
 * 
 * This example demonstrates:
 * 1. Setting up the API with custom client name
 * 2. Creating a time entry
 * 3. Updating the time entry
 * 4. Starting a timer
 * 5. Stopping a timer
 * 6. Deleting the time entry
 * 
 * All requests will include:
 * - User-Agent header: your-app-name
 * - X-Client-Name header: your-app-name
 * - service parameter: your-app-name (in POST/PUT/DELETE request bodies)
 */

async function exampleUsage() {
  // Initialize API with custom client name
  const api = new TimeCampAPI('your-api-key', {
    clientName: 'your-app-name',
    timeout: 15000
  });

  console.log('TimeCamp API initialized with client name: your-app-name');
  console.log('All requests will include the client name in headers and request bodies\n');

  try {
    // Example 1: Create a time entry
    console.log('1. Creating time entry...');
    const timeEntry = await api.timeEntries.create({
      date: '2025-09-13',
      duration: 3600, // 1 hour in seconds
      description: 'Working on API integration',
      start_time: '09:00:00',
      end_time: '10:00:00'
    });
    console.log('✓ Time entry created:', timeEntry);
    
    if (timeEntry.success && timeEntry.id) {
      const entryId = parseInt(timeEntry.id);
      
      // Example 2: Update the time entry
      console.log('\n2. Updating time entry...');
      const updateResult = await api.timeEntries.update(entryId, {
        description: 'Updated: Working on API integration with client name',
        duration: 4500 // 1.25 hours in seconds
      });
      console.log('✓ Time entry updated:', updateResult);

      // Example 3: Start a timer
      console.log('\n3. Starting timer...');
      const timerStart = await api.timer.start({
      });
      console.log('✓ Timer started:', timerStart);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Example 4: Check timer status
      console.log('\n4. Checking timer status...');
      const timerStatus = await api.timer.status();
      console.log('✓ Timer status:', timerStatus);

      // Example 5: Stop the timer
      console.log('\n5. Stopping timer...');
      const timerStop = await api.timer.stop();
      console.log('✓ Timer stopped:', timerStop);

      // Example 6: Delete the time entry
      console.log('\n6. Deleting time entry...');
      const deleteResult = await api.timeEntries.delete(entryId);
      console.log('✓ Time entry deleted:', deleteResult);
    }

    console.log('\n=== All operations completed successfully! ===');
    console.log('Each request included the client name "your-app-name" in:');
    console.log('- User-Agent header');
    console.log('- X-Client-Name header');
    console.log('- service parameter (for POST/PUT/DELETE operations)');

  } catch (error) {
    console.error('Error during API operations:', error.message);
  }
}

console.log('To run this example:');
console.log('1. Replace "YOUR_REAL_API_KEY" with your actual TimeCamp API key');
console.log('2. Replace task IDs with real task IDs from your TimeCamp account');
console.log('3. Uncomment the exampleUsage() call at the bottom');
console.log('4. Run: node example-with-client-name.js');

exampleUsage();