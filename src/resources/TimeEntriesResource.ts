import { BaseResource, ResourceCustomFieldsAPI } from './BaseResource';
import {
  TimeCampTimeEntry,
  TimeCampTimeEntriesRequest,
  TimeCampCreateTimeEntryRequest,
  TimeCampCreateTimeEntryResponse,
  TimeCampEntryTagsResponse,
} from '../types';

/**
 * Resource for time entries management
 */
export class TimeEntriesResource extends BaseResource {
  /**
   * Get custom fields API for a specific time entry
   */
  byId(id: number): ResourceCustomFieldsAPI {
    return this.createResourceCustomFieldsAPI('entry', id);
  }

  /**
   * Get time entries for a date range
   */
  async get(params: TimeCampTimeEntriesRequest): Promise<TimeCampTimeEntry[]> {
    const queryParams: Record<string, string> = {};

    if (params.user_ids) queryParams.user_ids = params.user_ids;
    if (params.task_ids) queryParams.task_ids = params.task_ids;
    queryParams.from = params.date_from;
    queryParams.to = params.date_to;
    queryParams.opt_fields = 'tags';

    const response = await this.makeRequest<any>('GET', 'entries', { params: queryParams });
    const entries: TimeCampTimeEntry[] = [];

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
            tags: Array.isArray(entry.tags)
              ? entry.tags.map((tag: any) => ({
                  tagListName: String(tag.tagListName || ''),
                  tagListId: String(tag.tagListId || ''),
                  tagId: String(tag.tagId || ''),
                  name: String(tag.name || ''),
                  mandatory: String(tag.mandatory || '0'),
                }))
              : [],
            hasEntryLocationHistory: Boolean(entry.hasEntryLocationHistory),
          });
        }
      }
    }

    return entries;
  }

  /**
   * Create a new time entry
   */
  async create(entry: TimeCampCreateTimeEntryRequest): Promise<TimeCampCreateTimeEntryResponse> {
    try {
      const requestBody: any = {
        date: entry.date,
        duration: entry.duration,
        description: entry.description || '',
        start_time: entry.start_time,
        end_time: entry.end_time,
        service: this.getClientName(),
      };

      if (entry.task_id) {
        requestBody.task_id = entry.task_id;
      }

      if (entry.user_id) {
        requestBody.user_id = entry.user_id;
      }

      if (entry.billable !== undefined) {
        requestBody.billable = entry.billable;
      }

      if (entry.tags !== undefined) {
        requestBody.tags = entry.tags;
      }

      const response = await this.makeRequest<any>('POST', 'entries', { json: requestBody });

      return {
        success: true,
        id: response.entry_id || response.id,
        message: 'Time entry created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create time entry',
      };
    }
  }

  /**
   * Update an existing time entry
   */
  async update(
    id: number,
    entry: Partial<TimeCampCreateTimeEntryRequest>
  ): Promise<TimeCampCreateTimeEntryResponse> {
    try {
      const updateData: any = {
        id: id.toString(),
        service: this.getClientName(),
      };

      if (entry.date !== undefined) updateData.date = entry.date;
      if (entry.duration !== undefined) updateData.duration = entry.duration;
      if (entry.task_id !== undefined) updateData.task_id = entry.task_id;
      if (entry.description !== undefined) updateData.description = entry.description;
      if (entry.start_time !== undefined) updateData.start_time = entry.start_time;
      if (entry.end_time !== undefined) updateData.end_time = entry.end_time;
      if (entry.billable !== undefined) updateData.billable = entry.billable;

      const response = await this.makeRequest<any>('PUT', 'entries', { json: updateData });

      return {
        success: true,
        id: response.entry_id || response.id,
        message: 'Time entry updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update time entry',
      };
    }
  }

  /**
   * Delete a time entry
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.makeRequest<any>('DELETE', 'entries', {
        json: { id: id.toString(), service: this.getClientName() },
      });

      return {
        success: true,
        message: 'Time entry deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete time entry',
      };
    }
  }

  /**
   * Get tags for time entries
   */
  async getTags(entryId: number): Promise<TimeCampEntryTagsResponse> {
    return this.makeRequest<TimeCampEntryTagsResponse>('GET', `entries/${entryId}/tags`);
  }

  /**
   * Add tags to time entry
   */
  async addTags(entryId: number, tagIds: number[]): Promise<string[]> {
    const tags = tagIds.join(',');
    return this.makeRequest<string[]>('PUT', `entries/${entryId}/tags`, {
      json: { tags },
    });
  }

  /**
   * Remove tags from time entry
   */
  async removeTags(entryId: number, tagIds: number[]): Promise<string[]> {
    const tags = tagIds.join(',');
    return this.makeRequest<string[]>('DELETE', `entries/${entryId}/tags`, {
      json: { tags },
    });
  }
}
