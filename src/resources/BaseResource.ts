import { HttpClient, MakeRequestOptions } from '../client';
import {
  TimeCampCustomFieldResourceType,
  TimeCampCustomFieldAssignmentResponse,
  TimeCampCustomFieldValuesResponse,
} from '../types';

export interface ResourceCustomFieldsAPI {
  getAllCustomFields(): Promise<TimeCampCustomFieldValuesResponse>;
  getCustomField(customFieldId: number): Promise<TimeCampCustomFieldAssignmentResponse>;
  setCustomField(customFieldId: number, value: string): Promise<TimeCampCustomFieldAssignmentResponse>;
  updateCustomField(customFieldId: number, value: string): Promise<TimeCampCustomFieldAssignmentResponse>;
  deleteCustomField(customFieldId: number): Promise<{ data: string }>;
}

export abstract class BaseResource {
  protected httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  protected makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options?: MakeRequestOptions
  ): Promise<T> {
    return this.httpClient.makeRequest<T>(method, endpoint, options);
  }

  protected buildV3Endpoint(path: string): string {
    return this.httpClient.buildV3Endpoint(path);
  }

  protected getClientName(): string {
    return this.httpClient.getClientName();
  }

  /**
   * Creates custom fields API for a specific resource instance
   */
  protected createResourceCustomFieldsAPI(
    resourceType: TimeCampCustomFieldResourceType,
    resourceId: number
  ): ResourceCustomFieldsAPI {
    return {
      getAllCustomFields: async (): Promise<TimeCampCustomFieldValuesResponse> => {
        const endpoint = this.buildV3Endpoint(
          `custom-fields/values/resource/${resourceId}/type/${resourceType}`
        );
        return this.makeRequest<TimeCampCustomFieldValuesResponse>('GET', endpoint);
      },

      getCustomField: async (customFieldId: number): Promise<TimeCampCustomFieldAssignmentResponse> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/value/${resourceId}`);
        return this.makeRequest<TimeCampCustomFieldAssignmentResponse>('GET', endpoint);
      },

      setCustomField: async (
        customFieldId: number,
        value: string
      ): Promise<TimeCampCustomFieldAssignmentResponse> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/assign/${resourceId}`);
        return this.makeRequest<TimeCampCustomFieldAssignmentResponse>('POST', endpoint, {
          json: { value },
        });
      },

      updateCustomField: async (
        customFieldId: number,
        value: string
      ): Promise<TimeCampCustomFieldAssignmentResponse> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/assign/${resourceId}`);
        return this.makeRequest<TimeCampCustomFieldAssignmentResponse>('POST', endpoint, {
          json: { value },
        });
      },

      deleteCustomField: async (customFieldId: number): Promise<{ data: string }> => {
        const endpoint = this.buildV3Endpoint(`custom-fields/${customFieldId}/unassign/${resourceId}`);
        return this.makeRequest<{ data: string }>('DELETE', endpoint);
      },
    };
  }
}
