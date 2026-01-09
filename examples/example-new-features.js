/**
 * Example demonstrating the new features:
 * - Task user assignment
 * - Tags and tag lists management
 * - Tags on time entries
 * - Billing rates
 */

const { TimeCampAPI } = require('../dist');

// Initialize API client with your API key
const api = new TimeCampAPI('your-api-key-here');

async function demonstrateNewFeatures() {
  try {
    // ========================================
    // 1. TASK USER ASSIGNMENT
    // ========================================
    console.log('\n=== Task User Assignment ===');
    
    // Update a task and assign users to it
    const updatedTask = await api.tasks.update({
      task_id: 12345,
      name: 'Updated Task Name',
      user_ids: '100,200,300', // Comma-separated user IDs
      role: 5, // Role ID to assign to these users
    });
    console.log('Task updated with assigned users:', updatedTask);

    // ========================================
    // 2. TAGS AND TAG LISTS
    // ========================================
    console.log('\n=== Tags Management ===');
    
    // Get all tag lists
    const tagLists = await api.tags.getTagLists();
    console.log('Tag lists:', tagLists);
    
    // Create a new tag list
    const newTagListId = await api.tags.createTagList({
      name: 'Project Types'
    });
    console.log('Created tag list ID:', newTagListId);
    
    // Create a tag in the list
    const newTagId = await api.tags.createTag({
      list: newTagListId,
      name: 'Development'
    });
    console.log('Created tag ID:', newTagId);
    
    // Get a specific tag list with its tags
    const tagListWithTags = await api.tags.getTagList(newTagListId);
    console.log('Tag list with tags:', tagListWithTags);

    // ========================================
    // 3. TAGS ON TIME ENTRIES
    // ========================================
    console.log('\n=== Time Entry Tags ===');
    
    // Create a time entry with tags
    const entry = await api.timeEntries.create({
      date: '2024-01-09',
      duration: 3600,
      start_time: '09:00',
      end_time: '10:00',
      description: 'Development work',
      task_id: 12345,
      tags: [
        { tagId: newTagId },
        { tagId: 4 }
      ]
    });
    console.log('Created entry:', entry);
    
    // Get tags for a time entry
    const entryTags = await api.timeEntries.getTags(entry.id);
    console.log('Entry tags:', entryTags);
    
    // Add more tags to the entry
    await api.timeEntries.addTags(entry.id, [5, 6]);
    
    // Remove tags from the entry
    await api.timeEntries.removeTags(entry.id, [4]);

    // ========================================
    // 4. BILLING RATES
    // ========================================
    console.log('\n=== Billing Rates ===');
    
    // Set a task rate
    const taskRate = await api.billingRates.setTaskRate(12345, {
      rateTypeId: 1,
      value: 150,
      addDate: '2024-01-09'
    });
    console.log('Task rate set:', taskRate);
    
    // Get task rates
    const taskRates = await api.billingRates.getTaskRates(12345);
    console.log('Task rates:', taskRates);
    
    // Set a user rate
    const userRate = await api.billingRates.setUserRate(100, {
      rateTypeId: 1,
      value: 100
    });
    console.log('User rate set:', userRate);
    
    // Set a task-user specific rate (overrides task and user rates)
    const taskUserRate = await api.billingRates.setTaskUserRate(12345, 100, {
      rateTypeId: 1,
      value: 175
    });
    console.log('Task-user rate set:', taskUserRate);
    
    // Get rates for task-user combination
    const taskUserRates = await api.billingRates.getTaskUserRates(12345, 100);
    console.log('Task-user rates:', taskUserRates);
    
    // Set a group rate
    const groupRate = await api.billingRates.setGroupRate(50, {
      rateTypeId: 1,
      value: 125
    });
    console.log('Group rate set:', groupRate);

    // ========================================
    // 5. GROUPS MANAGEMENT
    // ========================================
    console.log('\n=== Groups Management ===');
    
    // Get all groups
    const groups = await api.groups.getAll();
    console.log('All groups:', groups);
    
    // Create a new group
    const newGroup = await api.groups.create({
      name: 'Development Team',
      parent_id: 530222 // Parent group ID
    });
    console.log('Created group:', newGroup);
    
    // Update group name
    await api.groups.update({
      group_id: newGroup.group_id,
      name: 'Backend Development Team'
    });
    console.log('Group updated');
    
    // Move group to different parent
    await api.groups.update({
      group_id: newGroup.group_id,
      parent_id: 123456
    });
    
    // Delete a group
    await api.groups.delete(newGroup.group_id);
    console.log('Group deleted');

    console.log('\n=== All demonstrations complete! ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demonstration
demonstrateNewFeatures();
