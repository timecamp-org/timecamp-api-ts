import { BaseResource } from './BaseResource';
import {
  TimerStartRequest,
  TimerStopRequest,
  TimerActionRequest,
  TimerStatusResponse,
  TimerStartResponse,
  TimerStopResponse,
} from '../types';
import { formatTimeCampDate } from '../utils';

/**
 * Resource for timer operations
 */
export class TimerResource extends BaseResource {
  /**
   * Start a timer
   */
  async start(data?: TimerStartRequest): Promise<TimerStartResponse> {
    const payload: TimerActionRequest = {
      action: 'start',
      task_id: data?.task_id,
      started_at: data?.started_at || formatTimeCampDate(),
      service: this.getClientName(),
    };
    return this.makeRequest<TimerStartResponse>('POST', 'timer', { json: payload });
  }

  /**
   * Stop the running timer
   */
  async stop(data?: TimerStopRequest): Promise<TimerStopResponse> {
    const payload: TimerActionRequest = {
      action: 'stop',
      stopped_at: data?.stopped_at || formatTimeCampDate(),
      service: this.getClientName(),
    };
    return this.makeRequest<TimerStopResponse>('POST', 'timer', { json: payload });
  }

  /**
   * Get current timer status
   */
  async status(): Promise<TimerStatusResponse> {
    const payload: TimerActionRequest = {
      action: 'status',
      service: this.getClientName(),
    };
    return this.makeRequest<TimerStatusResponse>('POST', 'timer', { json: payload });
  }
}
