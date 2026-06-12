import { api } from './client';
import type { AttendanceRecord } from '@/types';

export interface AttendanceFilters {
  date?: string;
  employee_id?: string;
}

export const attendanceService = {
  getAll: (filters: AttendanceFilters = {}): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.employee_id) params.set('employee_id', filters.employee_id);
    const query = params.toString();
    return api.get<AttendanceRecord[]>(`/attendance${query ? `?${query}` : ''}`);
  },

  checkIn: (): Promise<AttendanceRecord> =>
    api.post<AttendanceRecord>('/attendance/check-in'),

  checkOut: (): Promise<AttendanceRecord> =>
    api.post<AttendanceRecord>('/attendance/check-out'),

  requestOvertime: (id: string): Promise<AttendanceRecord> =>
    api.post<AttendanceRecord>(`/attendance/${id}/overtime/request`),

  approveOvertime: (id: string): Promise<AttendanceRecord> =>
    api.post<AttendanceRecord>(`/attendance/${id}/overtime/approve`),
};
