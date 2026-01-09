import { BaseResource } from './BaseResource';
import {
  TimeCampTagItem,
  TimeCampTagList,
  TimeCampTagListWithTags,
  TimeCampTagListsResponse,
  TimeCampCreateTagRequest,
  TimeCampUpdateTagRequest,
  TimeCampCreateTagListRequest,
  TimeCampUpdateTagListRequest,
  TimeCampGetTagListsOptions,
} from '../types';

/**
 * Resource for tags and tag lists management
 */
export class TagsResource extends BaseResource {
  /**
   * Get all tag lists
   */
  async getTagLists(options?: TimeCampGetTagListsOptions): Promise<TimeCampTagListsResponse> {
    const params: Record<string, string> = {};

    if (options?.task_id !== undefined) params.task_id = String(options.task_id);
    if (options?.archived !== undefined) params.archived = String(options.archived);
    if (options?.tags !== undefined) params.tags = String(options.tags);
    if (options?.exclude_empty_tag_lists !== undefined)
      params.exclude_empty_tag_lists = String(options.exclude_empty_tag_lists);
    if (options?.use_restrictions !== undefined)
      params.use_restrictions = String(options.use_restrictions);

    return this.makeRequest<TimeCampTagListsResponse>('GET', 'tag_list', { params });
  }

  /**
   * Get a specific tag list with its tags
   */
  async getTagList(tagListId: number): Promise<TimeCampTagListWithTags> {
    return this.makeRequest<TimeCampTagListWithTags>('GET', `tag_list/${tagListId}`);
  }

  /**
   * Create a new tag list
   */
  async createTagList(params: TimeCampCreateTagListRequest): Promise<number> {
    const response = await this.makeRequest<number>('POST', 'tag_list', {
      json: { name: params.name },
    });
    return response;
  }

  /**
   * Update a tag list
   */
  async updateTagList(
    tagListId: number,
    params: TimeCampUpdateTagListRequest
  ): Promise<{ message: string }> {
    const requestBody: Record<string, any> = {};

    if (params.name !== undefined) requestBody.name = params.name;
    if (params.archived !== undefined) requestBody.archived = params.archived;

    return this.makeRequest<{ message: string }>('PUT', `tag_list/${tagListId}`, {
      json: requestBody,
    });
  }

  /**
   * Get only tags of a tag list
   */
  async getTagListTags(tagListId: number): Promise<{ [tagId: string]: TimeCampTagItem }> {
    return this.makeRequest<{ [tagId: string]: TimeCampTagItem }>(
      'GET',
      `tag_list/${tagListId}/tags`
    );
  }

  /**
   * Create a new tag
   */
  async createTag(params: TimeCampCreateTagRequest): Promise<number> {
    const response = await this.makeRequest<number>('POST', 'tag', {
      json: {
        list: params.list,
        name: params.name,
      },
    });
    return response;
  }

  /**
   * Get tag data
   */
  async getTag(tagId: number): Promise<TimeCampTagItem> {
    return this.makeRequest<TimeCampTagItem>('GET', `tag/${tagId}`);
  }

  /**
   * Update a tag
   */
  async updateTag(
    tagId: number,
    params: TimeCampUpdateTagRequest
  ): Promise<{ message: string }> {
    const requestBody: Record<string, any> = {};

    if (params.name !== undefined) requestBody.name = params.name;
    if (params.archived !== undefined) requestBody.archived = params.archived;

    return this.makeRequest<{ message: string }>('PUT', `tag/${tagId}`, { json: requestBody });
  }
}
