import React, { useState, useEffect } from 'react';
import LoginForm from './components/Auth/LoginForm';
import LiveClock from './components/Shared/LiveClock';
import Alert from './components/Shared/Alert';
import EmployeeProfile from './components/Employee/EmployeeProfile';
import AttendanceControls from './components/Employee/AttendanceControls';
import AttendanceHistory from './components/Employee/AttendanceHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { useEmployees } from './hooks/useEmployees';
import { useAttendance } from './hooks/useAttendance';
import { useNotifications } from './hooks/useNotifications';
import { useLoginLogs } from './hooks/useLoginLogs';
import type { AlertMessage, CreateUserDTO } from './types';

const App: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { employees, createEmployee } = useEmployees();
  const { attendance, checkIn, checkOut, requestOvertime, approveOvertime, refetch: refetchAttendance } = useAttendance();
  const { notifications, createNotification, deleteNotification } = useNotifications();
  const { loginLogs } = useLoginLogs();
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const handleLogin = async (loginUser: typeof user) => {
    if (!loginUser) return;
    const success = await login({ email: loginUser.email, password: loginUser.password || '' });
    if (!success) {
      setAlert({ type: 'error', message: 'Credenciales incorrectas' });
    }
  };

  const handleLogout = () => {
    logout();
    setAlert(null);
  };

  const handleCreateEmployee = async (formData: CreateUserDTO) => {
    try {
      await createEmployee(formData);
      setAlert({
        type: 'success',
        message: `✓ Empleado ${formData.name} creado exitosamente`
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al crear empleado'
      });
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      await checkIn({
        employee_id: user.id,
        employee_name: user.name,
        check_in: new Date().toISOString()
      });
      
      setAlert({ 
        type: 'success', 
        message: `✓ Entrada registrada exitosamente a las ${new Date().toLocaleTimeString()}` 
      });
      
      await refetchAttendance();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al registrar entrada'
      });
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;

    try {
      const todayRecord = attendance.find(a => 
        a.employee_id === user.id && 
        a.check_out === null &&
        new Date(a.check_in).toDateString() === new Date().toDateString()
      );

      if (!todayRecord) {
        setAlert({ type: 'error', message: 'No hay registro de entrada para hoy' });
        return;
      }

      await checkOut(todayRecord.id);

      const checkInTime = new Date(todayRecord.check_in);
      const checkOutTime = new Date();
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      if (hoursWorked >= 8) {
        setAlert({ 
          type: 'success', 
          message: '🎉 ¡Felicidades! Terminaste tu jornada laboral. Excelente trabajo hoy.' 
        });
      } else {
        setAlert({ 
          type: 'info', 
          message: `Salida registrada. Trabajaste ${hoursWorked.toFixed(1)} horas.` 
        });
      }
      
      await refetchAttendance();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al registrar salida'
      });
    }
  };

  const handleRequestOvertime = async () => {
    if (!user) return;

    try {
      const todayRecord = attendance.find(a => 
        a.employee_id === user.id && 
        new Date(a.check_in).toDateString() === new Date().toDateString()
      );

      if (!todayRecord || todayRecord.overtime_requested) return;

      await requestOvertime(todayRecord.id);

      await createNotification({
        employee_id: user.id,
        employee_name: user.name,
        message: `Solicita autorización para trabajar horas extras`,
        type: 'overtime_request'
      });

      setAlert({ 
        type: 'info', 
        message: '📨 Solicitud enviada al administrador' 
      });
      
      await refetchAttendance();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al solicitar horas extras'
      });
    }
  };

  const handleApproveOvertime = async (notificationId: string, employeeId: string) => {
    try {
      const record = attendance.find(a => 
        a.employee_id === employeeId && 
        new Date(a.check_in).toDateString() === new Date().toDateString()
      );

      if (!record) return;

      await approveOvertime(record.id);
      await deleteNotification(notificationId);
      
      setAlert({ type: 'success', message: '✓ Horas extras aprobadas correctamente' });
      
      await refetchAttendance();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al aprobar horas extras'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Control de Asistencia
          </h1>
          <p className="text-gray-600">Gestión inteligente de horarios laborales</p>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert alert={alert} onClose={() => setAlert(null)} />
          </div>
        )}

        {!user ? (
          <LoginForm onLogin={handleLogin} employees={employees} />
        ) : (
          <div className="space-y-6">
            {user.role === 'employee' ? (
              <>
                <div className="flex items-center justify-between">
                  <div></div>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
                
                <EmployeeProfile user={user} />
                <LiveClock />
                <AttendanceControls 
                  user={user}
                  attendance={attendance}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onRequestOvertime={handleRequestOvertime}
                />
                <AttendanceHistory userId={user.id} attendance={attendance} />
              </>
            ) : (
              <>
                <LiveClock />
                <AdminDashboard 
                  attendance={attendance}
                  notifications={notifications}
                  loginLogs={loginLogs}
                  employees={employees}
                  onApproveOvertime={handleApproveOvertime}
                  onLogout={handleLogout}
                  onCreateEmployee={handleCreateEmployee}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;