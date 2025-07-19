import axios, { AxiosError, AxiosResponse } from 'axios';

// Base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response received from ${response.config.url}:`, response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types for API requests and responses
export interface PriceRequest {
  token: string;
  network: string;
  timestamp: string;
}

export interface PriceResponse {
  price: number;
  source: string;
  timestamp: string;
  token: string;
  network: string;
}

export interface ScheduleRequest {
  token: string;
  network: string;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  jobId: string;
  estimatedTime: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// API Functions
export const priceApi = {
  /**
   * Get token price for a specific timestamp
   */
  async getPrice(data: PriceRequest): Promise<PriceResponse> {
    try {
      const response = await apiClient.post<PriceResponse>('/price', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // Handle specific error cases
      if (axiosError.response?.status === 404) {
        throw new Error('Token or network not found');
      } else if (axiosError.response?.status === 400) {
        throw new Error('Invalid request parameters');
      } else if (axiosError.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }

      // Generic error handling
      const errorMessage = (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        'Failed to fetch price data';

      throw new Error(errorMessage);
    }
  },

  /**
   * Schedule a recurring price check job
   */
  async scheduleJob(data: ScheduleRequest): Promise<ScheduleResponse> {
    try {
      const response = await apiClient.post<ScheduleResponse>('/schedule', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // Handle specific error cases
      if (axiosError.response?.status === 409) {
        throw new Error('A job for this token and network already exists');
      } else if (axiosError.response?.status === 400) {
        throw new Error('Invalid scheduling parameters');
      } else if (axiosError.response?.status === 503) {
        throw new Error('Scheduling service is temporarily unavailable');
      }

      // Generic error handling
      const errorMessage = (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        'Failed to schedule job';

      throw new Error(errorMessage);
    }
  },

  /**
   * Get all scheduled jobs
   */
  async getScheduledJobs(): Promise<any> {
    try {
      const response = await apiClient.get('/schedule');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        'Failed to fetch scheduled jobs';
      throw new Error(errorMessage);
    }
  },
};

// Utility function for handling API errors consistently
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

// Export the axios instance for custom requests if needed
export { apiClient };
export default priceApi;
