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
  TasksAPIResponse,
  TimeCampTimeEntry,
  TimeCampTimeEntriesRequest,
  TimeCampCreateTimeEntryRequest,
  TimeCampCreateTimeEntryResponse
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

  private async makeRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, options: { params?: Record<string, string>; json?: any } = {}): Promise<T> {
    try {
      const config: any = {
        method,
        url: `${this.client.defaults.baseURL}/${endpoint}`,
        headers: this.client.defaults.headers,
      };

      if (options.params) {
        config.params = options.params;
      }

      if (options.json) {
        config.data = options.json;
      }

      // For GET requests with JSON format, ensure we get JSON response
      if (method === 'GET' && !options.params?.format) {
        config.params = { ...config.params, format: 'json' };
      }

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
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

  public get timeEntries() {
    return {
      get: async (params: TimeCampTimeEntriesRequest): Promise<TimeCampTimeEntry[]> => {
        const queryParams: Record<string, string> = {}
        
        // Map parameters to what TimeCamp API expects
        if (params.user_ids) queryParams.user_ids = params.user_ids
        if (params.task_ids) queryParams.task_ids = params.task_ids
        queryParams.from = params.date_from
        queryParams.to = params.date_to
        
        // Always include tags in the response
        queryParams.opt_fields = 'tags'
        
        const response = await this.makeRequest<any>('GET', 'entries', { params: queryParams })
        
        // TimeCamp API returns time entries as an array when format=json
        const entries: TimeCampTimeEntry[] = []
        
        if (Array.isArray(response)) {
          for (const entry of response) {
            if (entry && typeof entry === 'object') {
              entries.push({
                id: parseInt(entry.id),
                duration: parseInt(entry.duration) || 0,
                user_id: String(entry.user_id || ''),
                user_name: String(entry.user_name || ''),
                task_id: parseInt(entry.task_id) || 0,
                task_note: entry.task_note || undefined,
                last_modify: String(entry.last_modify || ''),
                date: String(entry.date || ''),
                start_time: String(entry.start_time || ''),
                end_time: String(entry.end_time || ''),
                locked: String(entry.locked || '0'),
                name: String(entry.name || ''),
                addons_external_id: String(entry.addons_external_id || ''),
                billable: parseInt(entry.billable) || 0,
                invoiceId: String(entry.invoiceId || '0'),
                color: String(entry.color || ''),
                description: String(entry.description || ''),
                tags: Array.isArray(entry.tags) ? entry.tags.map((tag: any) => ({
                  tagListName: String(tag.tagListName || ''),
                  tagListId: String(tag.tagListId || ''),
                  tagId: String(tag.tagId || ''),
                  name: String(tag.name || ''),
                  mandatory: String(tag.mandatory || '0')
                })) : [],
                hasEntryLocationHistory: Boolean(entry.hasEntryLocationHistory)
              })
            }
          }
        }
        
        return entries
      },

      create: async (entry: TimeCampCreateTimeEntryRequest): Promise<TimeCampCreateTimeEntryResponse> => {
        try {
          // Build the request body, only including task_id if it's provided
          const requestBody: any = {
            date: entry.date,
            duration: entry.duration, // in seconds
            description: entry.description || '',
            start_time: entry.start_time,
            end_time: entry.end_time,
            service: 'timecamp-jwt-plugin'
          };
          
          // Only include task_id if it's provided and not null/undefined
          if (entry.task_id) {
            requestBody.task_id = entry.task_id;
          }
          
          const response = await this.makeRequest<any>('POST', 'entries', { 
            json: requestBody
          })
          
          return {
            success: true,
            id: response.entry_id || response.id,
            message: 'Time entry created successfully'
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create time entry'
          }
        }
      },

      update: async (id: number, entry: Partial<TimeCampCreateTimeEntryRequest>): Promise<TimeCampCreateTimeEntryResponse> => {
        try {
          // Only include fields that are actually provided (not undefined)
          const updateData: any = {
            id: id.toString()
          }
          
          if (entry.date !== undefined) updateData.date = entry.date
          if (entry.duration !== undefined) updateData.duration = entry.duration
          if (entry.task_id !== undefined) updateData.task_id = entry.task_id
          if (entry.description !== undefined) updateData.description = entry.description
          if (entry.start_time !== undefined) updateData.start_time = entry.start_time
          if (entry.end_time !== undefined) updateData.end_time = entry.end_time
          
          const response = await this.makeRequest<any>('PUT', 'entries', { 
            json: updateData
          })
          
          return {
            success: true,
            id: response.entry_id || response.id,
            message: 'Time entry updated successfully'
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update time entry'
          }
        }
      },

      delete: async (id: number): Promise<{ success: boolean; message: string }> => {
        try {
          await this.makeRequest<any>('DELETE', 'entries', {
            json: { id: id.toString() }
          })
          
          return {
            success: true,
            message: 'Time entry deleted successfully'
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete time entry'
          }
        }
      }
    };
  }
}