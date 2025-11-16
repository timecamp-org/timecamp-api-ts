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
  TimeCampTasksResponse,
  TasksAPIResponse,
  TimeCampTimeEntry,
  TimeCampTimeEntriesRequest,
  TimeCampCreateTimeEntryRequest,
  TimeCampCreateTimeEntryResponse,
  GetActiveUserTasksOptions,
  TimeCampTask,
  TimeCampCustomFieldTemplatesResponse,
  TimeCampCustomFieldAssignmentResponse,
  TimeCampCustomFieldValuesResponse,
  TimeCampCustomFieldResourceType,
  TimeCampUsersMapResponse,
  TimeCampTaskFavoritesResponse,
  TimeCampTaskFavoriteMutationResponse
} from './types';
import { prepareTasksArray } from './taskFilters';

export class TimeCampAPI {
  private client: AxiosInstance;
  private apiKey: string;
  private clientName: string;

  constructor(apiKey: string, config?: TimeCampAPIConfig) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.clientName = config?.clientName || 'npm-timecamp-api';
    
    this.client = axios.create({
      baseURL: config?.baseURL || 'https://app.timecamp.com/third_party/api',
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': this.clientName,
        'X-Client-Name': this.clientName,
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

  private async resolveUserParam(user?: string): Promise<{ isCurrentUser: boolean; targetUserId?: string }> {
    const requestedUser = user ?? 'me';

    if (requestedUser === 'me') {
      return { isCurrentUser: true };
    }

    if (!/^\d+$/.test(requestedUser)) {
      return { isCurrentUser: false, targetUserId: requestedUser };
    }

    const currentUser = await this.user.get();

    if (currentUser.user_id === requestedUser) {
      return { isCurrentUser: true, targetUserId: currentUser.user_id };
    }

    return { isCurrentUser: false, targetUserId: requestedUser };
  }

  private buildTasksRequestParams(isCurrentUser: boolean): Record<string, string> {
    const params: Record<string, string> = {};

    if (isCurrentUser) {
      params.ignoreAdminRights = '1';
    }

    return params;
  }

  private buildV3Endpoint(path: string): string {
    // v3 endpoints live under /v3 on the same host; default baseURL is /third_party/api
    // We assume appending /v3 to the third_party base is acceptable in this environment
    return `v3/${path.replace(/^\//, '')}`;
  }

  private resourceCustomFields(resourceType: TimeCampCustomFieldResourceType, resourceId: number) {
    return {
      getAllCustomFields: async (): Promise<TimeCampCustomFieldValuesResponse> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/values/resource/${resourceId}/type/${resourceType}`);
        return this.makeRequest<TimeCampCustomFieldValuesResponse>('GET', endpoint);
      },

      getCustomField: async (customFieldId: number): Promise<TimeCampCustomFieldAssignmentResponse> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/value/${resourceId}`);
        return this.makeRequest<TimeCampCustomFieldAssignmentResponse>('GET', endpoint);
      },

      setCustomField: async (customFieldId: number, value: string): Promise<TimeCampCustomFieldAssignmentResponse> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/assign/${resourceId}`);
        return this.makeRequest<TimeCampCustomFieldAssignmentResponse>('POST', endpoint, { json: { value } });
      },

      updateCustomField: async (customFieldId: number, value: string): Promise<TimeCampCustomFieldAssignmentResponse> => {
        // Assign again to update value
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/assign/${resourceId}`);
        return this.makeRequest<TimeCampCustomFieldAssignmentResponse>('POST', endpoint, { json: { value } });
      },

      deleteCustomField: async (customFieldId: number): Promise<{ data: string }> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/unassign/${resourceId}`);
        return this.makeRequest<{ data: string }>('DELETE', endpoint);
      }
    };
  }

  public get timer() {
    return {
      start: async (data?: TimerStartRequest): Promise<any> => {
        try {
          const payload: TimerActionRequest = {
            action: 'start',
            task_id: data?.task_id,
            started_at: data?.started_at || this.formatTimeCampDate(),
            service: this.clientName
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
            stopped_at: data?.stopped_at || this.formatTimeCampDate(),
            service: this.clientName
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
            action: 'status',
            service: this.clientName
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

  public get customFields() {
    return {
      getAll: async (): Promise<TimeCampCustomFieldTemplatesResponse> => {
        const endpoint = this.buildV3Endpoint('custom-fields/template/list');
        return this.makeRequest<TimeCampCustomFieldTemplatesResponse>('GET', endpoint);
      },
      add: async (payload: { name: string; resourceType: TimeCampCustomFieldResourceType; fieldType: 'number' | 'string'; required?: boolean; status?: number; defaultValue?: string | null; fieldOptions?: Record<string, any>[] | null; }): Promise<{ data: any }> => {
        const endpoint = this.buildV3Endpoint('custom-fields/template/create');
        return this.makeRequest<{ data: any }>('POST', endpoint, { json: payload });
      },
      update: async (templateId: number, payload: { name?: string; required?: boolean; status?: number; defaultValue?: string | null; fieldOptions?: Record<string, any>[] | null; }): Promise<{ data: any }> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/template/${templateId}/modify`);
        return this.makeRequest<{ data: any }>('PUT', endpoint, { json: payload });
      },
      delete: async (templateId: number): Promise<{ data: string }> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/template/${templateId}/remove`);
        return this.makeRequest<{ data: string }>('DELETE', endpoint);
      }
    };
  }

  public get users() {
    const self = this;
    const api = {
      getAll: async (): Promise<TimeCampUsersMapResponse> => {
        // Legacy users listing endpoint under third_party
        return self.makeRequest<TimeCampUsersMapResponse>('GET', 'users');
      },
      getAllWithCustomFields: async (): Promise<any[]> => {
        const usersResponse: any = await self.makeRequest<any>('GET', 'users');
        const usersArray: any[] = Array.isArray(usersResponse)
          ? usersResponse
          : Object.values(usersResponse || {});

        const enriched = await Promise.all(
          usersArray.map(async (user: any) => {
            const numericId = typeof user?.id === 'number'
              ? user.id
              : parseInt(user?.user_id ?? user?.userId ?? user?.userID ?? user?.uid ?? '0', 10);
            const id = Number.isFinite(numericId) && numericId > 0 ? numericId : parseInt(String(user?.id ?? 0), 10);

            const endpoint = self.buildV3Endpoint(`custom-fields/values/resource/${id}/type/user`);
            const values = await self.makeRequest<TimeCampCustomFieldValuesResponse>('GET', endpoint);
            return { ...user, id, customFields: values.data };
          })
        );

        return enriched;
      },
      byId: (id: number) => self.resourceCustomFields('user', id)
    } as const;
    return api;
  }

  public get tasks() {
    return {
      byId: (id: number) => this.resourceCustomFields('task', id),
      getAll: async (): Promise<TasksAPIResponse> => {
        try {
          const response: AxiosResponse<TimeCampTasksResponse> = await this.client.get('/tasks', {
            params: {
              status: 'all'
            }
          });

          const tasksArray = Object.values(response.data).map((task: any) => {
            const { tags, ...taskWithoutTags } = task;
            return taskWithoutTags as TimeCampTask;
          });

          return {
            success: true,
            data: tasksArray,
            message: 'All tasks fetched successfully'
          };
        } catch (error) {
          console.error('Error fetching all tasks:', error);
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
      },

      getActiveUserTasks: async (options: GetActiveUserTasksOptions = {}): Promise<TasksAPIResponse> => {
        try {
          const { includeFullBreadcrumb = true } = options;
          const { isCurrentUser, targetUserId } = await this.resolveUserParam(options.user);

          const params = this.buildTasksRequestParams(isCurrentUser);

          // Make API request with ignoreAdminRights parameter
          const response: AxiosResponse<TimeCampTasksResponse> = await this.client.get('/tasks', {
            params
          });

          const tasksArray = prepareTasksArray(response.data, {
            includeFullBreadcrumb,
            isCurrentUser,
            targetUserId
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
      },

      getFavorites: async (): Promise<TimeCampTaskFavoritesResponse> => {
        const endpoint = this.buildV3Endpoint('taskPicker/favourites');
        return this.makeRequest<TimeCampTaskFavoritesResponse>('GET', endpoint);
      },

      addFavorite: async (taskId: number): Promise<TimeCampTaskFavoriteMutationResponse> => {
        const endpoint = this.buildV3Endpoint(`taskPicker/favourites/add/${taskId}`);
        return this.makeRequest<TimeCampTaskFavoriteMutationResponse>('POST', endpoint);
      },

      removeFavorite: async (taskId: number): Promise<TimeCampTaskFavoriteMutationResponse> => {
        const endpoint = this.buildV3Endpoint(`taskPicker/favourites/delete/${taskId}`);
        return this.makeRequest<TimeCampTaskFavoriteMutationResponse>('DELETE', endpoint);
      }
    };
  }

  public get timeEntries() {
    return {
      byId: (id: number) => this.resourceCustomFields('entry', id),
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
            service: this.clientName
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
            id: id.toString(),
            service: this.clientName
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
            json: { id: id.toString(), service: this.clientName }
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