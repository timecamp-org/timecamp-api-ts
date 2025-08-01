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