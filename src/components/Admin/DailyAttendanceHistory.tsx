import React, { useState } from 'react';
import { FileText, Download, ChevronDown, ChevronUp, User } from 'lucide-react';
import { calculateHoursWorked, getTimeDifference } from '@/utils/timeCalculations';
import type { DailyAttendanceHistoryProps, AttendanceRecord } from '@/types';

const DailyAttendanceHistory: React.FC<DailyAttendanceHistoryProps> = ({
  attendance,
  employees,
  loginLogs
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const getDaysWithRecords = (): string[] => {
    const days = new Set<string>();
    attendance.forEach(record => {
      const date = new Date(record.check_in).toISOString().split('T')[0];
      days.add(date);
    });
    loginLogs.forEach(log => {
      const date = new Date(log.login_time).toISOString().split('T')[0];
      days.add(date);
    });
    return Array.from(days).sort().reverse();
  };

  const daysWithRecords = getDaysWithRecords();

  const getRecordsForDate = (date: string) => {
    const dateAttendance = attendance.filter(a => 
      new Date(a.check_in).toISOString().split('T')[0] === date
    );
    
    const dateLogins = loginLogs.filter(log => 
      new Date(log.login_time).toISOString().split('T')[0] === date
    );

    return { attendance: dateAttendance, logins: dateLogins };
  };

  const calculateHours = (record: AttendanceRecord): string => {
    if (!record.check_out) return 'En curso';
    const hours = calculateHoursWorked(record.check_in, record.check_out);
    return `${hours.toFixed(2)} hrs`;
  };

  const toggleDay = (date: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const exportToPDF = (date: string) => {
    const { attendance: dayAttendance, logins: dayLogins } = getRecordsForDate(date);
    
    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Asistencia - ${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 10px 0 0 0;
      font-size: 16px;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #4F46E5;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th {
      background-color: #4F46E5;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
    }
    tr:hover {
      background-color: #F9FAFB;
    }
    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-complete {
      background-color: #D1FAE5;
      color: #065F46;
    }
    .status-incomplete {
      background-color: #FEE2E2;
      color: #991B1B;
    }
    .status-overtime {
      background-color: #D1FAE5;
      color: #065F46;
      border: 1px solid #059669;
    }
    .summary {
      background-color: #EEF2FF;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-item {
      display: inline-block;
      margin: 10px 20px 10px 0;
      font-size: 14px;
    }
    .summary-item strong {
      color: #4F46E5;
      font-size: 18px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #6B7280;
      font-size: 12px;
      border-top: 1px solid #E5E7EB;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Asistencia Diaria</h1>
    <p>${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <strong>${dayAttendance.length}</strong> registros de asistencia
    </div>
    <div class="summary-item">
      <strong>${dayLogins.length}</strong> inicios de sesión
    </div>
    <div class="summary-item">
      <strong>${dayAttendance.filter(a => a.check_out).length}</strong> jornadas completas
    </div>
    <div class="summary-item">
      <strong>${dayAttendance.filter(a => a.overtime_approved).length}</strong> horas extras
    </div>
  </div>

  <div class="section">
    <h2>👥 Registros de Inicio de Sesión</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Empleado</th>
          <th>Departamento</th>
          <th>Hora de Login</th>
          <th>Hora de Marcado</th>
          <th>Diferencia</th>
        </tr>
      </thead>
      <tbody>
        ${dayLogins.map(log => {
          const employee = employees.find(e => e.id === log.employee_id);
          const attendanceRecord = dayAttendance.find(a => a.employee_id === log.employee_id);
          const diff = getTimeDifference(log.login_time, attendanceRecord?.check_in || null);
          
          return `
            <tr>
              <td>${log.employee_id.toString().padStart(4, '0')}</td>
              <td>${log.employee_name}</td>
              <td>${employee?.department || 'N/A'}</td>
              <td>${new Date(log.login_time).toLocaleTimeString('es-ES')}</td>
              <td>${attendanceRecord ? new Date(attendanceRecord.check_in).toLocaleTimeString('es-ES') : '-'}</td>
              <td>${diff}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>⏰ Registros de Asistencia Completos</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Empleado</th>
          <th>Posición</th>
          <th>Entrada</th>
          <th>Salida</th>
          <th>Horas</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${dayAttendance.map(record => {
          const employee = employees.find(e => e.id === record.employee_id);
          const hours = calculateHours(record);
          const status = !record.check_out ? 'incomplete' : record.overtime_approved ? 'overtime' : 'complete';
          const statusText = !record.check_out ? 'Incompleto' : record.overtime_approved ? 'Con H. Extras' : 'Completo';
          
          return `
            <tr>
              <td>${record.employee_id.toString().padStart(4, '0')}</td>
              <td>${record.employee_name}</td>
              <td>${employee?.position || 'N/A'}</td>
              <td>${new Date(record.check_in).toLocaleTimeString('es-ES')}</td>
              <td>${record.check_out ? new Date(record.check_out).toLocaleTimeString('es-ES') : '-'}</td>
              <td>${hours}</td>
              <td><span class="status status-${status}">${statusText}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Reporte generado el ${new Date().toLocaleString('es-ES')}</p>
    <p>Sistema de Control de Asistencia | Empresa</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Asistencia_${date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Historial Diario de Asistencia
        </h3>
      </div>

      {daysWithRecords.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No hay registros históricos</p>
      ) : (
        <div className="space-y-3">
          {daysWithRecords.map(date => {
            const { attendance: dayAttendance, logins: dayLogins } = getRecordsForDate(date);
            const isExpanded = expandedDays[date];
            const dateObj = new Date(date);
            
            return (
              <div key={date} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleDay(date)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className="font-bold text-gray-800">
                        {dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {dayAttendance.length} registros de asistencia • {dayLogins.length} logins
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">
                      {dayAttendance.filter(a => a.check_out).length} completos
                    </span>
                    <button
                      onClick={() => exportToPDF(date)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Registros de Login</h4>
                      <div className="space-y-2">
                        {dayLogins.map(log => {
                          const employee = employees.find(e => e.id === log.employee_id);
                          const attendanceRecord = dayAttendance.find(a => a.employee_id === log.employee_id);
                          
                          return (
                            <div key={log.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-800">{log.employee_name}</p>
                                  <p className="text-sm text-gray-600">{employee?.department}</p>
                                </div>
                                <div className="text-right text-sm">
                                  <p className="text-gray-700">
                                    📱 Login: {new Date(log.login_time).toLocaleTimeString()}
                                  </p>
                                  {attendanceRecord && (
                                    <p className="text-green-700">
                                      🟢 Marcado: {new Date(attendanceRecord.check_in).toLocaleTimeString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Registros de Asistencia</h4>
                      <div className="space-y-2">
                        {dayAttendance.map(record => {
                          const employee = employees.find(e => e.id === record.employee_id);
                          
                          return (
                            <div key={record.id} className="bg-gray-50 p-3 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-800">{record.employee_name}</p>
                                  <p className="text-sm text-gray-600">{employee?.position}</p>
                                  <div className="text-xs text-gray-500 mt-1">
                                    🟢 {new Date(record.check_in).toLocaleTimeString()}
                                    {record.check_out && ` • 🔴 ${new Date(record.check_out).toLocaleTimeString()}`}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-indigo-600">
                                    {calculateHours(record)}
                                  </p>
                                  {record.overtime_approved && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      H. Extras
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyAttendanceHistory;