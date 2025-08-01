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
const user = await timecampApi.user.get(); // get current user

console.log(user);
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

## License

MIT