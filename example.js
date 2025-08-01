require('dotenv').config();
const { TimeCampAPI } = require('./dist');

// Example usage
async function example() {
  try {
    // Get API key from environment variable or use placeholder
    const apiKey = process.env.TIMECAMP_API_KEY || "your-api-key-here";
    const timecampApi = new TimeCampAPI(apiKey);
    
    // Get current user
    const user = await timecampApi.user.get();
    console.log('Current user:', user);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Uncomment to run the example (make sure to provide a valid API key)
example();