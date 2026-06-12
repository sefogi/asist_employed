import { useState, useEffect, useCallback } from 'react';
import { loginLogsService } from '@/services/api/loginLogs';
import type { LoginLog } from '@/types';

// enabled: solo el admin puede ver los logs de login
export const useLoginLogs = (enabled: boolean) => {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoginLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loginLogsService.getAll();
      setLoginLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar logs de login');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Carga inicial de datos: el setLoading síncrono dentro del fetch es intencional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLoginLogs();
  }, [enabled, fetchLoginLogs]);

  return {
    loginLogs: enabled ? loginLogs : [],
    loading,
    error,
    refetch: fetchLoginLogs,
  };
};
