import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '@/services/api/attendance';
import type { AttendanceRecord } from '@/types';

// enabled: requiere sesión iniciada (el backend filtra por rol)
export const useAttendance = (enabled: boolean) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAll();
      setAttendance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchAttendance();
    } else {
      setAttendance([]);
    }
  }, [enabled, fetchAttendance]);

  const checkIn = async (): Promise<AttendanceRecord> => {
    const newRecord = await attendanceService.checkIn();
    setAttendance((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const checkOut = async (): Promise<AttendanceRecord> => {
    const updated = await attendanceService.checkOut();
    setAttendance((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    return updated;
  };

  const requestOvertime = async (id: string): Promise<void> => {
    const updated = await attendanceService.requestOvertime(id);
    setAttendance((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const approveOvertime = async (id: string): Promise<void> => {
    const updated = await attendanceService.approveOvertime(id);
    setAttendance((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  return {
    attendance,
    loading,
    error,
    checkIn,
    checkOut,
    requestOvertime,
    approveOvertime,
    refetch: fetchAttendance,
  };
};
