// Main API client
export { TimeCampAPI } from './TimeCampAPI';

// Types
export * from './types';

// Resources (for advanced usage / extension)
export {
  UserResource,
  TimerResource,
  CustomFieldsResource,
  UsersResource,
  TasksResource,
  TimeEntriesResource,
} from './resources';
export type { ResourceCustomFieldsAPI, CreateCustomFieldPayload, UpdateCustomFieldPayload } from './resources';

// HTTP Client (for advanced usage)
export { HttpClient, TimeCampAPIError } from './client';
export type { MakeRequestOptions, HttpClientConfig } from './client';

// Utilities
export { formatTimeCampDate } from './utils';

// Task filters
export { prepareTasksArray } from './taskFilters';
