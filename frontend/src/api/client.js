import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api',  // Dynamic URL: Allows Vercel connecting to Render
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Crucial for HTTP-Only Refresh cookies
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('igcim_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle 401/403 globally with automatic token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 and it's not already retrying, and it's not the login/refresh routes
    if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.token;
        
        localStorage.setItem('igcim_token', newToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers.Authorization = 'Bearer ' + newToken;
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('igcim_token');
        localStorage.removeItem('igcim_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Direct 401 fallback (when refresh fails or is already excluded)
    if (err.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
      localStorage.removeItem('igcim_token');
      localStorage.removeItem('igcim_user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;
