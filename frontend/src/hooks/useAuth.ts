import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/api/auth';
import type { User, LoginCredentials } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.hasSession()) {
        setLoading(false);
        return;
      }
      try {
        const userData = await authService.me();
        setUser(userData);
      } catch {
        // Token expirado o inválido: se limpia la sesión
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null);
      const userData = await authService.login(credentials);
      setUser(userData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
};
