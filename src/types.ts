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