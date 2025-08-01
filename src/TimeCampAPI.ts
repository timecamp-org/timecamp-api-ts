import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  TimeCampUser, 
  TimeCampAPIConfig, 
  TimeCampAPIResponse, 
  TimerStartRequest, 
  TimerStopRequest, 
  TimerEntry, 
  TimerStatus,
  TimerActionRequest,
  TimeCampTask,
  TimeCampTasksResponse,
  TasksAPIResponse
} from './types';

export class TimeCampAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, config?: TimeCampAPIConfig) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: config?.baseURL || 'https://app.timecamp.com/third_party/api',
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TimeCampAPI/NPM',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    // Add request interceptor to include API key
    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params
      };
      return config;
    });
  }

  public get user() {
    return {
      get: async (): Promise<TimeCampUser> => {
        try {
          const response: AxiosResponse<TimeCampUser> = await this.client.get('/me');
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      }
    };
  }

  private formatTimeCampDate(date?: string | Date): string {
    const d = date ? new Date(date) : new Date();
    return d.getFullYear() + '-' + 
           String(d.getMonth() + 1).padStart(2, '0') + '-' + 
           String(d.getDate()).padStart(2, '0') + ' ' +
           String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0') + ':' +
           String(d.getSeconds()).padStart(2, '0');
  }

  public get timer() {
    return {
      start: async (data?: TimerStartRequest): Promise<any> => {
        try {
          const payload: TimerActionRequest = {
            action: 'start',
            task_id: data?.task_id,
            started_at: data?.started_at || this.formatTimeCampDate()
          };
          const response: AxiosResponse<any> = await this.client.post('/timer', payload);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      },

      stop: async (data?: TimerStopRequest): Promise<any> => {
        try {
          const payload: TimerActionRequest = {
            action: 'stop',
            stopped_at: data?.stopped_at || this.formatTimeCampDate()
          };
          const response: AxiosResponse<any> = await this.client.post('/timer', payload);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      },

      status: async (): Promise<any> => {
        try {
          const payload: TimerActionRequest = {
            action: 'status'
          };
          const response: AxiosResponse<any> = await this.client.post('/timer', payload);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      }
    };
  }

  public get tasks() {
    return {
      getActiveUserTasks: async (): Promise<TasksAPIResponse> => {
        try {
          // Make API request with ignoreAdminRights parameter
          const response: AxiosResponse<TimeCampTasksResponse> = await this.client.get('/tasks', {
            params: {
              ignoreAdminRights: "1"
            }
          });

          // Convert object to array, filter non-archived tasks, and remove tags field
          const tasksArray: TimeCampTask[] = Object.values(response.data)
            .filter((task: any) => task.archived === 0)
            .map((task: any) => {
              const { tags, ...taskWithoutTags } = task;
              return taskWithoutTags as TimeCampTask;
            });

          return {
            success: true,
            data: tasksArray,
            message: "Tasks fetched successfully"
          };
        } catch (error) {
          console.error('Error fetching tasks:', error);
          if (axios.isAxiosError(error)) {
            return {
              success: false,
              error: `TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`
            };
          }
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    };
  }
}