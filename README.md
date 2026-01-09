# TimeCamp API TypeScript Client

A TypeScript client library for the TimeCamp API.

## Installation

```bash
npm install timecamp-api
```

## Usage

```typescript
import { TimeCampAPI } from 'timecamp-api';

const timecampApi = new TimeCampAPI("your-api-key");

// With custom configuration
const timecampApi = new TimeCampAPI("your-api-key", {
  clientName: 'my-awesome-app',
  timeout: 15000
});

// Get current user
const user = await timecampApi.user.get();
console.log(user);

// Invite a user to your account
await timecampApi.users.invite({
  email: 'newuser@example.com',
  name: 'John Doe'
});

// Get tasks
const tasksResponse = await timecampApi.tasks.getActiveUserTasks({
  user: 'me',
  includeFullBreadcrumb: true
});
if (tasksResponse.success) {
  console.log(tasksResponse.data); // Array of non-archived tasks
}

// Get all tasks including archived ones
const allTasksResponse = await timecampApi.tasks.getAll();
if (allTasksResponse.success) {
  console.log(allTasksResponse.data); // Active + archived tasks
}

// Get favourite tasks for the task picker widget
const favourites = await timecampApi.tasks.getFavorites();
console.log(favourites.data.favourites);

// Manage favourites
await timecampApi.tasks.addFavorite(77390460);
await timecampApi.tasks.removeFavorite(77189336);

// Update a task and assign users
await timecampApi.tasks.update({
  task_id: 12345,
  name: 'Updated Task Name',
  user_ids: '100,200,300', // Comma-separated user IDs
  role: 5 // Role ID to assign
});

// Tags and Tag Lists
const tagLists = await timecampApi.tags.getTagLists();
const tagListId = await timecampApi.tags.createTagList({ name: 'Project Types' });
const tagId = await timecampApi.tags.createTag({ list: tagListId, name: 'Development' });

// Timer operations
const timerStatus = await timecampApi.timer.status();
const startedTimer = await timecampApi.timer.start();
const stoppedTimer = await timecampApi.timer.stop();

// Time entries operations
const timeEntries = await timecampApi.timeEntries.get({
  date_from: '2024-01-01',
  date_to: '2024-01-31'
});

const newEntry = await timecampApi.timeEntries.create({
  date: '2024-01-15',
  duration: 3600, // 1 hour in seconds
  description: 'Working on API integration',
  start_time: '09:00:00',
  end_time: '10:00:00',
  tags: [{ tagId: 1 }, { tagId: 4 }] // Optional tags
});

// Manage tags on time entries
const entryTags = await timecampApi.timeEntries.getTags(entryId);
await timecampApi.timeEntries.addTags(entryId, [5, 6]);
await timecampApi.timeEntries.removeTags(entryId, [4]);

const updatedEntry = await timecampApi.timeEntries.update(entryId, {
  description: 'Updated description',
  duration: 7200 // 2 hours
});

const deleteResult = await timecampApi.timeEntries.delete(entryId);

// Billing Rates
await timecampApi.billingRates.setTaskRate(12345, { rateTypeId: 1, value: 150 });
await timecampApi.billingRates.setUserRate(100, { rateTypeId: 1, value: 100 });
await timecampApi.billingRates.setTaskUserRate(12345, 100, { rateTypeId: 1, value: 175 });
const taskRates = await timecampApi.billingRates.getTaskRates(12345);

// Groups
const groups = await timecampApi.groups.getAll();
const newGroup = await timecampApi.groups.create({ name: 'Development Team', parent_id: 123 });
await timecampApi.groups.update({ group_id: newGroup.group_id, name: 'Dev Team' });
```

## API

### Constructor

```typescript
new TimeCampAPI(apiKey: string, config?: TimeCampAPIConfig)
```

- `apiKey`: Your TimeCamp API key
- `config`: Optional configuration object
  - `baseURL`: Custom API base URL (default: 'https://app.timecamp.com/third_party/api')
  - `timeout`: Request timeout in milliseconds (default: 10000)

### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `user.get()` | Get information about the current user | None | `Promise<TimeCampUser>` |
| `users.getAll()` | Get all users | None | `Promise<Record<string, any>>` |
| `users.invite()` | Invite a user to TimeCamp account | `params: TimeCampUserInviteRequest` | `Promise<TimeCampUserInviteResponse>` |
| `users.byId(id)` | Chainable selector for a user resource | `id: number` | `{ getAllCustomFields, getCustomField, setCustomField, updateCustomField, deleteCustomField }` |
| `tasks.byId(id)` | Chainable selector for a task resource | `id: number` | `{ getAllCustomFields, getCustomField, setCustomField, updateCustomField, deleteCustomField }` |
| `timeEntries.byId(id)` | Chainable selector for a time entry resource | `id: number` | `{ getAllCustomFields, getCustomField, setCustomField, updateCustomField, deleteCustomField }` |
| `customFields.getAll()` | List all custom fields templates (v3) | None | `Promise<{ data: TimeCampCustomFieldTemplate[] }>` |
| `customFields.add(payload)` | Create a custom field template (v3) | `{ name, resourceType, fieldType, required?, status?, defaultValue?, fieldOptions? }` | `Promise<{ data: TimeCampCustomFieldTemplate }>` |
| `customFields.delete(templateId)` | Remove a custom field template (v3) | `templateId: number` | `Promise<{ data: string }>` |
| `tasks.getAll()` | Get every task including archived | None | `Promise<TasksAPIResponse>` |
| `tasks.getActiveUserTasks(options?: GetActiveUserTasksOptions)` | Get all non-archived tasks | `options`: `{ user?: string; includeFullBreadcrumb?: boolean; }` | `Promise<TasksAPIResponse>` |
| `tasks.add(params)` | Create a new task | `params: TimeCampCreateTaskRequest` | `Promise<TimeCampCreateTaskResponse>` |
| `tasks.update(params)` | Update an existing task | `params: TimeCampUpdateTaskRequest` | `Promise<TimeCampCreateTaskResponse>` |
| `tasks.getFavorites()` | Fetch task picker favourites and suggestions | None | `Promise<TimeCampTaskFavoritesResponse>` |
| `tasks.addFavorite(taskId)` | Mark a task as favourite for the picker | `taskId: number` | `Promise<TimeCampTaskFavoriteMutationResponse>` |
| `tasks.removeFavorite(taskId)` | Remove a task from favourites | `taskId: number` | `Promise<TimeCampTaskFavoriteMutationResponse>` |
| `tags.getTagLists(options?)` | Get all tag lists | `options?: TimeCampGetTagListsOptions` | `Promise<TimeCampTagListsResponse>` |
| `tags.getTagList(tagListId)` | Get specific tag list with tags | `tagListId: number` | `Promise<TimeCampTagListWithTags>` |
| `tags.createTagList(params)` | Create new tag list | `params: { name: string }` | `Promise<number>` |
| `tags.updateTagList(tagListId, params)` | Update tag list | `tagListId: number, params: { name?, archived? }` | `Promise<{ message: string }>` |
| `tags.getTagListTags(tagListId)` | Get only tags from tag list | `tagListId: number` | `Promise<{ [tagId: string]: TimeCampTagItem }>` |
| `tags.createTag(params)` | Create new tag | `params: { list: number, name: string }` | `Promise<number>` |
| `tags.getTag(tagId)` | Get tag data | `tagId: number` | `Promise<TimeCampTagItem>` |
| `tags.updateTag(tagId, params)` | Update tag | `tagId: number, params: { name?, archived? }` | `Promise<{ message: string }>` |
| `timer.start()` | Start a new timer | `data?: TimerStartRequest` | `Promise<any>` |
| `timer.stop()` | Stop the currently running timer | `data?: TimerStopRequest` | `Promise<any>` |
| `timer.status()` | Get the current timer status | None | `Promise<any>` |
| `timeEntries.get()` | Get time entries | `params?: TimeCampTimeEntriesRequest` | `Promise<TimeCampTimeEntry[]>` |
| `timeEntries.create()` | Create a new time entry | `entry: TimeCampCreateTimeEntryRequest` | `Promise<TimeCampCreateTimeEntryResponse>` |
| `timeEntries.update()` | Update an existing time entry | `id: number, data: Partial<TimeCampCreateTimeEntryRequest>` | `Promise<TimeCampCreateTimeEntryResponse>` |
| `timeEntries.delete()` | Delete a time entry | `id: number` | `Promise<{success: boolean, message: string}>` |
| `timeEntries.getTags(entryId)` | Get tags for time entry | `entryId: number` | `Promise<TimeCampEntryTagsResponse>` |
| `timeEntries.addTags(entryId, tagIds)` | Add tags to time entry | `entryId: number, tagIds: number[]` | `Promise<string[]>` |
| `timeEntries.removeTags(entryId, tagIds)` | Remove tags from time entry | `entryId: number, tagIds: number[]` | `Promise<string[]>` |
| `billingRates.getTaskRates(taskId, rateTypeId?)` | Get billing rates for task | `taskId: number, rateTypeId?: string` | `Promise<TimeCampBillingRatesResponse>` |
| `billingRates.setTaskRate(taskId, data)` | Set/update task billing rate | `taskId: number, data: TimeCampSetRateRequest` | `Promise<TimeCampBillingRate>` |
| `billingRates.getUserRates(userId, rateTypeId?)` | Get billing rates for user | `userId: number, rateTypeId?: string` | `Promise<TimeCampBillingRatesResponse>` |
| `billingRates.setUserRate(userId, data)` | Set/update user billing rate | `userId: number, data: TimeCampSetRateRequest` | `Promise<TimeCampBillingRate>` |
| `billingRates.getTaskUserRates(taskId, userId, rateTypeId?)` | Get task-user billing rates | `taskId: number, userId: number, rateTypeId?: string` | `Promise<TimeCampBillingRatesResponse>` |
| `billingRates.setTaskUserRate(taskId, userId, data)` | Set/update task-user rate | `taskId: number, userId: number, data: TimeCampSetRateRequest` | `Promise<TimeCampBillingRate>` |
| `billingRates.getGroupRates(groupId, rateTypeId?)` | Get billing rates for group | `groupId: number, rateTypeId?: string` | `Promise<TimeCampBillingRatesResponse>` |
| `billingRates.setGroupRate(groupId, data)` | Set/update group billing rate | `groupId: number, data: TimeCampSetRateRequest` | `Promise<TimeCampBillingRate>` |
| `groups.getAll()` | Get all groups | None | `Promise<TimeCampGroupsResponse[]>` |
| `groups.create(params)` | Create a new group | `params: { name: string, parent_id?: number }` | `Promise<TimeCampGroup>` |
| `groups.update(params)` | Update an existing group | `params: { group_id: number, name?, parent_id? }` | `Promise<void>` |
| `groups.delete(groupId)` | Delete a group | `groupId: number` | `Promise<void>` |

#### `user.get()`

Get information about the current user.

**Returns**: `Promise<TimeCampUser>`

```typescript
interface TimeCampUser {
  user_id: string;
  email: string;
  register_time: string;
  display_name: string;
  synch_time: string;
  root_group_id: string;
}
```

#### `tasks.getActiveUserTasks(options?: GetActiveUserTasksOptions)`

Get all non-archived tasks accessible to a user.

**Parameters**:
- `options.user` (optional): Defaults to `'me'`. Pass a numerical user ID string to fetch tasks for a different user.
- `options.includeFullBreadcrumb` (optional): Defaults to `true`. Controls whether full breadcrumb information is included in the API response.

**Returns**: `Promise<TasksAPIResponse>`

```typescript
interface TasksAPIResponse {
  success: boolean;
  data?: TimeCampTask[];
  message?: string;
  error?: string;
}

interface TimeCampTask {
  task_id: number;
  parent_id: number;
  assigned_by?: number;
  name: string;
  external_task_id?: string;
  external_parent_id?: string;
  task_key?: string | null;
  level: number;
  archived: number;
  keywords?: string;
  budgeted?: number;
  budget_unit: string;
  root_group_id?: number;
  billable: number;
  note?: string;
  public_hash?: string | null;
  add_date?: string;
  modify_time?: string;
  color?: string;
  user_access_type: number;
  users?: {
    [userId: string]: {
      user_id: number;
      role_id: number;
    };
  };
  groups?: string[];
  roles?: string[];
  perms?: {
    [permId: string]: number;
  };
  canTrackTime?: boolean;
  [key: string]: any;
}
```

#### `tasks.getAll()`

Get all tasks including archived ones.

**Returns**: `Promise<TasksAPIResponse>`

#### `tasks.add(params: TimeCampCreateTaskRequest)`

Create a new task in TimeCamp. This method allows you to create tasks with various parameters including external IDs for integrations.

**Parameters**:
- `params`: Task creation parameters
  - `name`: Task name (required)
  - `parent_id`: Parent task ID as number (optional)
  - `external_task_id`: External task ID for integrations like Xero (optional)
  - `external_parent_id`: External parent task ID (optional)
  - `budgeted`: Budget value in the unit specified by `budget_unit` (optional)
  - `note`: Task description/note (optional)
  - `archived`: 0 for active, 1 for archived (optional, default: 0)
  - `billable`: 0 for non-billable, 1 for billable (optional, default: 1)
  - `budget_unit`: 'hours', 'fee', or '' (optional, default: 'hours')
  - `user_ids`: Comma-separated user IDs to add to task (optional, e.g., "22,521,2,25")
  - `role`: Role ID to assign to users if user_ids is provided (optional)
  - `keywords`: Task keywords, comma-separated (optional, e.g., "IT, R&D")
  - `tags`: (deprecated) Use keywords instead (optional)

**Returns**: `Promise<TimeCampCreateTaskResponse>`

```typescript
interface TimeCampCreateTaskRequest {
  name: string; // required
  parent_id?: number;
  external_task_id?: string;
  external_parent_id?: string;
  budgeted?: number;
  note?: string;
  archived?: 0 | 1;
  billable?: 0 | 1;
  budget_unit?: 'hours' | 'fee' | '';
  user_ids?: string;
  role?: number;
  keywords?: string;
  tags?: string; // deprecated
}

interface TimeCampCreateTaskResponse {
  [taskId: string]: {
    task_id: number;
    parent_id: number;
    name: string;
    external_task_id: string | null;
    external_parent_id: string | null;
    level: number;
    add_date: string;
    archived: number;
    color: string;
    tags: string;
    budgeted: number;
    checked_date: string | null;
    root_group_id: number;
    billable: number;
    budget_unit: string;
    note: string | null;
    keywords: string;
    // ... additional fields
  };
}
```

**Example**:

```typescript
// Create a simple task
const task = await api.tasks.add({
  name: 'Development Task'
});

// Create a task with external ID (for integrations)
const taskWithExternal = await api.tasks.add({
  name: 'Xero Invoice Task',
  external_task_id: 'xero_g8g89s78ds8',
  external_parent_id: 'xero_2b5b26tb295bb9'
});

// Create a child task with full parameters
const childTask = await api.tasks.add({
  name: 'Backend Development',
  parent_id: 123456, // number type
  budgeted: 1000,
  budget_unit: 'hours',
  billable: 1,
  note: 'Development task for API integration',
  keywords: 'API, Backend, Development'
});

// Access the created task data
const taskId = Object.keys(task)[0];
const taskData = task[taskId];
console.log(`Created task: ${taskData.name} (ID: ${taskData.task_id})`);
```

#### `tasks.update(params: TimeCampUpdateTaskRequest)`

Update an existing task. This method supports all the same parameters as `tasks.add()` and is particularly useful for assigning users to tasks.

**Parameters**:
- `params`: Task update parameters
  - `task_id`: Task ID to update (required)
  - `name`: Task name (optional)
  - `parent_id`: Parent task ID (optional)
  - `user_ids`: Comma-separated user IDs to assign to task (optional, e.g., "22,521,2,25")
  - `role`: Role ID to assign to users if user_ids is provided (optional)
  - All other parameters from `tasks.add()` are also supported

**Returns**: `Promise<TimeCampCreateTaskResponse>`

```typescript
interface TimeCampUpdateTaskRequest {
  task_id: number; // required
  name?: string;
  parent_id?: number;
  user_ids?: string; // Comma-separated user IDs
  role?: number; // Role ID for assigned users
  // ... all other optional parameters from TimeCampCreateTaskRequest
}
```

**Example**:

```typescript
// Update task name
await api.tasks.update({
  task_id: 12345,
  name: 'Updated Task Name'
});

// Assign users to a task
await api.tasks.update({
  task_id: 12345,
  user_ids: '100,200,300', // Assign users 100, 200, and 300
  role: 5 // Assign them role ID 5
});

// Update multiple properties including user assignment
await api.tasks.update({
  task_id: 12345,
  name: 'Development Sprint 1',
  user_ids: '100,200',
  role: 5,
  billable: 1,
  budgeted: 40,
  budget_unit: 'hours'
});
```

#### `users.getAll()`

List all users visible to the authenticated account.

Returns: `Promise<Record<string, any>>`

#### `users.invite(params: TimeCampUserInviteRequest)`

Invite a user to your TimeCamp account. When a `name` parameter is provided, the method will automatically update the user's display name after the invite is successful.

**Parameters**:
- `params`: User invitation parameters
  - `email`: Email address of the user to invite (required)
  - `name`: Display name for the user (optional). If provided, an additional API call will be made to update the user's display name after the invite.
  - `group_id`: ID of the group to add the user to (optional, defaults to current user's root group)

**Returns**: `Promise<TimeCampUserInviteResponse>`

**Retry Behavior**: This method automatically retries up to 3 times with a 5-second delay when encountering a 429 (rate limit) error.

**Display Name Update**: When a `name` is provided, the method will:
1. Send the invitation
2. Poll the user list (up to 10 times with 2-second delays) to find the new user's ID
3. Make an additional POST request to `api/user` with form-encoded data to update the user's display name
4. Return the response with the `user_id` included

Note: There is typically a 2-4 second delay between when the invite succeeds and when the user appears in the users list, which is why the method includes retry logic.

```typescript
interface TimeCampUserInviteRequest {
  email: string;
  name?: string;
  group_id?: number;
}

interface TimeCampUserInviteResponse {
  statuses: {
    [email: string]: {
      status: string; // e.g., "Invite", "Already exists", etc.
    };
  };
  user_id?: string; // Included when name is provided and update succeeds
}
```

**Example**:

```typescript
// Invite user with automatic group assignment and set display name
const result = await timecampApi.users.invite({
  email: 'newuser@example.com',
  name: 'John Doe'
});
// Response: { 
//   statuses: { 'newuser@example.com': { status: 'Invite' } },
//   user_id: '123456'
// }

// Invite user to a specific group with display name
const result2 = await timecampApi.users.invite({
  email: 'newuser@example.com',
  name: 'John Doe',
  group_id: 12345
});

// Invite user without setting a display name (skips name update)
const result3 = await timecampApi.users.invite({
  email: 'another@example.com',
  group_id: 12345
});

// Check the invite status and user ID
console.log(result.statuses['newuser@example.com'].status); // "Invite"
console.log(result.user_id); // "123456"
```

#### Custom Fields (v3)

Convenience helpers to manage Custom Fields for users, tasks and time entries.

```typescript
// List all templates
const templates = await timecampApi.customFields.getAll()

// Create and delete a template
const created = await timecampApi.customFields.add({
  name: 'Customer Priority',
  resourceType: 'user',
  fieldType: 'string',
  required: false,
  defaultValue: ''
})
await timecampApi.customFields.delete(created.data.id)

// Users
await timecampApi.users.getAll()
await timecampApi.users.byId(123).getAllCustomFields()
await timecampApi.users.byId(123).getCustomField(66)
await timecampApi.users.byId(123).setCustomField(66, 'In Progress')
await timecampApi.users.byId(123).updateCustomField(66, 'Done')
await timecampApi.users.byId(123).deleteCustomField(66)

// Tasks
await timecampApi.tasks.byId(456).getAllCustomFields()
await timecampApi.tasks.byId(456).getCustomField(66)
await timecampApi.tasks.byId(456).setCustomField(66, '5')
await timecampApi.tasks.byId(456).deleteCustomField(66)

// Time Entries
await timecampApi.timeEntries.byId(789).getAllCustomFields()
```

### Tags and Tag Lists

Manage tags and tag lists for organizing time entries.

#### Tag Lists

```typescript
// Get all tag lists
const tagLists = await timecampApi.tags.getTagLists();

// Get tag lists with options
const tagLists = await timecampApi.tags.getTagLists({
  archived: 0, // Exclude archived
  tags: 1, // Include tags in response
  exclude_empty_tag_lists: 1 // Exclude empty tag lists
});

// Get specific tag list with all its tags
const tagList = await timecampApi.tags.getTagList(8);
console.log(tagList.name); // "My tag list"
console.log(tagList.tags); // Object with tag IDs as keys

// Create a new tag list
const tagListId = await timecampApi.tags.createTagList({
  name: 'Project Types'
});

// Update a tag list
await timecampApi.tags.updateTagList(tagListId, {
  name: 'Updated Tag List Name',
  archived: 0
});

// Get only the tags from a tag list (without tag list details)
const tags = await timecampApi.tags.getTagListTags(8);
```

#### Tags

```typescript
// Create a new tag in a tag list
const tagId = await timecampApi.tags.createTag({
  list: 52, // Tag list ID
  name: 'Development'
});

// Get tag details
const tag = await timecampApi.tags.getTag(13);
console.log(tag.name); // "Development"
console.log(tag.tagListId); // "52"

// Update a tag
await timecampApi.tags.updateTag(13, {
  name: 'Backend Development',
  archived: 0
});
```

### Tags on Time Entries

Add, retrieve, and remove tags from time entries.

```typescript
// Create time entry with tags
const entry = await timecampApi.timeEntries.create({
  date: '2024-01-09',
  duration: 3600,
  start_time: '09:00',
  end_time: '10:00',
  description: 'Development work',
  task_id: 12345,
  tags: [
    { tagId: 1 },
    { tagId: 4 }
  ]
});

// Get tags for a time entry
const entryTags = await timecampApi.timeEntries.getTags(101434259);
// Returns: { '101434259': [{ tagListName, tagListId, tagId, name, mandatory }] }

// Add tags to an existing time entry
await timecampApi.timeEntries.addTags(101434259, [13, 14]);
// Returns: ['13'] (IDs of successfully added tags)

// Remove tags from time entry
await timecampApi.timeEntries.removeTags(101434259, [15]);
// Returns: ['15'] (IDs of successfully removed tags)
```

### Billing Rates

Manage billing rates for tasks, users, groups, and task-user combinations.

#### Task Rates

```typescript
// Get all billing rates for a task
const taskRates = await timecampApi.billingRates.getTaskRates(12345);
// Returns: { '12345': [{ rateId, rateTypeId, value, refType, addDate, refId }] }

// Get specific rate type for a task
const taskRates = await timecampApi.billingRates.getTaskRates(12345, '1,2'); // Comma-separated rate type IDs

// Set or update a task billing rate
const rate = await timecampApi.billingRates.setTaskRate(12345, {
  rateTypeId: 1,
  value: 150,
  addDate: '2024-01-09' // Optional
});
```

#### User Rates

```typescript
// Get all billing rates for a user
const userRates = await timecampApi.billingRates.getUserRates(100);

// Set or update a user billing rate
const rate = await timecampApi.billingRates.setUserRate(100, {
  rateTypeId: 1,
  value: 100
});
```

#### Task-User Rates (Specific Override)

Task-user rates override both task and user rates for a specific user on a specific task.

```typescript
// Get task-user specific rates
const taskUserRates = await timecampApi.billingRates.getTaskUserRates(12345, 100);

// Set task-user specific rate (overrides task and user rates)
const rate = await timecampApi.billingRates.setTaskUserRate(12345, 100, {
  rateTypeId: 1,
  value: 175 // Higher rate for this user on this specific task
});
```

#### Group Rates

```typescript
// Get all billing rates for a group
const groupRates = await timecampApi.billingRates.getGroupRates(50);

// Set or update a group billing rate
const rate = await timecampApi.billingRates.setGroupRate(50, {
  rateTypeId: 1,
  value: 125
});
```

**Billing Rate Types**:
```typescript
interface TimeCampSetRateRequest {
  rateTypeId: number; // Rate type identifier
  value: number; // Rate value (e.g., hourly rate)
  addDate?: string; // Optional date in YYYY-MM-DD format
}

interface TimeCampBillingRate {
  rateId: number;
  rateTypeId: number;
  value: string;
  refType: string; // 'task', 'user', 'task_user', or 'group'
  addDate: string;
  refId: string;
}
```

### Groups

Manage groups (departments, teams) in your TimeCamp organization.

```typescript
// Get all groups
const groups = await timecampApi.groups.getAll();
console.log(groups); // [{ group_id: 530222, name: 'People', parent_id: 0 }]

// Create a new group under a parent
const newGroup = await timecampApi.groups.create({
  name: 'Development Team',
  parent_id: 530222
});
console.log(newGroup.group_id); // 390673
console.log(newGroup.root_group_id); // 530222

// Create a root group (parent_id defaults to 0 if not provided)
const rootGroup = await timecampApi.groups.create({
  name: 'New Organization'
});

// Update a group's name
await timecampApi.groups.update({
  group_id: 390673,
  name: 'Backend Development'
});

// Move a group to a different parent
await timecampApi.groups.update({
  group_id: 390673,
  parent_id: 123456 // New parent group ID
});

// Update both name and parent
await timecampApi.groups.update({
  group_id: 390673,
  name: 'Backend Team',
  parent_id: 123456
});

// Delete a group
await timecampApi.groups.delete(390673);
```

**Important Notes**:
- Maximum group tree depth is 4 levels
- Root groups have `parent_id = 0` (there can only be one root group)
- When a group is deleted, all its subgroups are moved to the root group
- Root groups cannot be deleted

**Group Types**:
```typescript
interface TimeCampCreateGroupRequest {
  name: string; // Group name (required)
  parent_id?: number; // Parent group ID (optional, defaults to 0 for root)
}

interface TimeCampGroup {
  group_id: number;
  name: string;
  parent_id: number;
  admin_id?: number;
  root_group_id?: number;
}

interface TimeCampUpdateGroupRequest {
  group_id: number; // Group ID to update (required)
  name?: string; // New name (optional)
  parent_id?: number; // New parent ID (optional)
}
```


Fetch every task visible to the authenticated account, including archived tasks.

**Returns**: `Promise<TasksAPIResponse>`

#### `timer.start(data?: TimerStartRequest)`

Start a new timer.

**Parameters**:
- `data` (optional): Timer start configuration
  - `task_id`: ID of the task to track (optional)
  - `note`: Description note for the timer (optional)
  - `started_at`: Custom start time in ISO 8601 format (optional, defaults to current time)

**Returns**: `Promise<TimerEntry>`

```typescript
interface TimerStartRequest {
  task_id?: number;
  note?: string;
  started_at?: string; // ISO 8601 format
}
```

#### `timer.stop(data?: TimerStopRequest)`

Stop the currently running timer.

**Parameters**:
- `data` (optional): Timer stop configuration
  - `stopped_at`: Custom stop time in ISO 8601 format (optional, defaults to current time)

**Returns**: `Promise<TimerEntry>`

```typescript
interface TimerStopRequest {
  stopped_at?: string; // ISO 8601 format
}
```

#### `timer.status()`

Get the current timer status.

**Returns**: `Promise<TimerStatus>`

```typescript
interface TimerStatus {
  timer_id?: number;
  task_id?: number;
  start_time?: string;
  running: boolean;
  duration?: number;
}

interface TimerEntry {
  id: number;
  task_id: number;
  user_id: number;
  name: string;
  note: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  locked: boolean;
  billable: boolean;
  invoiced: boolean;
  approved: boolean;
}
```

#### `timeEntries.get(params?: TimeCampTimeEntriesRequest)`

Get time entries with optional filtering.

**Parameters**:
- `params` (optional): Filtering parameters
  - `user_ids`: Filter by user ID, to get only user entries use "me" (optional)
  - `task_id`: Filter by task ID (optional)
  - `date_from`: Start date in YYYY-MM-DD format (optional)
  - `date_to`: End date in YYYY-MM-DD format (optional)
  - `format`: Response format, 'json' is automatically set (optional)

**Returns**: `Promise<TimeCampTimeEntry[]>`

```typescript
interface TimeCampTimeEntriesRequest {
  user_id?: string;
  task_id?: string;
  date_from?: string;
  date_to?: string;
  format?: string;
}

interface TimeCampTimeEntry {
  id: number;
  duration: number; // Duration in seconds
  user_id: string;
  user_name: string;
  task_id: string;
  task_note?: string;
  last_modify: string;
  date: string;
  start_time: string;
  end_time: string;
  locked: string;
  name: string;
  addons_external_id: string;
  billable: number;
  invoiceId: string;
  color: string;
  description: string;
  tags: TimeCampTag[];
  hasEntryLocationHistory: boolean;
}

interface TimeCampTag {
  tagListName: string;
  tagListId: string;
  tagId: string;
  name: string;
  mandatory: string;
}
```

#### `timeEntries.create(entry: TimeCampCreateTimeEntryRequest)`

Create a new time entry.

**Parameters**:
- `entry`: Time entry data
  - `date`: Date in YYYY-MM-DD format (required)
  - `duration`: Duration in seconds (required)
  - `start_time`: Start time in HH:MM:SS format (required)
  - `end_time`: End time in HH:MM:SS format (required)
  - `task_id`: ID of the task (optional)
  - `description`: Description of the work done (optional)

**Returns**: `Promise<TimeCampCreateTimeEntryResponse>`

```typescript
interface TimeCampCreateTimeEntryRequest {
  date: string;
  duration: number; // in seconds
  task_id?: number;
  description?: string;
  start_time: string;
  end_time: string;
  user_id?: number;
  billable?: boolean;
  tags?: Array<{ tagId: number }>; // Optional tags to add on creation
}

interface TimeCampCreateTimeEntryResponse {
  success: boolean;
  id?: string;
  message: string;
}
```

#### `timeEntries.update(id: number, data: Partial<TimeCampCreateTimeEntryRequest>)`

Update an existing time entry.

**Parameters**:
- `id`: ID of the time entry to update (required)
- `data`: Partial time entry data to update (supports partial updates)

**Returns**: `Promise<TimeCampCreateTimeEntryResponse>`

#### `timeEntries.delete(id: number)`

Delete a time entry.

**Parameters**:
- `id`: ID of the time entry to delete (required)

**Returns**: `Promise<{success: boolean, message: string}>`

## API Reference

Based on the [TimeCamp API documentation](https://developer.timecamp.com/).

## Recent Updates

### Version 1.7.0
- ✅ Added `tasks.update()` method for updating tasks and assigning users
- ✅ Added complete tags and tag lists management (`tags.*` methods)
- ✅ Added tag support for time entries (create with tags, add/remove tags)
- ✅ Added billing rates management for tasks, users, groups, and task-user combinations
- ✅ Added groups management (`groups.getAll()`, `groups.create()`, `groups.update()`, `groups.delete()`)

## Not Yet Implemented

- Rename description to note in TimeCampTimeEntry
- Many more endpoints to be added

## License

MIT