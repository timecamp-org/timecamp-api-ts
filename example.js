const { TimeCampAPI } = require('./dist');

// Example usage
async function example() {
  try {
    // Replace with your actual API key
    const timecampApi = new TimeCampAPI("your-api-key-here");
    
    // Get current user
    const user = await timecampApi.user.get();
    console.log('Current user:', user);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Uncomment to run the example (make sure to provide a valid API key)
example();