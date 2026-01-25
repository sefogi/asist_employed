import { useState, useEffect } from 'react';
import { attendanceService } from '@/services/supabase/attendance';
import type { AttendanceRecord, CreateAttendanceDTO, UpdateAttendanceDTO } from '@/types';
export const useAttendance = (employeeId?: string) => {
const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
useEffect(() => {
fetchAttendance();
}, [employeeId]);
const fetchAttendance = async () => {
try {
setLoading(true);
const data = employeeId
? await attendanceService.getByEmployeeId(employeeId)
: await attendanceService.getAll();
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
return {
attendance,
loading,
error,
checkIn,
checkOut,
requestOvertime,
approveOvertime,
refetch: fetchAttendance
};
};