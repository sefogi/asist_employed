-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
-- Los empleados solo pueden ver su propia información
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (id = auth.uid() OR role = 'admin');

-- Solo admins pueden insertar usuarios
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden actualizar usuarios
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para ATTENDANCE
-- Los empleados pueden ver su propia asistencia
CREATE POLICY "Employees can view own attendance"
  ON attendance FOR SELECT
  USING (
    employee_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los empleados pueden insertar su propia asistencia
CREATE POLICY "Employees can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Los empleados pueden actualizar su propia asistencia
CREATE POLICY "Employees can update own attendance"
  ON attendance FOR UPDATE
  USING (employee_id = auth.uid());

-- Los admins pueden actualizar cualquier asistencia
CREATE POLICY "Admins can update any attendance"
  ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para LOGIN_LOGS
-- Los empleados pueden ver sus propios logs
CREATE POLICY "Employees can view own logs"
  ON login_logs FOR SELECT
  USING (
    employee_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los empleados pueden insertar sus propios logs
CREATE POLICY "Employees can insert own logs"
  ON login_logs FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Políticas para NOTIFICATIONS
-- Los admins pueden ver todas las notificaciones
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los empleados pueden insertar notificaciones
CREATE POLICY "Employees can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Los admins pueden actualizar notificaciones
CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los admins pueden eliminar notificaciones
CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );