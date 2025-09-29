import axios from 'axios';
import { useAuthStore } from '../store/store';

// Ensure baseURL ends with exactly one trailing slash
const normalizedBaseUrl = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL || '';
  if (!raw) return '';
  return raw.endsWith('/') ? raw : raw + '/';
})();

export const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state.user?.accessToken) {
        token = state.user.accessToken;
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log('🔍 API Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 20) + '...' : 'NO_TOKEN',
      user: authStorage ? JSON.parse(authStorage).state.user : null
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from storage
        const authStorage = localStorage.getItem('auth-storage');
        if (!authStorage) {
          throw new Error('No auth storage found');
        }

  const response = await api.post("auth/refresh-token");
            const { user, accessToken } = response.data.data;

        // Update the stored token and user
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          state.user = { 
            ...state.user, 
            ...user, 
            accessToken,
            // refreshToken: newRefreshToken || refreshToken
          };
          localStorage.setItem('auth-storage', JSON.stringify({ state }));
          // Update Zustand store if available
          if (typeof useAuthStore !== 'undefined') {
            const { setUser } = useAuthStore.getState();
            setUser(state.user);
          }
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // If refresh token fails, clear storage and redirect to login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
