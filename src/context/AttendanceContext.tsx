import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { attendanceService } from '@/services/supabase/attendance';
import type { AttendanceRecord, CreateAttendanceDTO } from '@/types';

interface AttendanceContextType {
  attendance: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  checkIn: (data: CreateAttendanceDTO) => Promise<void>;
  checkOut: (id: string) => Promise<void>;
  requestOvertime: (id: string) => Promise<void>;
  approveOvertime: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendanceContext = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendanceContext must be used within AttendanceProvider');
  }
  return context;
};

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
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
  };

  const checkIn = async (data: CreateAttendanceDTO): Promise<void> => {
    try {
      const newRecord = await attendanceService.create(data);
      setAttendance(prev => [newRecord, ...prev]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al registrar entrada');
    }
  };

  const checkOut = async (id: string): Promise<void> => {
    try {
      const updated = await attendanceService.update(id, {
        check_out: new Date().toISOString()
      });
      setAttendance(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al registrar salida');
    }
  };

  const requestOvertime = async (id: string): Promise<void> => {
    try {
      const updated = await attendanceService.update(id, {
        overtime_requested: true
      });
      setAttendance(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al solicitar horas extras');
    }
  };

  const approveOvertime = async (id: string): Promise<void> => {
    try {
      const updated = await attendanceService.update(id, {
        overtime_approved: true
      });
      setAttendance(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al aprobar horas extras');
    }
  };

  const value: AttendanceContextType = {
    attendance,
    loading,
    error,
    checkIn,
    checkOut,
    requestOvertime,
    approveOvertime,
    refetch: fetchAttendance
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};