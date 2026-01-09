import { BaseResource } from './BaseResource';
import {
  TimeCampGroup,
  TimeCampCreateGroupRequest,
  TimeCampUpdateGroupRequest,
  TimeCampGroupsResponse,
} from '../types';

/**
 * Resource for groups management
 */
export class GroupsResource extends BaseResource {
  /**
   * Get all groups
   */
  async getAll(): Promise<TimeCampGroupsResponse[]> {
    const response = await this.makeRequest<any[]>('GET', 'group');

    return response.map((group: any) => ({
      group_id: typeof group.group_id === 'string' ? parseInt(group.group_id, 10) : group.group_id,
      name: group.name,
      parent_id:
        typeof group.parent_id === 'string' ? parseInt(group.parent_id, 10) : group.parent_id,
    }));
  }

  /**
   * Create a new group
   */
  async create(params: TimeCampCreateGroupRequest): Promise<TimeCampGroup> {
    if (!params.name) {
      throw new Error('Group name is required');
    }

    const requestBody: Record<string, any> = { name: params.name };

    if (params.parent_id !== undefined) {
      requestBody.parent_id = params.parent_id;
    }

    const response = await this.makeRequest<any>('PUT', 'group', { json: requestBody });

    return {
      group_id:
        typeof response.group_id === 'string'
          ? parseInt(response.group_id, 10)
          : response.group_id,
      name: response.name,
      parent_id:
        typeof response.parent_id === 'string'
          ? parseInt(response.parent_id, 10)
          : response.parent_id,
      admin_id:
        response.admin_id !== undefined
          ? typeof response.admin_id === 'string'
            ? parseInt(response.admin_id, 10)
            : response.admin_id
          : undefined,
      root_group_id:
        response.root_group_id !== undefined
          ? typeof response.root_group_id === 'string'
            ? parseInt(response.root_group_id, 10)
            : response.root_group_id
          : undefined,
    };
  }

  /**
   * Update an existing group
   */
  async update(params: TimeCampUpdateGroupRequest): Promise<void> {
    if (!params.group_id) {
      throw new Error('Group ID is required');
    }

    const requestBody: Record<string, any> = { group_id: params.group_id };

    if (params.name !== undefined) requestBody.name = params.name;
    if (params.parent_id !== undefined) requestBody.parent_id = String(params.parent_id);

    await this.makeRequest<void>('POST', 'group', { json: requestBody });
  }

  /**
   * Delete a group
   */
  async delete(groupId: number): Promise<void> {
    await this.makeRequest<void>('DELETE', 'group', {
      json: { group_id: groupId },
    });
  }
}
