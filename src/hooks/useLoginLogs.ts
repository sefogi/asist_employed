import { useState, useEffect } from 'react';
import { loginLogsService } from '@/services/supabase/loginLogs';
import type { LoginLog, CreateLoginLogDTO } from '@/types';

export const useLoginLogs = (employeeId?: string) => {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoginLogs();
  }, [employeeId]);

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      const data = employeeId 
        ? await loginLogsService.getByEmployeeId(employeeId)
        : await loginLogsService.getAll();
      setLoginLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar logs de login');
    } finally {
      setLoading(false);
    }
  };

  const createLoginLog = async (loginLogData: CreateLoginLogDTO): Promise<void> => {
    try {
      const newLog = await loginLogsService.create(loginLogData);
      setLoginLogs(prev => [newLog, ...prev]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear log de login');
    }
  };

  const getTodayLogs = async (): Promise<LoginLog[]> => {
    try {
      return await loginLogsService.getToday();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al obtener logs de hoy');
    }
  };

  return {
    loginLogs,
    loading,
    error,
    createLoginLog,
    getTodayLogs,
    refetch: fetchLoginLogs
  };
};