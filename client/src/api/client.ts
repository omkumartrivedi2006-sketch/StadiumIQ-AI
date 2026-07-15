import axios from "axios";

// Base API URL config with fallback for local dev
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track refreshing state to queue concurrent requests if needed
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

// Interceptor to attach access token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle authentication expiration redirects & token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 (Unauthorized) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token by posting to the refresh-token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true, // Send HttpOnly cookie
        });

        if (response.data?.success && response.data?.accessToken) {
          const newToken = response.data.accessToken;
          localStorage.setItem("access_token", newToken);
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh token failed -> clear credentials and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
