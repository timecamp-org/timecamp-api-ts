import { BaseResource, ResourceCustomFieldsAPI } from './BaseResource';
import { UserResource } from './UserResource';
import { HttpClient } from '../client';
import {
  TimeCampTask,
  TimeCampTasksResponse,
  TasksAPIResponse,
  GetActiveUserTasksOptions,
  TimeCampTaskFavoritesResponse,
  TimeCampTaskFavoriteMutationResponse,
  TimeCampCreateTaskRequest,
  TimeCampCreateTaskResponse,
  TimeCampUpdateTaskRequest,
} from '../types';
import { prepareTasksArray } from '../taskFilters';

/**
 * Resource for tasks management
 */
export class TasksResource extends BaseResource {
  private userResource: UserResource;

  constructor(httpClient: HttpClient, userResource: UserResource) {
    super(httpClient);
    this.userResource = userResource;
  }

  /**
   * Get custom fields API for a specific task
   */
  byId(id: number): ResourceCustomFieldsAPI {
    return this.createResourceCustomFieldsAPI('task', id);
  }

  /**
   * Get all tasks (including archived)
   */
  async getAll(): Promise<TasksAPIResponse> {
    try {
      const response = await this.makeRequest<TimeCampTasksResponse>('GET', 'tasks', {
        params: { status: 'all' },
      });

      const tasksArray = Object.values(response).map((task: any) => {
        const { tags, ...taskWithoutTags } = task;
        return taskWithoutTags as TimeCampTask;
      });

      return {
        success: true,
        data: tasksArray,
        message: 'All tasks fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get active tasks for a user with filtering options
   */
  async getActiveUserTasks(options: GetActiveUserTasksOptions = {}): Promise<TasksAPIResponse> {
    try {
      const { includeFullBreadcrumb = true } = options;
      const { isCurrentUser, targetUserId } = await this.resolveUserParam(options.user);
      const params = this.buildTasksRequestParams(isCurrentUser);

      const response = await this.makeRequest<TimeCampTasksResponse>('GET', 'tasks', { params });

      const tasksArray = prepareTasksArray(response, {
        includeFullBreadcrumb,
        isCurrentUser,
        targetUserId,
      });

      return {
        success: true,
        data: tasksArray,
        message: 'Tasks fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new task
   */
  async add(params: TimeCampCreateTaskRequest): Promise<TimeCampCreateTaskResponse> {
    if (!params.name) {
      throw new Error('Task name is required');
    }

    const requestBody: Record<string, any> = { name: params.name };

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
        keywords: task.keywords,
      };
    }

    return normalizedResponse;
  }

  /**
   * Update an existing task
   */
  async update(params: TimeCampUpdateTaskRequest): Promise<TimeCampCreateTaskResponse> {
    if (!params.task_id) {
      throw new Error('Task ID is required');
    }

    const requestBody: Record<string, any> = { task_id: String(params.task_id) };

    if (params.name !== undefined) requestBody.name = params.name;
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

    const response = await this.makeRequest<any>('PUT', 'tasks', { json: requestBody });

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
        keywords: task.keywords,
      };
    }

    return normalizedResponse;
  }

  /**
   * Get favorite tasks
   */
  async getFavorites(): Promise<TimeCampTaskFavoritesResponse> {
    const endpoint = this.buildV3Endpoint('taskPicker/favourites');
    return this.makeRequest<TimeCampTaskFavoritesResponse>('GET', endpoint);
  }

  /**
   * Add a task to favorites
   */
  async addFavorite(taskId: number): Promise<TimeCampTaskFavoriteMutationResponse> {
    const endpoint = this.buildV3Endpoint(`taskPicker/favourites/add/${taskId}`);
    return this.makeRequest<TimeCampTaskFavoriteMutationResponse>('POST', endpoint);
  }

  /**
   * Remove a task from favorites
   */
  async removeFavorite(taskId: number): Promise<TimeCampTaskFavoriteMutationResponse> {
    const endpoint = this.buildV3Endpoint(`taskPicker/favourites/delete/${taskId}`);
    return this.makeRequest<TimeCampTaskFavoriteMutationResponse>('DELETE', endpoint);
  }

  private async resolveUserParam(
    user?: string
  ): Promise<{ isCurrentUser: boolean; targetUserId?: string }> {
    const requestedUser = user ?? 'me';

    if (requestedUser === 'me') {
      return { isCurrentUser: true };
    }

    if (!/^\d+$/.test(requestedUser)) {
      return { isCurrentUser: false, targetUserId: requestedUser };
    }

    const currentUser = await this.userResource.get();

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
}
