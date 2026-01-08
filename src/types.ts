export interface TimeCampUser {
  user_id: string;
  email: string;
  register_time: string;
  display_name: string;
  synch_time: string;
  root_group_id: string;
}

export interface TimeCampAPIConfig {
  baseURL?: string;
  timeout?: number;
  clientName?: string;
}

export interface TimeCampAPIResponse<T> {
  data: T;
  status: number;
}

export interface TimerStartRequest {
  task_id?: number;
  started_at?: string; // Format: "2021-03-05 08:54:12"
}

export interface TimerStopRequest {
  stopped_at?: string; // Format: "2021-03-05 09:54:12"
}

export interface TimerActionRequest {
  action: 'status' | 'start' | 'stop';
  task_id?: number;
  started_at?: string;
  stopped_at?: string;
  service?: string;
}

export interface TimerEntry {
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

export interface TimerStatusRunning {
  isTimerRunning: true;
  elapsed: number; // in seconds
  entry_id: string; // can be converted to number
  timer_id: string; // can be converted to number
  start_time: string; //format like '2025-11-16 19:06:00'
  browser_plugin_button_hash: string;
  note: string;
  task_id?: string; // can be converted to number
  name?: string; // task name if available
  external_task_id?: string;
  billable?: number; // 0 or 1
}

export interface TimerStatusStopped {
  isTimerRunning: false;
  elapsed: number;
}

export type TimerStatusResponse = TimerStatusRunning | TimerStatusStopped;

export interface TimerStartResponse {
  new_timer_id: number;
  entry_id: number;
  name: string;
  external_task_id: false | string;
  note: string | null;
}

export interface TimerStopResponse {
  elapsed: number;
  entry_id: string;
  entry_time: number;
}

export interface TimeCampTask {
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
  // Additional fields
  canTrackTime?: boolean;
  [key: string]: any;
}

export interface TimeCampTaskPickerItem {
  taskId: number;
  name: string;
  parentId: number;
  level: number;
  note?: string; // task description if set
  rootGroupId: number;
  archived: number;
  billable: boolean;
  color?: string; // example: '#000000'
  hasChildren: boolean;
  disabled: boolean;
  disableReason?: string;
  isMatched: boolean;
}

export interface TimeCampTaskFavoritesMeta {
  favourites?: {
    limit: number;
  };
  [key: string]: any;
}

export interface TimeCampTaskFavoritesResponse {
  data: {
    favourites: TimeCampTaskPickerItem[];
    suggested: TimeCampTaskPickerItem[];
  };
  message: string;
  meta: TimeCampTaskFavoritesMeta;
}

export interface TimeCampTaskFavoriteMutationResponse {
  data?: {
    taskId?: number;
    [key: string]: any;
  };
  message: string;
  meta?: Record<string, any>;
}

export interface GetActiveUserTasksOptions {
  user?: string;
  includeFullBreadcrumb?: boolean;
}

export interface TimeCampTasksResponse {
  [key: string]: TimeCampTask;
}

export interface TasksAPIResponse {
  success: boolean;
  data?: TimeCampTask[];
  message?: string;
  error?: string;
}

export interface TimeCampTimeEntry {
  id: number;
  duration: number;
  user_id: string;
  user_name: string;
  task_id: number;
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

export interface TimeCampTag {
  tagListName: string;
  tagListId: string;
  tagId: string;
  name: string;
  mandatory: string;
}

export interface TimeCampTimeEntriesRequest {
  user_ids?: string;
  task_ids?: string;
  date_from: string;
  date_to: string;
}

export interface TimeCampCreateTimeEntryRequest {
  date: string;
  duration: number; // in seconds
  task_id?: number;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface TimeCampCreateTimeEntryResponse {
  success: boolean;
  id?: string;
  message: string;
}

// Custom Fields (v3) types
export type TimeCampCustomFieldResourceType = 'user' | 'task' | 'entry';

export interface TimeCampCustomFieldTemplate {
  id: number;
  name: string;
  resourceType: TimeCampCustomFieldResourceType;
  required: boolean;
  status: number;
  fieldType: string;
  defaultValue: string | null;
  fieldOptions: Record<string, any>[] | null;
}

export interface TimeCampCustomFieldAssignment {
  id: number;
  resourceId: number;
  resourceType: TimeCampCustomFieldResourceType;
  required: boolean;
  value: string;
  fieldType: string;
  startDate: string;
  endDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeCampCustomFieldValueSummary {
  templateId: number;
  name: string;
  resourceType: TimeCampCustomFieldResourceType;
  required: boolean;
  fieldType: string;
  defaultValue: string | null;
  value: string;
}

export interface TimeCampCustomFieldTemplatesResponse {
  data: TimeCampCustomFieldTemplate[];
}

export interface TimeCampCustomFieldAssignmentResponse {
  data: TimeCampCustomFieldAssignment;
}

export interface TimeCampCustomFieldValuesResponse {
  data: TimeCampCustomFieldValueSummary[];
}

export type TimeCampUsersMapResponse = Record<string, any>;

export interface TimeCampUserInviteRequest {
  email: string;
  name?: string;
  group_id?: number;
}

export interface TimeCampUserInviteResponse {
  statuses: {
    [email: string]: {
      status: string; // e.g., "Invite", "Already exists", etc.
    };
  };
  user_id?: string; // Populated only when 'name' parameter is provided and user is successfully found
}

export interface TimeCampCreateTaskRequest {
  /** Task name (required) */
  name: string;
  /** Task parent ID */
  parent_id?: number;
  /** External task ID (e.g., ID from integration like Xero) */
  external_task_id?: string;
  /** External parent task ID (e.g., ID from integration like Xero) */
  external_parent_id?: string;
  /** Task budget value (defined in the unit specified by budget_unit) */
  budgeted?: number;
  /** Task description/note */
  note?: string;
  /** Is task archived (0 = active, 1 = archived) */
  archived?: 0 | 1;
  /** Is task billable (0 = non-billable, 1 = billable) */
  billable?: 0 | 1;
  /** Budget unit: 'hours' for time, 'fee' for fixed price, empty string for no budget */
  budget_unit?: 'hours' | 'fee' | '';
  /** Comma-separated user IDs to add to task (e.g., "22,521,2,25") */
  user_ids?: string;
  /** Role ID to assign to users if user_ids is provided */
  role?: number;
  /** Task keywords (comma-separated, e.g., "IT, R&D") */
  keywords?: string;
  /** @deprecated Use keywords instead. Comma-separated tag names */
  tags?: string;
}

export interface TimeCampCreateTaskResponseData {
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
  assigned_to: number | null;
  assigned_by: number;
  due_date: string | null;
  note: string | null;
  context: string | null;
  folder: string | null;
  repeat: string | null;
  billable: number;
  budget_unit: string;
  public_hash: string | null;
  modify_time: string | null;
  task_key: string | null;
  keywords: string;
}

export interface TimeCampCreateTaskResponse {
  [taskId: string]: TimeCampCreateTaskResponseData;
}