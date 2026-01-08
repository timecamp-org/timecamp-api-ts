const { TimeCampAPI } = require('./src/TimeCampAPI');

// Example: Invite a user to TimeCamp account
async function inviteUser() {
  const api = new TimeCampAPI('your-api-key-here');

  try {
    // Example 1: Invite user with automatic group_id (from current user's root group)
    // This method automatically retries up to 3 times with 5-second delays if it encounters
    // a 429 rate limit error
    const result1 = await api.users.invite({
      email: 'newuser@example.com',
      name: 'John Doe'
    });
    console.log('User invited successfully (auto group):', result1);

    // Example 2: Invite user with specific group_id
    const result2 = await api.users.invite({
      email: 'anotheruser@example.com',
      name: 'Jane Smith',
      group_id: 12345
    });
    console.log('User invited successfully (specific group):', result2);

    // Example 3: Bulk invite (with automatic retry on rate limits)
    const emails = [
      { email: 'user1@example.com', name: 'User One' },
      { email: 'user2@example.com', name: 'User Two' },
      { email: 'user3@example.com', name: 'User Three' }
    ];

    console.log('Starting bulk invite...');
    for (const user of emails) {
      try {
        const result = await api.users.invite(user);
        console.log(`✓ Invited ${user.email}:`, result);
      } catch (error) {
        console.error(`✗ Failed to invite ${user.email}:`, error.message);
      }
    }

  } catch (error) {
    console.error('Error inviting user:', error.message);
  }
}

inviteUser();
