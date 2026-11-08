import axios from 'axios';

// Trigger Vercel auto-rebuild to inject VITE_API_URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Support environment-configured backend URL in production
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper to ensure media file URLs (gallery images, pastor photo, church logo)
 * correctly resolve to full absolute URLs whether served from Cloudinary, backend, or local dev.
 */
export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    let cleanUrl = url;
    // Upgrade http to https if window is https
    if (cleanUrl.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      cleanUrl = cleanUrl.replace('http://', 'https://');
    }
    // Ensure Cloudinary URLs include /image/upload/
    if (cleanUrl.includes('res.cloudinary.com') && !cleanUrl.includes('/image/upload/') && !cleanUrl.includes('/raw/upload/') && !cleanUrl.includes('/video/upload/')) {
      cleanUrl = cleanUrl.replace(/res\.cloudinary\.com\/([^/]+)\/(.+)/, 'res.cloudinary.com/$1/image/upload/$2');
    }
    return cleanUrl;
  }
  const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  let fullUrl = backendBase ? `${backendBase}${cleanPath}` : cleanPath;
  if (fullUrl.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
    fullUrl = fullUrl.replace('http://', 'https://');
  }
  if (fullUrl.includes('res.cloudinary.com') && !fullUrl.includes('/image/upload/') && !fullUrl.includes('/raw/upload/') && !fullUrl.includes('/video/upload/')) {
    fullUrl = fullUrl.replace(/res\.cloudinary\.com\/([^/]+)\/(.+)/, 'res.cloudinary.com/$1/image/upload/$2');
  }
  return fullUrl;
};

// Interceptor to automatically add JWT access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens or unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken });
          const newAccessToken = res.data.access;
          localStorage.setItem('token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid; log out user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
