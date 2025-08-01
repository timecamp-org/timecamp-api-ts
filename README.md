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

## Testing

The library includes test files to help you test the timer functionality with real API requests:

### Basic Testing
```bash
# Build the project
npm run build

# Run basic example (requires TIMECAMP_API_KEY environment variable)
node example.js

# Run detailed timer tests
node example.js --test
```

### Advanced Timer Testing
```bash
# Set your API key
export TIMECAMP_API_KEY="your-actual-api-key"

# Check timer status
node timer-test.js --status

# Start a timer
node timer-test.js --start

# Start timer with custom note
node timer-test.js --start --note="Working on feature"

# Start timer with task ID
node timer-test.js --start --task-id=12345

# Stop current timer
node timer-test.js --stop

# Run full test cycle (start, wait, stop)
node timer-test.js --full
```

## API Reference

Based on the [TimeCamp API documentation](https://developer.timecamp.com/#/operations/post-timer).

## License

MIT