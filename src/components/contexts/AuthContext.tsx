import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../auth-service/AuthLogin';

interface User {
  id: string;
  email: string;
  name: string;
  rut?: string;
  address?: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isClient: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    if (authService.isAuthenticated()) {
      const currentUser = authService.getUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = (userData: User) => {
    console.log('AuthContext - login llamado con:', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('AuthContext - logout llamado');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const isClient = isAuthenticated && user?.role === 'client';
  
  // No necesitamos validaciones adicionales de rol
  // El backend ya valida los roles correctamente
  const isAdmin = isAuthenticated && user?.role;
  
  console.log('AuthContext - Estado actual:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    isAdmin,
    isClient
  });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isClient,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 