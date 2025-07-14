// Configuración de la API
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: import.meta.env.VITE_API_URL || 'https://backend-data-sentinel.vercel.app/v1',
  
  // Timeout por defecto para las peticiones (10 segundos)
  TIMEOUT: 10000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configuración de CORS
  CORS_CONFIG: {
    credentials: 'include' as const,
    mode: 'cors' as const,
  },
  
  // Endpoints de la API
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      REGISTER: '/auth/register',
    },
    OTP: {
      SEND: '/otp/send',
      VERIFY: '/otp/verify',
    },
    SHOP: {
      GET_ALL: '/shop',
      GET_BY_ID: (id: string) => `/shop/${id}`,
      CREATE: '/shop',
      UPDATE: (id: string) => `/shop/${id}`,
      DELETE: (id: string) => `/shop/${id}`,
    },
    PRODUCTS: {
      GET_ALL: '/products',
      GET_BY_ID: (id: string) => `/products/${id}`,
      CREATE: '/products',
      UPDATE: (id: string) => `/products/${id}`,
      DELETE: (id: string) => `/products/${id}`,
    },
    ORDERS: {
      GET_ALL: '/orders',
      GET_BY_ID: (id: number) => `/orders/${id}`,
      UPDATE_STATUS: (id: number) => `/orders/${id}/status`,
    },
    STOCK: {
      GET_ALL: '/stock',
      GET_BY_ID: (id: string) => `/stock/${id}`,
      UPDATE: (id: string) => `/stock/${id}`,
      ADD: '/stock/add',
      REMOVE: '/stock/remove',
    },
    CATEGORIES: {
      GET_ALL: '/categories',
      GET_BY_ID: (id: number) => `/categories/${id}`,
      CREATE: '/categories',
      UPDATE: (id: number) => `/categories/${id}`,
      DELETE: (id: number) => `/categories/${id}`,
    },
  },
  
  // Configuración de cookies
  COOKIES: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    EXPIRES_DAYS: 7,
  },
};

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

// Función para obtener la URL de la API según el entorno
export const getApiBaseUrl = (): string => {
  if (isDevelopment()) {
    // En desarrollo, usar proxy de Vite
    return '/api';
  }
  return API_CONFIG.BASE_URL;
};