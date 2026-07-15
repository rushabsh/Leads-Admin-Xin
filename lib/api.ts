import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryToken: string | null = null;

export const setToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getToken = (): string | null => {
  if (!inMemoryToken && typeof window !== 'undefined') {
    try {
      const authState = localStorage.getItem('auth-storage');
      if (authState) {
        const parsed = JSON.parse(authState);
        inMemoryToken = parsed?.state?.accessToken || null;
      }
    } catch (e) {
      console.error('Failed to parse auth token', e);
    }
  }
  return inMemoryToken;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried, and not login/refresh route
    const isAuthRoute = originalRequest.url && (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh'));
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Trigger refresh token endpoint
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        setToken(newAccessToken);

        // Update token in Zustand store manually
        if (typeof window !== 'undefined') {
          const authState = localStorage.getItem('auth-storage');
          if (authState) {
            const parsed = JSON.parse(authState);
            parsed.state.accessToken = newAccessToken;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, clear state & log out
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          const isVendor = window.location.pathname.includes('/vendor-portal');
          window.location.href = isVendor ? '/vendor-login' : '/admin-login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


