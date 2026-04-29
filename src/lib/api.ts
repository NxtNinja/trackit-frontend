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
      throw error; // Let the caller handle cancellation if needed
    }
    
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
    
    // Only show toast if not a cancellation
    toast.error(errorMessage);
    
    throw error.response?.data || error;
  }
};

export default apiClient;
