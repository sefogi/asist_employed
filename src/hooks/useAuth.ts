import { useState, useEffect } from 'react';
import { authService } from '@/services/supabase/auth';
import { loginLogsService } from '@/services/supabase/loginLogs';
import type { User, LoginCredentials } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        const userData = await authService.getCurrentUser(userId);
        setUser(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.login(credentials);
      
      if (!userData) {
        setError('Credenciales incorrectas');
        return false;
      }

      setUser(userData);
      localStorage.setItem('userId', userData.id);

      // Registrar login si es empleado
      if (userData.role === 'employee') {
        await loginLogsService.create({
          employee_id: userData.id,
          employee_name: userData.name
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};