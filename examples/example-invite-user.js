const { TimeCampAPI } = require('./src/TimeCampAPI');

// Example: Invite a user to TimeCamp account
async function inviteUser() {
  const api = new TimeCampAPI('your-api-key-here');

  try {
    // Example 1: Invite user with automatic group_id (from current user's root group)
    // This method automatically retries up to 3 times with 5-second delays if it encounters
    // a 429 rate limit error
    // When a 'name' is provided, the method will automatically update the user's display name
    // after the invite is successful
    const result1 = await api.users.invite({
      email: 'newuser@example.com',
      name: 'John Doe'
    });
    console.log('User invited successfully (auto group):', result1);
    // Response: { 
    //   statuses: { 'newuser@example.com': { status: 'Invite' } },
    //   user_id: '123456'  // Included when name is provided
    // }
    console.log('Status:', result1.statuses['newuser@example.com'].status);
    console.log('User ID:', result1.user_id);

    // Example 2: Invite user with specific group_id and set display name
    const result2 = await api.users.invite({
      email: 'anotheruser@example.com',
      name: 'Jane Smith',
      group_id: 12345
    });
    console.log('User invited successfully (specific group):', result2);

    // Example 3: Invite user without setting a display name (skips name update)
    const result3 = await api.users.invite({
      email: 'nousername@example.com',
      group_id: 12345
    });
    console.log('User invited without name update:', result3);
    // Response will not include user_id

    // Example 4: Bulk invite (with automatic retry on rate limits)
    const emails = [
      { email: 'user1@example.com', name: 'User One' },
      { email: 'user2@example.com', name: 'User Two' },
      { email: 'user3@example.com', name: 'User Three' }
    ];

    console.log('Starting bulk invite...');
    for (const user of emails) {
      try {
        const result = await api.users.invite(user);
        const status = result.statuses[user.email].status;
        const userId = result.user_id ? ` (ID: ${result.user_id})` : '';
        console.log(`✓ ${user.email}: ${status}${userId}`);
      } catch (error) {
        console.error(`✗ Failed to invite ${user.email}:`, error.message);
      }
    }

  } catch (error) {
    console.error('Error inviting user:', error.message);
  }
}

inviteUser();
