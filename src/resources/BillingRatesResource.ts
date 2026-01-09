import { BaseResource } from './BaseResource';
import {
  TimeCampBillingRate,
  TimeCampSetRateRequest,
  TimeCampBillingRatesResponse,
} from '../types';

/**
 * Resource for billing rates management
 */
export class BillingRatesResource extends BaseResource {
  /**
   * Get billing rates for a task
   */
  async getTaskRates(taskId: number, rateTypeId?: string): Promise<TimeCampBillingRatesResponse> {
    const params: Record<string, string> = {};
    if (rateTypeId !== undefined) params.rate_id = rateTypeId;

    return this.makeRequest<TimeCampBillingRatesResponse>('GET', `task/${taskId}/rate`, {
      params,
    });
  }

  /**
   * Set or update billing rate for a task
   */
  async setTaskRate(taskId: number, data: TimeCampSetRateRequest): Promise<TimeCampBillingRate> {
    const requestBody: Record<string, any> = {
      rateTypeId: data.rateTypeId,
      value: data.value,
    };

    if (data.addDate !== undefined) requestBody.addDate = data.addDate;

    return this.makeRequest<TimeCampBillingRate>('POST', `task/${taskId}/rate`, {
      json: requestBody,
    });
  }

  /**
   * Get billing rates for a user
   */
  async getUserRates(userId: number, rateTypeId?: string): Promise<TimeCampBillingRatesResponse> {
    const params: Record<string, string> = {};
    if (rateTypeId !== undefined) params.rate_id = rateTypeId;

    return this.makeRequest<TimeCampBillingRatesResponse>('GET', `user/${userId}/rate`, {
      params,
    });
  }

  /**
   * Set or update billing rate for a user
   */
  async setUserRate(userId: number, data: TimeCampSetRateRequest): Promise<TimeCampBillingRate> {
    const requestBody: Record<string, any> = {
      rateTypeId: data.rateTypeId,
      value: data.value,
    };

    if (data.addDate !== undefined) requestBody.addDate = data.addDate;

    return this.makeRequest<TimeCampBillingRate>('POST', `user/${userId}/rate`, {
      json: requestBody,
    });
  }

  /**
   * Get billing rates for a task-user combination
   */
  async getTaskUserRates(
    taskId: number,
    userId: number,
    rateTypeId?: string
  ): Promise<TimeCampBillingRatesResponse> {
    const params: Record<string, string> = {};
    if (rateTypeId !== undefined) params.rate_id = rateTypeId;

    return this.makeRequest<TimeCampBillingRatesResponse>(
      'GET',
      `task/${taskId}/user/${userId}/rate`,
      { params }
    );
  }

  /**
   * Set or update billing rate for a task-user combination
   */
  async setTaskUserRate(
    taskId: number,
    userId: number,
    data: TimeCampSetRateRequest
  ): Promise<TimeCampBillingRate> {
    const requestBody: Record<string, any> = {
      rateTypeId: data.rateTypeId,
      value: data.value,
    };

    if (data.addDate !== undefined) requestBody.addDate = data.addDate;

    return this.makeRequest<TimeCampBillingRate>('POST', `task/${taskId}/user/${userId}/rate`, {
      json: requestBody,
    });
  }

  /**
   * Get billing rates for a group
   */
  async getGroupRates(
    groupId: number,
    rateTypeId?: string
  ): Promise<TimeCampBillingRatesResponse> {
    const params: Record<string, string> = {};
    if (rateTypeId !== undefined) params.rate_id = rateTypeId;

    return this.makeRequest<TimeCampBillingRatesResponse>('GET', `group/${groupId}/rate`, {
      params,
    });
  }

  /**
   * Set or update billing rate for a group
   */
  async setGroupRate(
    groupId: number,
    data: TimeCampSetRateRequest
  ): Promise<TimeCampBillingRate> {
    const requestBody: Record<string, any> = {
      rateTypeId: data.rateTypeId,
      value: data.value,
    };

    if (data.addDate !== undefined) requestBody.addDate = data.addDate;

    return this.makeRequest<TimeCampBillingRate>('POST', `group/${groupId}/rate`, {
      json: requestBody,
    });
  }
}
