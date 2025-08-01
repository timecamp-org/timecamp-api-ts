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

// Get current user
const user = await timecampApi.user.get();
console.log(user);

// Get tasks
const tasksResponse = await timecampApi.tasks.getActiveUserTasks();
if (tasksResponse.success) {
  console.log(tasksResponse.data); // Array of non-archived tasks
}

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
  end_time: '10:00:00'
});

const updatedEntry = await timecampApi.timeEntries.update(entryId, {
  description: 'Updated description',
  duration: 7200 // 2 hours
});

const deleteResult = await timecampApi.timeEntries.delete(entryId);
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
| `tasks.getActiveUserTasks()` | Get all non-archived tasks | None | `Promise<TasksAPIResponse>` |
| `timer.start()` | Start a new timer | `data?: TimerStartRequest` | `Promise<any>` |
| `timer.stop()` | Stop the currently running timer | `data?: TimerStopRequest` | `Promise<any>` |
| `timer.status()` | Get the current timer status | None | `Promise<any>` |
| `timeEntries.get()` | Get time entries | `params?: TimeCampTimeEntriesRequest` | `Promise<TimeCampTimeEntry[]>` |
| `timeEntries.create()` | Create a new time entry | `entry: TimeCampCreateTimeEntryRequest` | `Promise<TimeCampCreateTimeEntryResponse>` |
| `timeEntries.update()` | Update an existing time entry | `id: number, data: Partial<TimeCampCreateTimeEntryRequest>` | `Promise<TimeCampCreateTimeEntryResponse>` |
| `timeEntries.delete()` | Delete a time entry | `id: number` | `Promise<{success: boolean, message: string}>` |

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

#### `tasks.getActiveUserTasks()`

Get all non-archived tasks accessible to the current user.

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
  [key: string]: any;
}
```

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
  task_id?: string;
  description?: string;
  start_time: string;
  end_time: string;
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

## Not Yet Implemented

- Add service in config to let TimeCamp know who is making the api call
- Rename description to note in TimeCampTimeEntry
- Many more endpoints to be added

## License

MIT