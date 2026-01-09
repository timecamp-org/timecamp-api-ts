import { BaseResource } from './BaseResource';
import { TimeCampUser } from '../types';

/**
 * Resource for current user operations
 */
export class UserResource extends BaseResource {
  /**
   * Get current authenticated user info
   */
  async get(): Promise<TimeCampUser> {
    return this.makeRequest<TimeCampUser>('GET', 'me');
  }
}
