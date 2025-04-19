type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  data?: unknown;
}

/**
 * ApiClient automatically fetch with access token and resolve backend url
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not defined');
    }
    this.baseUrl = baseUrl;
  }

  private getHeaders(data?: unknown): HeadersInit {
    const headers: HeadersInit = {};

    const token = localStorage.getItem('access-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type if not sending FormData
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    if (!endpoint.startsWith('/')) {
      throw new Error('Endpoint must start with "/"');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  private async request<T>(method: HttpMethod, endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, data, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers = this.getHeaders(data);

    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, data });
  }

  put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, data });
  }

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }

  patch<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, data });
  }
}

export const apiClient = new ApiClient();
