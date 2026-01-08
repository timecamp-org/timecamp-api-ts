import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  TimeCampUser,
  TimeCampAPIConfig,
  TimeCampAPIResponse,
  TimerStartRequest,
  TimerStopRequest,
  TimerEntry,
  TimerActionRequest,
  TimerStatusResponse,
  TimerStartResponse,
  TimerStopResponse,
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
  TimeCampTaskFavoriteMutationResponse,
  TimeCampUserInviteRequest,
  TimeCampUserInviteResponse,
  TimeCampCreateTaskRequest,
  TimeCampCreateTaskResponse
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

  private async makeRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, options: { params?: Record<string, string>; json?: any; formData?: Record<string, string>; retryOn429?: boolean; maxRetries?: number; retryDelay?: number } = {}): Promise<T> {
    const maxRetries = options.retryOn429 ? (options.maxRetries ?? 3) : 0;
    const retryDelay = options.retryDelay ?? 5000; // 5 seconds default
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const config: any = {
          method,
          url: `${this.client.defaults.baseURL}/${endpoint}`,
          headers: { ...this.client.defaults.headers },
        };

        if (options.params) {
          config.params = options.params;
        }

        if (options.json) {
          config.data = options.json;
        }

        if (options.formData) {
          // Use application/x-www-form-urlencoded for form data
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          config.data = new URLSearchParams(options.formData).toString();
        }

        // For GET requests with JSON format, ensure we get JSON response
        if (method === 'GET' && !options.params?.format) {
          config.params = { ...config.params, format: 'json' };
        }

        const response: AxiosResponse<T> = await axios(config);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorMessage = `TimeCamp API error: ${status} - ${JSON.stringify(error.response?.data)}`;
          
          // If it's a 429 error and we have retries left, wait and retry
          if (status === 429 && attempt < maxRetries) {
            lastError = new Error(errorMessage);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          
          throw new Error(errorMessage);
        }
        throw error;
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Request failed after retries');
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
      start: async (data?: TimerStartRequest): Promise<TimerStartResponse> => {
        try {
          const payload: TimerActionRequest = {
            action: 'start',
            task_id: data?.task_id,
            started_at: data?.started_at || this.formatTimeCampDate(),
            service: this.clientName
          };
          const response: AxiosResponse<TimerStartResponse> = await this.client.post('/timer', payload);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      },

      stop: async (data?: TimerStopRequest): Promise<TimerStopResponse> => {
        try {
          const payload: TimerActionRequest = {
            action: 'stop',
            stopped_at: data?.stopped_at || this.formatTimeCampDate(),
            service: this.clientName
          };
          const response: AxiosResponse<TimerStopResponse> = await this.client.post('/timer', payload);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      },

      status: async (): Promise<TimerStatusResponse> => {
        try {
          const payload: TimerActionRequest = {
            action: 'status',
            service: this.clientName
          };
          const response: AxiosResponse<TimerStatusResponse> = await this.client.post('/timer', payload);
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
      byId: (id: number) => self.resourceCustomFields('user', id),
      invite: async (params: TimeCampUserInviteRequest): Promise<TimeCampUserInviteResponse> => {
        const { email, name, group_id } = params;
        
        // If group_id is not provided, fetch it from current user
        let targetGroupId = group_id;
        if (!targetGroupId) {
          const currentUser = await self.user.get();
          targetGroupId = parseInt(currentUser.root_group_id, 10);
        }
        
        // Prepare the request data according to TimeCamp API format
        const data = {
          email: [email],
          tt_global_admin: "0",
          tt_can_create_level_1_tasks: "0",
          can_view_rates: "0",
          add_to_all_projects: "0",
          send_email: "0",
          force_change_pass: "0"
        };
        
        const inviteResponse = await self.makeRequest<TimeCampUserInviteResponse>('POST', `group/${targetGroupId}/user`, { 
          json: data,
          retryOn429: true,
          maxRetries: 3,
          retryDelay: 5000
        });
        
        // If name is provided and invite was successful, update the user's display name
        if (name && inviteResponse.statuses[email]?.status) {
          try {
            // Fetch all users to get the user_id for the invited email
            // The user may not be immediately available, so retry up to 10 times with 2s delay
            let userId: string | undefined;
            const maxAttempts = 10;
            const retryDelay = 2000; // 2 seconds
            
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              if (attempt > 0) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
              }
              
              const usersMap = await api.getAll();
              
              // Find the user with matching email
              for (const key in usersMap) {
                const user = usersMap[key];
                if (user.email === email) {
                  userId = user.user_id || user.id;
                  break;
                }
              }
              
              if (userId) {
                break; // Found the user, exit retry loop
              }
            }
            
            if (userId) {
              // Update the display name using form-encoded POST
              await self.makeRequest('POST', 'user', {
                formData: {
                  display_name: name,
                  user_id: userId
                },
                retryOn429: true,
                maxRetries: 3,
                retryDelay: 5000
              });
              
              // Add user_id to response
              inviteResponse.user_id = userId;
            }
          } catch (error) {
            // If updating display name fails, we still return the successful invite response
            // Silent fail to not break the invite flow
          }
        }
        
        return inviteResponse;
      }
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

      add: async (params: TimeCampCreateTaskRequest): Promise<TimeCampCreateTaskResponse> => {
        // Validate required field
        if (!params.name) {
          throw new Error('Task name is required');
        }

        // Build request body with all optional parameters
        const requestBody: Record<string, any> = {
          name: params.name
        };

        // Add optional parameters if provided
        if (params.parent_id !== undefined) requestBody.parent_id = String(params.parent_id);
        if (params.external_task_id !== undefined) requestBody.external_task_id = params.external_task_id;
        if (params.external_parent_id !== undefined) requestBody.external_parent_id = params.external_parent_id;
        if (params.budgeted !== undefined) requestBody.budgeted = params.budgeted;
        if (params.note !== undefined) requestBody.note = params.note;
        if (params.archived !== undefined) requestBody.archived = params.archived;
        if (params.billable !== undefined) requestBody.billable = params.billable;
        if (params.budget_unit !== undefined) requestBody.budget_unit = params.budget_unit;
        if (params.user_ids !== undefined) requestBody.user_ids = params.user_ids;
        if (params.role !== undefined) requestBody.role = params.role;
        if (params.keywords !== undefined) requestBody.keywords = params.keywords;
        if (params.tags !== undefined) requestBody.tags = params.tags;

        const response = await this.makeRequest<any>('POST', 'tasks', { json: requestBody });
        
        // Convert string fields to numbers for better type safety
        const normalizedResponse: TimeCampCreateTaskResponse = {};
        for (const taskId in response) {
          const task = response[taskId];
          normalizedResponse[taskId] = {
            task_id: parseInt(task.task_id, 10),
            parent_id: parseInt(task.parent_id, 10),
            name: task.name,
            external_task_id: task.external_task_id,
            external_parent_id: task.external_parent_id,
            level: parseInt(task.level, 10),
            add_date: task.add_date,
            archived: parseInt(task.archived, 10),
            color: task.color,
            tags: task.tags,
            budgeted: parseInt(task.budgeted, 10),
            checked_date: task.checked_date,
            root_group_id: parseInt(task.root_group_id, 10),
            assigned_to: task.assigned_to ? parseInt(task.assigned_to, 10) : null,
            assigned_by: parseInt(task.assigned_by, 10),
            due_date: task.due_date,
            note: task.note,
            context: task.context,
            folder: task.folder,
            repeat: task.repeat,
            billable: parseInt(task.billable, 10),
            budget_unit: task.budget_unit,
            public_hash: task.public_hash,
            modify_time: task.modify_time,
            task_key: task.task_key,
            keywords: task.keywords
          };
        }
        
        return normalizedResponse;
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

          // Include user_id if provided
          if (entry.user_id) {
            requestBody.user_id = entry.user_id;
          }

          // Include billable if provided
          if (entry.billable !== undefined) {
            requestBody.billable = entry.billable;
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
          if (entry.billable !== undefined) updateData.billable = entry.billable
          
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