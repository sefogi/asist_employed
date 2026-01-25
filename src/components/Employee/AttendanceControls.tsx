import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle, Bell } from 'lucide-react';
import { WORK_HOURS } from '@/utils/constants';
import type { AttendanceControlsProps } from '@/types';

const AttendanceControls: React.FC<AttendanceControlsProps> = ({
  user,
  attendance,
  onCheckIn,
  onCheckOut,
  onRequestOvertime,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayRecord = attendance.find(a => 
    a.employee_id === user.id && 
    new Date(a.check_in).toDateString() === new Date().toDateString()
  );

  const hasCheckedIn = todayRecord !== null && todayRecord !== undefined;
  const hasCheckedOut = hasCheckedIn && todayRecord?.check_out !== null;

  let hoursWorked = 0;
  if (hasCheckedIn && todayRecord && !hasCheckedOut) {
    const checkInTime = new Date(todayRecord.check_in);
    hoursWorked = (currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  } else if (hasCheckedOut && todayRecord && todayRecord.check_out) {
    const checkInTime = new Date(todayRecord.check_in);
    const checkOutTime = new Date(todayRecord.check_out);
    hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  }

  const canRequestOvertime = todayRecord && hoursWorked >= WORK_HOURS && !hasCheckedOut && !todayRecord.overtime_requested;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-lg text-gray-800">Entrada</h3>
          </div>
          {!hasCheckedIn ? (
            <button
              onClick={onCheckIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Marcar Entrada
            </button>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Entrada registrada</p>
              <p className="font-bold text-xl text-gray-800 mt-1">
                {new Date(todayRecord.check_in).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-6 h-6 text-red-600" />
            <h3 className="font-semibold text-lg text-gray-800">Salida</h3>
          </div>
          {hasCheckedIn && !hasCheckedOut ? (
            <button
              onClick={onCheckOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Marcar Salida
            </button>
          ) : hasCheckedOut && todayRecord?.check_out ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Salida registrada</p>
              <p className="font-bold text-xl text-gray-800 mt-1">
                {new Date(todayRecord.check_out).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Primero marca tu entrada</p>
            </div>
          )}
        </div>
      </div>

      {hasCheckedIn && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Tiempo Trabajado</h3>
            <div className="text-3xl font-bold text-indigo-600">
              {hoursWorked.toFixed(1)} hrs
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de jornada</span>
              <span>{Math.min(Math.round((hoursWorked / WORK_HOURS) * 100), 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  hoursWorked >= WORK_HOURS ? 'bg-green-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min((hoursWorked / WORK_HOURS) * 100, 100)}%` }}
              />
            </div>
          </div>

          {hoursWorked >= WORK_HOURS && !hasCheckedOut && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold text-center">
                 Completaste tu jornada laboral
              </p>
            </div>
          )}

          {canRequestOvertime && (
            <button
              onClick={onRequestOvertime}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Bell className="w-5 h-5" />
              Solicitar Horas Extras
            </button>
          )}

          {todayRecord?.overtime_requested && !todayRecord?.overtime_approved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-yellow-800 font-medium">⏳ Esperando aprobación de horas extras</p>
            </div>
          )}

          {todayRecord?.overtime_approved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-800 font-medium">✓ Horas extras aprobadas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceControls;