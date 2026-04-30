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

    // If error is 401 and it's not a retry and not a login request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await apiClient.post('/auth/refresh');
        
        // Refresh success
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        processQueue(refreshError, null);
        
        // Only redirect if we're not already on the login page
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
