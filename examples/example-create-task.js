require('dotenv').config();
const { TimeCampAPI } = require('./dist');

/**
 * Example: Creating tasks with the TimeCamp API
 * 
 * This example demonstrates how to create tasks using the tasks.add() method
 * with various parameters including external IDs for integrations.
 */
async function example() {
  const apiKey = process.env.TIMECAMP_API_KEY;
  
  if (!apiKey) {
    console.error('Please set TIMECAMP_API_KEY environment variable');
    process.exit(1);
  }

  const api = new TimeCampAPI(apiKey);

  try {
    console.log('Creating tasks...\n');

    // Example 1: Create a simple task with only required fields
    console.log('Example 1: Creating task with only name (required field)');
    const simpleTask = await api.tasks.add({
      name: 'Development Task'
    });
    
    const simpleTaskId = Object.keys(simpleTask)[0];
    const simpleTaskData = simpleTask[simpleTaskId];
    console.log(`✓ Created task: ${simpleTaskData.name}`);
    console.log(`  Task ID: ${simpleTaskData.task_id}`);
    console.log(`  Parent ID: ${simpleTaskData.parent_id}`);
    console.log('');

    // Example 2: Create a task with external ID (for integrations like Xero)
    console.log('Example 2: Creating task with external ID');
    const taskWithExternal = await api.tasks.add({
      name: 'Xero Invoice Task',
      external_task_id: 'xero_inv_' + Date.now(),
      external_parent_id: 'xero_parent_123'
    });
    
    const externalTaskId = Object.keys(taskWithExternal)[0];
    const externalTaskData = taskWithExternal[externalTaskId];
    console.log(`✓ Created task: ${externalTaskData.name}`);
    console.log(`  Task ID: ${externalTaskData.task_id}`);
    console.log(`  External Task ID: ${externalTaskData.external_task_id}`);
    console.log('');

    // Example 3: Create a child task with full parameters
    console.log('Example 3: Creating child task with full parameters');
    const childTask = await api.tasks.add({
      name: 'Backend Development',
      parent_id: parseInt(simpleTaskId), // Must be a number
      budgeted: 1000,
      budget_unit: 'hours',
      billable: 1,
      archived: 0,
      note: 'Development task for API integration',
      keywords: 'API, Backend, Development'
    });
    
    const childTaskId = Object.keys(childTask)[0];
    const childTaskData = childTask[childTaskId];
    console.log(`✓ Created child task: ${childTaskData.name}`);
    console.log(`  Task ID: ${childTaskData.task_id}`);
    console.log(`  Parent ID: ${childTaskData.parent_id}`);
    console.log(`  Level: ${childTaskData.level}`);
    console.log(`  Budgeted: ${childTaskData.budgeted} ${childTaskData.budget_unit}`);
    console.log(`  Billable: ${childTaskData.billable === 1 ? 'Yes' : 'No'}`);
    console.log(`  Keywords: ${childTaskData.keywords}`);
    console.log('');

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

example();
