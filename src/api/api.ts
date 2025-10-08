import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Essencial para enviar cookies (nosso refresh token) para o backend
});

// Armazenamos o token de acesso em memória.
// O AuthContext será a fonte da verdade e irá atualizar este valor.
let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  accessToken = token;
};

// Interceptor de Requisição: Adiciona o token de acesso em cada chamada
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta: Lida com tokens expirados e tenta renová-los
api.interceptors.response.use(
  (response) => response, // Se a resposta for sucesso, apenas a retorna
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Se o erro for 401 ou 403 e não for uma tentativa de retry
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true; // Marca como uma tentativa de retry

      // Previne loop infinito se a própria rota de refresh falhar
      if (originalRequest.url === '/api/unified-auth/refresh') {
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await api.get('/api/unified-auth/refresh');
        const newAccessToken = refreshResponse.data.accessToken;
        
        setAuthToken(newAccessToken); // Atualiza o token em memória
        
        // Atualiza o header da requisição original e a tenta novamente
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Se o refresh falhar, o refresh token é inválido. Deslogamos o usuário.
        setAuthToken(null);
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;