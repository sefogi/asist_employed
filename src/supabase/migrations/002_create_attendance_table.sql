-- Crear tabla de asistencia
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  overtime_requested BOOLEAN DEFAULT FALSE,
  overtime_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_check_in ON attendance(check_in);
CREATE INDEX idx_attendance_date ON attendance(DATE(check_in));

-- Restricción: No puede haber más de un registro de entrada por día por empleado
CREATE UNIQUE INDEX idx_unique_daily_attendance 
ON attendance(employee_id, DATE(check_in));

-- Comentarios
COMMENT ON TABLE attendance IS 'Registros de asistencia de empleados';
COMMENT ON COLUMN attendance.overtime_requested IS 'Indica si el empleado solicitó horas extras';
COMMENT ON COLUMN attendance.overtime_approved IS 'Indica si las horas extras fueron aprobadas';