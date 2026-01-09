import { BaseResource, ResourceCustomFieldsAPI } from './BaseResource';
import { UserResource } from './UserResource';
import { HttpClient } from '../client';
import {
  TimeCampUsersMapResponse,
  TimeCampUserInviteRequest,
  TimeCampUserInviteResponse,
  TimeCampCustomFieldValuesResponse,
} from '../types';

/**
 * Resource for users management
 */
export class UsersResource extends BaseResource {
  private userResource: UserResource;

  constructor(httpClient: HttpClient, userResource: UserResource) {
    super(httpClient);
    this.userResource = userResource;
  }

  /**
   * Get all users in the workspace
   */
  async getAll(): Promise<TimeCampUsersMapResponse> {
    return this.makeRequest<TimeCampUsersMapResponse>('GET', 'users');
  }

  /**
   * Get all users with their custom field values
   */
  async getAllWithCustomFields(): Promise<any[]> {
    const usersResponse: any = await this.makeRequest<any>('GET', 'users');
    const usersArray: any[] = Array.isArray(usersResponse)
      ? usersResponse
      : Object.values(usersResponse || {});

    const enriched = await Promise.all(
      usersArray.map(async (user: any) => {
        const numericId =
          typeof user?.id === 'number'
            ? user.id
            : parseInt(user?.user_id ?? user?.userId ?? user?.userID ?? user?.uid ?? '0', 10);
        const id =
          Number.isFinite(numericId) && numericId > 0 ? numericId : parseInt(String(user?.id ?? 0), 10);

        const endpoint = this.buildV3Endpoint(`custom-fields/values/resource/${id}/type/user`);
        const values = await this.makeRequest<TimeCampCustomFieldValuesResponse>('GET', endpoint);
        return { ...user, id, customFields: values.data };
      })
    );

    return enriched;
  }

  /**
   * Get custom fields API for a specific user
   */
  byId(id: number): ResourceCustomFieldsAPI {
    return this.createResourceCustomFieldsAPI('user', id);
  }

  /**
   * Invite a user to the workspace
   */
  async invite(params: TimeCampUserInviteRequest): Promise<TimeCampUserInviteResponse> {
    const { email, name, group_id } = params;

    // If group_id is not provided, fetch it from current user
    let targetGroupId = group_id;
    if (!targetGroupId) {
      const currentUser = await this.userResource.get();
      targetGroupId = parseInt(currentUser.root_group_id, 10);
    }

    // Prepare the request data according to TimeCamp API format
    const data = {
      email: [email],
      tt_global_admin: '0',
      tt_can_create_level_1_tasks: '0',
      can_view_rates: '0',
      add_to_all_projects: '0',
      send_email: '0',
      force_change_pass: '0',
    };

    const inviteResponse = await this.makeRequest<TimeCampUserInviteResponse>(
      'POST',
      `group/${targetGroupId}/user`,
      {
        json: data,
        retryOn429: true,
        maxRetries: 3,
        retryDelay: 5000,
      }
    );

    // If name is provided and invite was successful, update the user's display name
    if (name && inviteResponse.statuses[email]?.status) {
      try {
        let userId: string | undefined;
        const maxAttempts = 10;
        const retryDelay = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }

          const usersMap = await this.getAll();

          for (const key in usersMap) {
            const user = usersMap[key];
            if (user.email === email) {
              userId = user.user_id || user.id;
              break;
            }
          }

          if (userId) {
            break;
          }
        }

        if (userId) {
          await this.makeRequest('POST', 'user', {
            formData: {
              display_name: name,
              user_id: userId,
            },
            retryOn429: true,
            maxRetries: 3,
            retryDelay: 5000,
          });

          inviteResponse.user_id = userId;
        }
      } catch {
        // Silent fail to not break the invite flow
      }
    }

    return inviteResponse;
  }
}
