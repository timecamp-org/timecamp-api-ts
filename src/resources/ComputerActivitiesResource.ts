import { BaseResource } from './BaseResource';
import { UserResource } from './UserResource';
import { HttpClient } from '../client';
import {
  TimeCampComputerActivitiesRequest,
  TimeCampComputerActivity,
  TimeCampApplication,
} from '../types';

const MAX_DATE_RANGE_DAYS = 7;

/**
 * Resource for computer activities tracking
 */
export class ComputerActivitiesResource extends BaseResource {
  private userResource: UserResource;

  constructor(httpClient: HttpClient, userResource: UserResource) {
    super(httpClient);
    this.userResource = userResource;
  }

  /**
   * Get computer activities for a date range with application names resolved.
   *
   * Max 7 days per request. User IDs default to 'me' (current user).
   * Multiple users are handled with separate API calls combined into one result.
   */
  async get(params: TimeCampComputerActivitiesRequest): Promise<TimeCampComputerActivity[]> {
    const dates = this.buildDateList(params.date_from, params.date_to);
    const dateSet = new Set(dates);

    if (dates.length > MAX_DATE_RANGE_DAYS) {
      throw new Error(
        `Date range exceeds maximum of ${MAX_DATE_RANGE_DAYS} days (got ${dates.length} days). ` +
          `Please use a shorter range.`
      );
    }

    const userIds = await this.resolveUserIds(params.user_ids);
    const activities = await this.fetchActivities(dates, userIds);
    const filtered = activities.filter((a) => dateSet.has(a.end_date));
    return this.enrichWithApplicationNames(filtered);
  }

  private buildDateList(from: string, to: string): string[] {
    const dates: string[] = [];
    const current = new Date(from + 'T12:00:00');
    const end = new Date(to + 'T12:00:00');

    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private async resolveUserIds(userIds?: string): Promise<string[]> {
    if (!userIds || userIds === 'me') {
      const currentUser = await this.userResource.get();
      return [currentUser.user_id];
    }
    return userIds.split(',').map((id) => id.trim());
  }

  private async fetchActivities(
    dates: string[],
    userIds: string[]
  ): Promise<TimeCampComputerActivity[]> {
    const allActivities: TimeCampComputerActivity[] = [];

    for (const userId of userIds) {
      const params: Record<string, string> = {};

      for (let i = 0; i < dates.length; i++) {
        params[`dates[${i}]`] = dates[i];
      }
      params['user_id'] = userId;

      const response = await this.makeRequest<any[]>('GET', 'activity', { params });

      if (Array.isArray(response)) {
        for (const item of response) {
          allActivities.push({
            ...item,
            user_id: String(item.user_id || ''),
            application_id: String(item.application_id || ''),
            end_time: String(item.end_time || ''),
            time_span: parseInt(item.time_span) || 0,
            window_title_id: String(item.window_title_id || ''),
            end_date: String(item.end_date || ''),
            task_id: String(item.task_id || ''),
            entry_id: String(item.entry_id || ''),
            updated_at: String(item.updated_at || ''),
            update_date: String(item.update_date || ''),
          });
        }
      }
    }

    return allActivities;
  }

  private async enrichWithApplicationNames(
    activities: TimeCampComputerActivity[]
  ): Promise<TimeCampComputerActivity[]> {
    const applicationIds = [
      ...new Set(
        activities
          .map((a) => String(a.application_id))
          .filter((id) => id && id !== '0' && id !== '')
      ),
    ];

    if (applicationIds.length === 0) {
      return activities;
    }

    const params: Record<string, string> = {
      application_ids: applicationIds.join(','),
    };

    const apps = await this.makeRequest<Record<string, TimeCampApplication>>(
      'GET',
      'application',
      { params }
    );

    const appMap = new Map<string, TimeCampApplication>();
    if (apps && typeof apps === 'object') {
      for (const [id, app] of Object.entries(apps)) {
        appMap.set(id, app);
      }
    }

    for (const activity of activities) {
      const app = appMap.get(String(activity.application_id));
      if (app) {
        activity.application_name = app.app_name || '';
        activity.application_info = app.aditional_info || '';
        activity.application_display_name = app.aditional_info || app.app_name || '';
      }
    }

    return activities;
  }
}
