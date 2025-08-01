import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TimeCampUser, TimeCampAPIConfig, TimeCampAPIResponse } from './types';

export class TimeCampAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, config?: TimeCampAPIConfig) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: config?.baseURL || 'https://app.timecamp.com/third_party/api',
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TimeCampAPI/NPM',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    // Add request interceptor to include API key
    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params
      };
      return config;
    });
  }

  public get user() {
    return {
      get: async (): Promise<TimeCampUser> => {
        try {
          const response: AxiosResponse<TimeCampUser> = await this.client.get('/me');
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`TimeCamp API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
          }
          throw error;
        }
      }
    };
  }
}