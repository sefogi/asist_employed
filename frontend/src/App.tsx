import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import type {
  AlertMessage,
  CreateUserDTO,
  LoginCredentials,
  Notification,
} from './types';

const App: React.FC = () => {
  const { user, loading: authLoading, login, logout, isAuthenticated, isAdmin } = useAuth();
  const { employees, createEmployee } = useEmployees(isAdmin);
  const {
    attendance,
    checkIn,
    checkOut,
    requestOvertime,
    approveOvertime,
    refetch: refetchAttendance,
  } = useAttendance(isAuthenticated);
  const { notifications, refetch: refetchNotifications } = useNotifications(isAdmin);
  const { loginLogs } = useLoginLogs(isAdmin);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    const success = await login(credentials);
    if (success) {
      setAlert(null);
    }
    return success;
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
        message: `Empleado ${formData.name} creado exitosamente`,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al crear empleado',
      });
    }
  };

  const handleCheckIn = async () => {
    try {
      const record = await checkIn();
      setAlert({
        type: 'success',
        message: `Entrada registrada a las ${new Date(record.check_in).toLocaleTimeString()}`,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al registrar entrada',
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      const record = await checkOut();
      const hoursWorked =
        (new Date(record.check_out!).getTime() - new Date(record.check_in).getTime()) /
        (1000 * 60 * 60);

      if (hoursWorked >= 8) {
        setAlert({
          type: 'success',
          message: '¡Felicidades! Terminaste tu jornada laboral. Excelente trabajo hoy.',
        });
      } else {
        setAlert({
          type: 'info',
          message: `Salida registrada. Trabajaste ${hoursWorked.toFixed(1)} horas.`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al registrar salida',
      });
    }
  };

  const handleRequestOvertime = async () => {
    if (!user) return;

    const todayRecord = attendance.find(
      (a) =>
        a.employee_id === user.id &&
        new Date(a.check_in).toDateString() === new Date().toDateString()
    );

    if (!todayRecord) {
      setAlert({ type: 'error', message: 'Primero debes fichar la entrada' });
      return;
    }
    if (todayRecord.overtime_requested) {
      setAlert({ type: 'info', message: 'Ya solicitaste horas extra hoy' });
      return;
    }

    try {
      await requestOvertime(todayRecord.id);
      setAlert({ type: 'info', message: 'Solicitud enviada al administrador' });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al solicitar horas extras',
      });
    }
  };

  const handleApproveOvertime = async (notification: Notification) => {
    if (!notification.attendance_id) {
      setAlert({ type: 'error', message: 'La notificación no tiene fichaje asociado' });
      return;
    }

    try {
      // El backend marca la aprobación y elimina la notificación de solicitud
      await approveOvertime(notification.attendance_id);
      await Promise.all([refetchNotifications(), refetchAttendance()]);
      setAlert({ type: 'success', message: 'Horas extras aprobadas correctamente' });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al aprobar horas extras',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

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
          <LoginForm onLogin={handleLogin} />
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
