import React, { useState } from 'react';
import LoginForm from './components/Auth/LoginForm';
import LiveClock from './components/Shared/LiveClock';
import Alert from './components/Shared/Alert';
import EmployeeProfile from './components/Employee/EmployeeProfile';
import AttendanceControls from './components/Employee/AttendanceControls';
import AttendanceHistory from './components/Employee/AttendanceHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import type {
  User,
  AttendanceRecord,
  Notification,
  LoginLog,
  AlertMessage,
  CreateUserDTO
} from './types';

// Mock database
const mockDB = {
  users: [
    { id: '1', name: 'Juan Pérez', email: 'juan@empresa.com', password: '1234', role: 'employee' as const, department: 'Ventas', position: 'Ejecutivo' },
    { id: '2', name: 'María González', email: 'maria@empresa.com', password: '1234', role: 'employee' as const, department: 'Marketing', position: 'Diseñadora' },
    { id: '3', name: 'Carlos Ruiz', email: 'carlos@empresa.com', password: '1234', role: 'employee' as const, department: 'IT', position: 'Desarrollador' },
    { id: '4', name: 'Admin Sistema', email: 'admin@empresa.com', password: 'admin', role: 'admin' as const, department: 'Administración', position: 'Gerente' }
  ],
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [employees, setEmployees] = useState<User[]>(mockDB.users);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const handleLogin = (user: User) => {
    const updatedUser = employees.find(e => e.email === user.email && e.password === user.password);
    if (!updatedUser) return;
    
    setCurrentUser(updatedUser);
    
    if (updatedUser.role === 'employee') {
      const loginLog: LoginLog = {
        id: Date.now().toString(),
        employee_id: updatedUser.id,
        employee_name: updatedUser.name,
        login_time: new Date().toISOString()
      };
      setLoginLogs([...loginLogs, loginLog]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAlert(null);
  };

  const handleCreateEmployee = (formData: CreateUserDTO) => {
    const newEmployee: User = {
      id: (employees.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'employee',
      department: formData.department,
      position: formData.position
    };

    setEmployees([...employees, newEmployee]);
    setAlert({
      type: 'success',
      message: `✓ Empleado ${formData.name} creado exitosamente`
    });
  };

  const handleCheckIn = () => {
    if (!currentUser) return;

    const existingRecord = attendance.find(a => 
      a.employee_id === currentUser.id && 
      new Date(a.check_in).toDateString() === new Date().toDateString()
    );

    if (existingRecord) {
      setAlert({ type: 'error', message: 'Ya registraste tu entrada hoy' });
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employee_id: currentUser.id,
      employee_name: currentUser.name,
      check_in: new Date().toISOString(),
      check_out: null,
      overtime_requested: false,
      overtime_approved: false
    };

    setAttendance([...attendance, newRecord]);
    setAlert({ 
      type: 'success', 
      message: `✓ Entrada registrada exitosamente a las ${new Date().toLocaleTimeString()}` 
    });
  };

  const handleCheckOut = () => {
    if (!currentUser) return;

    const todayRecord = attendance.find(a => 
      a.employee_id === currentUser.id && 
      a.check_out === null &&
      new Date(a.check_in).toDateString() === new Date().toDateString()
    );

    if (!todayRecord) {
      setAlert({ type: 'error', message: 'No hay registro de entrada para hoy' });
      return;
    }

    const checkInTime = new Date(todayRecord.check_in);
    const checkOutTime = new Date();
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updatedAttendance = attendance.map(a => 
      a.id === todayRecord.id 
        ? { ...a, check_out: checkOutTime.toISOString() }
        : a
    );

    setAttendance(updatedAttendance);

    if (hoursWorked >= 8) {
      setAlert({ 
        type: 'success', 
        message: '¡Felicidades! Terminaste tu jornada laboral. Excelente trabajo hoy.' 
      });
    } else {
      setAlert({ 
        type: 'info', 
        message: `Salida registrada. Trabajaste ${hoursWorked.toFixed(1)} horas.` 
      });
    }
  };

  const handleRequestOvertime = () => {
    if (!currentUser) return;

    const todayRecord = attendance.find(a => 
      a.employee_id === currentUser.id && 
      new Date(a.check_in).toDateString() === new Date().toDateString()
    );

    if (!todayRecord || todayRecord.overtime_requested) return;

    const updatedAttendance = attendance.map(a => 
      a.id === todayRecord.id 
        ? { ...a, overtime_requested: true }
        : a
    );
    setAttendance(updatedAttendance);

    const notification: Notification = {
      id: Date.now().toString(),
      employee_id: currentUser.id,
      employee_name: currentUser.name,
      message: `Solicita autorización para trabajar horas extras`,
      timestamp: new Date().toISOString(),
      type: 'overtime_request'
    };

    setNotifications([...notifications, notification]);
    setAlert({ 
      type: 'info', 
      message: 'Solicitud enviada al administrador' 
    });
  };

  const handleApproveOvertime = (notificationId: string, employeeId: string) => {
    const updatedAttendance = attendance.map(a => 
      a.employee_id === employeeId && 
      new Date(a.check_in).toDateString() === new Date().toDateString()
        ? { ...a, overtime_approved: true }
        : a
    );
    
    setAttendance(updatedAttendance);
    setNotifications(notifications.filter(n => n.id !== notificationId));
    setAlert({ type: 'success', message: '✓ Horas extras aprobadas correctamente' });
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

        {!currentUser ? (
          <LoginForm onLogin={handleLogin} employees={employees} />
        ) : (
          <div className="space-y-6">
            {currentUser.role === 'employee' ? (
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
                
                <EmployeeProfile user={currentUser} />
                <LiveClock />
                <AttendanceControls 
                  user={currentUser}
                  attendance={attendance}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onRequestOvertime={handleRequestOvertime}
                />
                <AttendanceHistory userId={currentUser.id} attendance={attendance} />
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

export default App
