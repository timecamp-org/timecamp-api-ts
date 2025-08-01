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
const startedTimer = await timecampApi.timer.start({ note: "Working on project" });
const stoppedTimer = await timecampApi.timer.stop();
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

## API Reference

Based on the [TimeCamp API documentation](https://developer.timecamp.com/).

## License

MIT