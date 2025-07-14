import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isAuthenticated, user } = useAuth();

  console.log('AdminGuard - isAuthenticated:', isAuthenticated, 'user role:', user?.role);

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('AdminGuard - Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/admin-login" replace />;
  }

  // Si está autenticado, el backend ya validó que sea administrador
  // No necesitamos validaciones adicionales en el frontend
  console.log('AdminGuard - Usuario autenticado, mostrando contenido');
  return <>{children}</>;
};

export default AdminGuard; 