import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  // РЕЖИМ РАЗРАБОТКИ - временно разрешить доступ
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.log('🔧 Development mode: Admin access granted');
    return <>{children}</>;
  }

  // В production - проверяем роль
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
