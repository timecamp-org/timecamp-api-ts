import { BaseResource } from './BaseResource';
import {
  TimeCampCustomFieldResourceType,
  TimeCampCustomFieldTemplatesResponse,
} from '../types';

export interface CreateCustomFieldPayload {
  name: string;
  resourceType: TimeCampCustomFieldResourceType;
  fieldType: 'number' | 'string';
  required?: boolean;
  status?: number;
  defaultValue?: string | null;
  fieldOptions?: Record<string, any>[] | null;
}

export interface UpdateCustomFieldPayload {
  name?: string;
  required?: boolean;
  status?: number;
  defaultValue?: string | null;
  fieldOptions?: Record<string, any>[] | null;
}

/**
 * Resource for custom field template management
 */
export class CustomFieldsResource extends BaseResource {
  /**
   * Get all custom field templates
   */
  async getAll(): Promise<TimeCampCustomFieldTemplatesResponse> {
    const endpoint = this.buildV3Endpoint('custom-fields/template/list');
    return this.makeRequest<TimeCampCustomFieldTemplatesResponse>('GET', endpoint);
  }

  /**
   * Create a new custom field template
   */
  async add(payload: CreateCustomFieldPayload): Promise<{ data: any }> {
    const endpoint = this.buildV3Endpoint('custom-fields/template/create');
    return this.makeRequest<{ data: any }>('POST', endpoint, { json: payload });
  }

  /**
   * Update an existing custom field template
   */
  async update(templateId: number, payload: UpdateCustomFieldPayload): Promise<{ data: any }> {
    const endpoint = this.buildV3Endpoint(`custom-fields/template/${templateId}/modify`);
    return this.makeRequest<{ data: any }>('PUT', endpoint, { json: payload });
  }

  /**
   * Delete a custom field template
   */
  async delete(templateId: number): Promise<{ data: string }> {
    const endpoint = this.buildV3Endpoint(`custom-fields/template/${templateId}/remove`);
    return this.makeRequest<{ data: string }>('DELETE', endpoint);
  }
}
