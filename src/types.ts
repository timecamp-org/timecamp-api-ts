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

export interface TimerStatus {
  timer_id?: number;
  task_id?: number;
  start_time?: string;
  running: boolean;
  duration?: number;
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
  [key: string]: any;
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

export interface TimeCampTag {
  tagListName: string;
  tagListId: string;
  tagId: string;
  name: string;
  mandatory: string;
}

export interface TimeCampTimeEntriesRequest {
  user_ids?: string;
  task_id?: string;
  date_from: string;
  date_to: string;
}

export interface TimeCampCreateTimeEntryRequest {
  date: string;
  duration: number; // in seconds
  task_id?: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface TimeCampCreateTimeEntryResponse {
  success: boolean;
  id?: string;
  message: string;
}