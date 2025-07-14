import apiService from "../services/api";
import { API_CONFIG } from "../../config/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

// Función para guardar token en localStorage
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Función para obtener token de localStorage
const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Función para eliminar token de localStorage
const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Función para obtener cookies (mantener para compatibilidad)
// Exported to allow usage from other modules if needed in the future
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Función para decodificar JWT (solo la parte payload)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

class SecureAuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log("Enviando petición de login...");
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      console.log("Respuesta del servidor:", response);
      
      // Verificar la estructura de la respuesta y adaptarla según sea necesario
      const data = response;
      
      // Comprobar si la respuesta tiene el formato esperado o adaptarlo
      // Algunos backends devuelven token, otros access_token, etc.
      const token = data.access_token || data.token || data.accessToken;
      
      if (token) {
        // Decodificar el JWT
        const decodedToken = decodeJWT(token);
        console.log('Token decodificado:', decodedToken);
        console.log('Datos completos del backend:', data);
        
        // Almacenar token en cookie HttpOnly segura
        setToken(token);
        
        // Crear objeto de usuario desde el token o usar valores por defecto
        const user = {
          id: decodedToken?.sub?.toString() || decodedToken?.userId?.toString() || data.user?.id || data.id || "1",
          email: decodedToken?.email || data.user?.email || data.email || credentials.email,
          name: decodedToken?.name || decodedToken?.username || data.user?.name || data.name || credentials.email.split('@')[0],
          role: decodedToken?.role || data.user?.role || data.role || "client" // Usar el rol del backend, no asignar 'client' por defecto
        };
        
        console.log('Rol del token decodificado:', decodedToken?.role);
        console.log('Rol de data.user:', data.user?.role);
        console.log('Rol de data:', data.role);
        console.log('Rol final asignado:', user.role);
        console.log('Estructura completa de data:', JSON.stringify(data, null, 2));
        
        // Almacenar información del usuario en sessionStorage
        sessionStorage.setItem('user', JSON.stringify(user));
        
        console.log("Login exitoso, token almacenado");
        console.log("Usuario creado:", user);
        return { success: true, token: token, user };
      } else {
        // Mejorar el manejo de errores para capturar diferentes formatos de respuesta
        console.log("Login fallido:", data.error || data.message || data.msg || 'Credenciales inválidas');
        return { success: false, error: data.error || data.message || data.msg || 'Credenciales inválidas' };
      }
    } catch (error) {
      console.error("Error en la petición de login:", error);
      
      // Manejo específico de errores de fetch
      if (error instanceof Error) {
        const errorMessage = error.message || 'Error de conexión con el servidor';
        return { success: false, error: errorMessage };
      } else {
        return { success: false, error: 'Error de conexión con el servidor' };
      }
    }
  }

  async logout(): Promise<void> {
    try {
      // Intentar hacer logout en el servidor
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error en logout del servidor:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado del servidor
      this.clearLocalData();
    }
  }

  private clearLocalData(): void {
    // Limpiar localStorage
    removeToken();
    localStorage.removeItem('refresh_token');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    
    console.log("Datos locales limpiados");
  }

  isAuthenticated(): boolean {
    return !!getTokenFromStorage();
  }

  getUser(): any {
    try {
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      console.log('AuthService - getUser - userStr:', userStr);
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('AuthService - getUser - usuario parseado:', user);
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  getToken(): string | null {
    return getTokenFromStorage();
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
  }

  // Método para renovar token automáticamente
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, { 
        refresh_token: refreshToken 
      });

      if (response.access_token) {
        setToken(response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error renovando token:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio de autenticación
const authService = new SecureAuthService();

export default authService;

