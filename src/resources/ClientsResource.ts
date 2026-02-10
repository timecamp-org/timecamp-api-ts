import { BaseResource } from './BaseResource';
import {
  TimeCampClient,
  TimeCampClientsResponse,
  TimeCampCreateClientRequest,
  TimeCampUpdateClientRequest,
  TimeCampClientTasksResponse,
} from '../types';

export class ClientsResource extends BaseResource {
  /**
   * Get all clients for the current organization
   *
   * @example
   * ```typescript
   * const clients = await api.clients.getAll();
   * // Returns Record<string, TimeCampClient> keyed by clientId
   * ```
   */
  async getAll(): Promise<TimeCampClientsResponse> {
    return this.makeRequest<TimeCampClientsResponse>('GET', 'client');
  }

  /**
   * Create a new client
   *
   * @example
   * ```typescript
   * const client = await api.clients.create({
   *   organizationName: 'Acme Corp',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   email: 'john@acme.com',
   *   address: '123 Main St',
   *   currencyId: 1,
   * });
   * ```
   */
  async create(request: TimeCampCreateClientRequest): Promise<TimeCampClient> {
    return this.makeRequest<TimeCampClient>('PUT', 'client', {
      formData: toFormData({ ...request, clientId: -1 }),
    });
  }

  /**
   * Update an existing client
   *
   * @example
   * ```typescript
   * const client = await api.clients.update({
   *   clientId: 1412133,
   *   organizationName: 'Acme Corp Updated',
   * });
   * ```
   */
  async update(request: TimeCampUpdateClientRequest): Promise<TimeCampClient> {
    return this.makeRequest<TimeCampClient>('POST', 'client', {
      formData: toFormData(request),
    });
  }

  /**
   * Delete a client by ID.
   * Will fail if the client has associated invoices.
   */
  async delete(clientId: number): Promise<void> {
    return this.makeRequest<void>('DELETE', 'client', {
      json: { clientId },
    });
  }

  /**
   * Get tasks assigned to one or more clients
   *
   * @param clientIds - Single client ID or array of client IDs
   *
   * @example
   * ```typescript
   * const tasks = await api.clients.getTasks(1412133);
   * // Returns { "1412133": [taskId1, taskId2, ...] }
   *
   * const multiTasks = await api.clients.getTasks([1412133, 1412134]);
   * ```
   */
  async getTasks(clientIds: number | number[]): Promise<TimeCampClientTasksResponse> {
    const ids = Array.isArray(clientIds) ? clientIds.join(',') : String(clientIds);
    return this.makeRequest<TimeCampClientTasksResponse>('GET', 'client/task', {
      params: { client_id: ids },
    });
  }

  /**
   * Remove tasks from a client
   *
   * @param clientId - Client ID to remove tasks from
   * @param taskIds - Single task ID or array of task IDs
   *
   * @example
   * ```typescript
   * await api.clients.removeTasks(1412133, [101, 102]);
   * ```
   */
  async removeTasks(clientId: number, taskIds: number | number[]): Promise<void> {
    const tasks = Array.isArray(taskIds) ? taskIds : [taskIds];
    return this.makeRequest<void>('DELETE', 'client/task', {
      params: { client_id: String(clientId) },
      json: { task_id: tasks },
    });
  }
}

/**
 * Converts an object to a flat Record<string, string> for form-urlencoded submission.
 */
function toFormData(data: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      result[key] = String(value);
    }
  }
  return result;
}
