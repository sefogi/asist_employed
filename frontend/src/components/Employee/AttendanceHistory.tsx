import React from 'react';
import { Calendar } from 'lucide-react';
import type { AttendanceHistoryProps } from '@/types';

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ userId, attendance }) => {
  const userAttendance = attendance
    .filter(a => a.employee_id === userId)
    .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime())
    .slice(0, 7);

  const calculateHours = (record: typeof userAttendance[0]): string => {
    if (!record.check_out) return 'En progreso';
    const checkIn = new Date(record.check_in);
    const checkOut = new Date(record.check_out);
    const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-indigo-600" />
        <h3 className="font-semibold text-lg text-gray-800">Mi Historial de Asistencia</h3>
      </div>
      
      {userAttendance.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No hay registros aún</p>
      ) : (
        <div className="space-y-2">
          {userAttendance.map(record => (
            <div key={record.id} className="bg-gray-50 p-4 rounded-lg border hover:border-indigo-300 transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {new Date(record.check_in).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p>🟢 Entrada: {new Date(record.check_in).toLocaleTimeString()}</p>
                    {record.check_out && (
                      <p>🔴 Salida: {new Date(record.check_out).toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {calculateHours(record)}
                  </span>
                  {record.overtime_approved && (
                    <span className="block mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                      Horas extras
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;