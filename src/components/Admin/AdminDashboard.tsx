import React, { useState } from "react";
import { Users, UserPlus, Bell, User as UserIcon } from "lucide-react";
import { getTimeDifference } from "@/utils/timeCalculations";
import CreateEmployeeModal from "./CreateEmployeeModal";
import EmployeeList from "./EmployeeList";
import DailyAttendanceHistory from "./DailyAttendanceHistory";
import type { AdminDashboardProps } from "@/types";

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  attendance,
  notifications,
  loginLogs,
  employees,
  onApproveOvertime,
  onLogout,
  onCreateEmployee,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const todayAttendance = attendance.filter(
    (a) => new Date(a.check_in).toDateString() === new Date().toDateString()
  );

  const todayLogins = loginLogs.filter(
    (log) =>
      new Date(log.login_time).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onCreateEmployee={onCreateEmployee}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          Panel de Administración
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Nuevo Empleado
          </button>
          <button
            onClick={onLogout}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <EmployeeList employees={employees} />

      <DailyAttendanceHistory
        attendance={attendance}
        employees={employees}
        loginLogs={loginLogs}
      />

      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
            <Bell className="w-6 h-6 text-yellow-600 animate-bounce" />
            Solicitudes de Horas Extras ({notifications.length})
          </h3>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-4 rounded-lg border-2 border-yellow-300 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">
                      {notif.employee_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      📅 {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onApproveOvertime(notif.id, notif.employee_id)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                  >
                    ✓ Aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
          🕐 Control de Login y Marcado de Hoy ({todayLogins.length} empleados)
        </h3>
        {todayLogins.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No hay registros de login para hoy
          </p>
        ) : (
          <div className="space-y-3">
            {todayLogins.map((log) => {
              const user = employees.find((u) => u.id === log.employee_id);
              const attendanceRecord = todayAttendance.find(
                (a) => a.employee_id === log.employee_id
              );
              const timeDiff = getTimeDifference(
                log.login_time,
                attendanceRecord?.check_in || null
              );

              return (
                <div
                  key={log.id}
                  className="bg-gray-50 p-4 rounded-lg border hover:border-indigo-300 transition"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {log.employee_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.department} - {user?.position}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">📱 Login en app:</span>
                        <span className="font-semibold text-blue-700">
                          {new Date(log.login_time).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          🟢 Marcado entrada:
                        </span>
                        <span
                          className={`font-semibold ${
                            attendanceRecord?.check_in
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {attendanceRecord?.check_in
                            ? new Date(
                                attendanceRecord.check_in
                              ).toLocaleTimeString()
                            : "Sin marcar"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-gray-600">⏱️ Diferencia:</span>
                        <span
                          className={`font-bold px-3 py-1 rounded-full text-xs ${
                            !attendanceRecord?.check_in
                              ? "bg-red-100 text-red-800"
                              : timeDiff === "Inmediato"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {timeDiff}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">
          📊 Asistencia Completa de Hoy ({todayAttendance.length} registros)
        </h3>
        {todayAttendance.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No hay registros de marcado para hoy
          </p>
        ) : (
          <div className="space-y-3">
            {todayAttendance.map((record) => {
              const user = employees.find((u) => u.id === record.employee_id);
              return (
                <div
                  key={record.id}
                  className="bg-gray-50 p-4 rounded-lg border hover:border-indigo-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {record.employee_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.department} - {user?.position}
                        </p>
                        <div className="text-xs text-gray-500 mt-1 space-x-3">
                          <span>
                            🟢 {new Date(record.check_in).toLocaleTimeString()}
                          </span>
                          {record.check_out && (
                            <span>
                              🔴{" "}
                              {new Date(record.check_out).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {record.overtime_approved && (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                          Horas extras
                        </span>
                      )}
                      {!record.check_out && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                          Activo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
