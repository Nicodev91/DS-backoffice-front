import { API_CONFIG, getApiBaseUrl } from '../../config/api';

// Interfaz para las opciones de fetch
interface FetchOptions extends RequestInit {
  timeout?: number;
}

// Función para obtener token de localStorage
const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Función para crear headers con autenticación
const createHeaders = (customHeaders?: Record<string, string>): HeadersInit => {
  const token = getTokenFromStorage();
  const headers: HeadersInit = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...customHeaders
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Función para manejar timeout en fetch
const fetchWithTimeout = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { timeout = API_CONFIG.TIMEOUT, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      ...API_CONFIG.CORS_CONFIG,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Función para manejar errores de respuesta
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'Error del servidor';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
    } catch {
      // Si no se puede parsear el JSON, usar el status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(`${response.status}: ${errorMessage}`);
  }

  return response.json();
};

// Clase principal del servicio de API
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBaseUrl();
  }

  // Método GET
  async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = createHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers,
        ...options
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  // Método POST
  async post<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = createHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  // Método PUT
  async put<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = createHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetchWithTimeout(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  // Método DELETE
  async delete<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = createHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetchWithTimeout(url, {
        method: 'DELETE',
        headers,
        ...options
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  // Método PATCH
  async patch<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = createHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetchWithTimeout(url, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!getTokenFromStorage();
  }

  // Método para obtener el token
  getToken(): string | null {
    return getTokenFromStorage();
  }

  // Método para limpiar el token (logout)
  clearToken(): void {
    localStorage.removeItem('auth_token');
  }
}

// Instancia singleton del servicio de API
const apiService = new ApiService();

export default apiService; 