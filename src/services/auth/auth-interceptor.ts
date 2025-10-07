/**
 * Axios Auth Interceptor
 *
 * Automatically refreshes auth token when it expires (401 response).
 * This must be set up early in the app initialization.
 */

import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/services/api/auth-api';
import { authService } from './auth-service';
import { logger } from '@/utils/logger';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Setup axios interceptors for automatic token refresh
 */
export function setupAuthInterceptor(): void {
  // Response interceptor to handle 401 errors
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          logger.info('Token expired, attempting refresh');
          await authService.refreshToken();

          // Update authorization header with new token
          const newToken = authService.getCurrentToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }

          processQueue(null);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          logger.error('Token refresh failed in interceptor', {
            error: (refreshError as Error).message,
          });

          processQueue(refreshError as Error);

          // Logout user if refresh fails
          await authService.logout();

          // Redirect to login (if in browser environment)
          if (typeof window !== 'undefined') {
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

  logger.info('Auth interceptor configured');
}
