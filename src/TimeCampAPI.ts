import { TimeCampAPIConfig } from './types';
import { HttpClient } from './client';
import {
  UserResource,
  TimerResource,
  CustomFieldsResource,
  UsersResource,
  TasksResource,
  TimeEntriesResource,
} from './resources';

/**
 * TimeCamp API client - main facade class
 *
 * @example
 * ```typescript
 * const api = new TimeCampAPI('your-api-key');
 *
 * // Get current user
 * const user = await api.user.get();
 *
 * // Get all tasks
 * const tasks = await api.tasks.getAll();
 *
 * // Start timer
 * const timer = await api.timer.start({ task_id: 123 });
 * ```
 */
export class TimeCampAPI {
  private httpClient: HttpClient;
  private _user: UserResource;
  private _timer: TimerResource;
  private _customFields: CustomFieldsResource;
  private _users: UsersResource;
  private _tasks: TasksResource;
  private _timeEntries: TimeEntriesResource;

  constructor(apiKey: string, config?: TimeCampAPIConfig) {
    this.httpClient = new HttpClient(apiKey, config);

    // Initialize resources
    this._user = new UserResource(this.httpClient);
    this._timer = new TimerResource(this.httpClient);
    this._customFields = new CustomFieldsResource(this.httpClient);
    this._users = new UsersResource(this.httpClient, this._user);
    this._tasks = new TasksResource(this.httpClient, this._user);
    this._timeEntries = new TimeEntriesResource(this.httpClient);
  }

  /**
   * Current user operations
   */
  get user(): UserResource {
    return this._user;
  }

  /**
   * Timer operations (start, stop, status)
   */
  get timer(): TimerResource {
    return this._timer;
  }

  /**
   * Custom field template management
   */
  get customFields(): CustomFieldsResource {
    return this._customFields;
  }

  /**
   * Users management
   */
  get users(): UsersResource {
    return this._users;
  }

  /**
   * Tasks management
   */
  get tasks(): TasksResource {
    return this._tasks;
  }

  /**
   * Time entries management
   */
  get timeEntries(): TimeEntriesResource {
    return this._timeEntries;
  }
}
