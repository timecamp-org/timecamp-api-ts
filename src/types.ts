export interface TimeCampUser {
  user_id: string;
  email: string;
  display_name: string;
  timezone: string;
  group_id: string;
  user_access_role: string;
  avatar_url?: string;
}

export interface TimeCampAPIConfig {
  baseURL?: string;
  timeout?: number;
}

export interface TimeCampAPIResponse<T> {
  data: T;
  status: number;
}