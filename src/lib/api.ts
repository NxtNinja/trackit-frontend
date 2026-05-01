import axios from 'axios';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor for Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url.includes('/auth/login') ||
      // Exclude the refresh endpoint itself to prevent an infinite recursive loop:
      // if /auth/refresh returns 401 (e.g. missing/expired refresh token cookie),
      // we must NOT attempt another refresh — just bail out and redirect to login.
      originalRequest.url.includes('/auth/refresh');

    // Only attempt a refresh for 401s on non-auth, non-retried requests
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {

      // If a refresh is already in flight, queue this request to retry after
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh endpoint sets new httpOnly cookies on success
        await apiClient.post('/auth/refresh');

        // Unblock all queued requests now that cookies have been updated
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear the queue and redirect to login
        processQueue(refreshError, null);

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiProxy = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  signal?: AbortSignal
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data,
      signal,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      throw error;
    }
    
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
    
    // Don't show toast for 401s that are being handled by the interceptor, 
    // unless it's a login attempt that failed
    const isLoginRequest = endpoint.includes('/auth/login');
    const isAuthError = error.response?.status === 401;

    if (!isAuthError || isLoginRequest) {
        toast.error(errorMessage);
    }
    
    throw error.response?.data || error;
  }
};

export default apiClient;
