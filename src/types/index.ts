// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'employee' | 'admin';
  department: string;
  position: string;
  created_at?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  check_in: string;
  check_out: string | null;
  overtime_requested: boolean;
  overtime_approved: boolean;
  created_at?: string;
}

export interface CreateAttendanceDTO {
  employee_id: string;
  employee_name: string;
  check_in: string;
}

export interface UpdateAttendanceDTO {
  check_out?: string;
  overtime_requested?: boolean;
  overtime_approved?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  employee_id: string;
  employee_name: string;
  message: string;
  type: 'overtime_request' | 'approval' | 'info';
  read?: boolean;
  timestamp: string;
}

export interface CreateNotificationDTO {
  employee_id: string;
  employee_name: string;
  message: string;
  type: 'overtime_request' | 'approval' | 'info';
}

// LoginLog Types
export interface LoginLog {
  id: string;
  employee_id: string;
  employee_name: string;
  login_time: string;
}

export interface CreateLoginLogDTO {
  employee_id: string;
  employee_name: string;
}

// Alert Types
export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertMessage {
  type: AlertType;
  message: string;
}

// Component Props Types
export interface EmployeeProfileProps {
  user: User;
}

export interface AttendanceControlsProps {
  user: User;
  attendance: AttendanceRecord[];
  onCheckIn: () => void;
  onCheckOut: () => void;
  onRequestOvertime: () => void;
}

export interface LoginFormProps {
  onLogin: (user: User) => void;
  employees: User[];
}

export interface AlertProps {
  alert: AlertMessage | null;
  onClose: () => void;
}

export interface CreateEmployeeModalProps {
  onClose: () => void;
  onCreateEmployee: (data: CreateUserDTO) => void;
}

export interface EmployeeListProps {
  employees: User[];
}

export interface DailyAttendanceHistoryProps {
  attendance: AttendanceRecord[];
  employees: User[];
  loginLogs: LoginLog[];
}

export interface AdminDashboardProps {
  attendance: AttendanceRecord[];
  notifications: Notification[];
  loginLogs: LoginLog[];
  employees: User[];
  onApproveOvertime: (notificationId: string, employeeId: string) => void;
  onLogout: () => void;
  onCreateEmployee: (data: CreateUserDTO) => void;
}

export interface AttendanceHistoryProps {
  userId: string;
  attendance: AttendanceRecord[];
}