import axios, { AxiosError, AxiosResponse } from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true, // Include cookies for authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for adding auth headers or other common logic
api.interceptors.request.use(
  (config) => {
    // Add any common headers or auth tokens here if needed
    // For now, we rely on cookies for authentication
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && originalRequest) {
      // Don't try to refresh if this is already a refresh request or auth endpoint
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/me") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post("/auth/refresh");
        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear queue and redirect to login
        processQueue(refreshError);
        isRefreshing = false;

        // Only redirect if we're in the browser and not already on login page
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/login")
        ) {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other common errors
    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error("Access forbidden:", error.response.data);
    }

    if (error.response && error.response.status >= 500) {
      // Server errors
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message from axios error
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

// Helper function to check if error is a specific status code
export function isAxiosError(error: unknown, statusCode?: number): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (statusCode) {
    return error.response?.status === statusCode;
  }

  return true;
}

export default api;
