import { TimeCampAPIConfig } from '../types';

export interface MakeRequestOptions {
  params?: Record<string, string>;
  json?: any;
  formData?: Record<string, string>;
  retryOn429?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export class TimeCampAPIError extends Error {
  public status: number;
  public responseData: any;

  constructor(status: number, responseData: any) {
    const message = `TimeCamp API error: ${status} - ${JSON.stringify(responseData)}`;
    super(message);
    this.name = 'TimeCampAPIError';
    this.status = status;
    this.responseData = responseData;
  }
}

export class HttpClient {
  private config: HttpClientConfig;
  private clientName: string;

  constructor(apiKey: string, config?: TimeCampAPIConfig) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.clientName = config?.clientName || 'npm-timecamp-api';

    this.config = {
      baseURL: config?.baseURL || 'https://app.timecamp.com/third_party/api',
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': this.clientName,
        'X-Client-Name': this.clientName,
        Authorization: `Bearer ${apiKey}`,
      },
    };
  }

  getClientName(): string {
    return this.clientName;
  }

  getBaseURL(): string {
    return this.config.baseURL;
  }

  getDefaultHeaders(): Record<string, string> {
    return { ...this.config.headers };
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.config.baseURL}/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options: MakeRequestOptions = {}
  ): Promise<T> {
    const maxRetries = options.retryOn429 ? (options.maxRetries ?? 3) : 0;
    const retryDelay = options.retryDelay ?? 5000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const headers: Record<string, string> = { ...this.config.headers };
        let body: string | undefined;

        // Handle different body types
        if (options.json) {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(options.json);
        } else if (options.formData) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          body = new URLSearchParams(options.formData).toString();
        }

        // Build params - for GET requests, add format=json by default
        const params = { ...options.params };
        if (method === 'GET' && !params.format) {
          params.format = 'json';
        }

        const url = this.buildURL(endpoint, Object.keys(params).length > 0 ? params : undefined);

        const response = await this.fetchWithTimeout(url, {
          method,
          headers,
          body,
        });

        // Parse response
        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
          const error = new TimeCampAPIError(response.status, responseData);

          // Retry on 429
          if (response.status === 429 && attempt < maxRetries) {
            lastError = error;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }

          throw error;
        }

        return responseData as T;
      } catch (error) {
        if (error instanceof TimeCampAPIError) {
          throw error;
        }

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Convenience method for GET requests
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, { params });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, { json: data });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, { json: data });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, { json: data });
  }

  /**
   * Builds endpoint path for v3 API
   */
  buildV3Endpoint(path: string): string {
    return `v3/${path.replace(/^\//, '')}`;
  }
}
