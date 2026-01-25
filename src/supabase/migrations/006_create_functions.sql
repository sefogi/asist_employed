-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular horas trabajadas
CREATE OR REPLACE FUNCTION calculate_hours_worked(
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC AS $$
BEGIN
  IF check_out_time IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas diarias
CREATE OR REPLACE FUNCTION get_daily_stats(target_date DATE)
RETURNS TABLE(
  total_employees BIGINT,
  checked_in BIGINT,
  checked_out BIGINT,
  overtime_requests BIGINT,
  overtime_approved BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT u.id)::BIGINT as total_employees,
    COUNT(DISTINCT CASE WHEN DATE(a.check_in) = target_date THEN a.employee_id END)::BIGINT as checked_in,
    COUNT(DISTINCT CASE WHEN DATE(a.check_in) = target_date AND a.check_out IS NOT NULL THEN a.employee_id END)::BIGINT as checked_out,
    COUNT(CASE WHEN DATE(a.check_in) = target_date AND a.overtime_requested THEN 1 END)::BIGINT as overtime_requests,
    COUNT(CASE WHEN DATE(a.check_in) = target_date AND a.overtime_approved THEN 1 END)::BIGINT as overtime_approved
  FROM users u
  LEFT JOIN attendance a ON u.id = a.employee_id
  WHERE u.role = 'employee';
END;
$$ LANGUAGE plpgsql;

-- Función para obtener empleados que no han marcado hoy
CREATE OR REPLACE FUNCTION get_absent_employees(target_date DATE)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  department TEXT,
  position TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.department, u.position
  FROM users u
  WHERE u.role = 'employee'
  AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.employee_id = u.id
    AND DATE(a.check_in) = target_date
  );
END;
$$ LANGUAGE plpgsql;