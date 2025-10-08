import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  accessToken = token;
};

// A função de setup que será chamada pelo AuthContext
export const setupInterceptors = (logoutUser: () => void) => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      if ((status === 401 || status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;

        if (originalRequest.url === '/api/unified-auth/refresh') {
          logoutUser(); // Se o refresh falhar, desloga o usuário
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await api.get('/api/unified-auth/refresh');
          const newAccessToken = refreshResponse.data.accessToken;
          setAuthToken(newAccessToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          logoutUser(); // Se o refresh der erro, desloga o usuário
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;
