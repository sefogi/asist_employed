-- Crear tabla de logs de login
CREATE TABLE login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices
CREATE INDEX idx_login_logs_employee_id ON login_logs(employee_id);
CREATE INDEX idx_login_logs_date ON login_logs(DATE(login_time));
CREATE INDEX idx_login_logs_time ON login_logs(login_time);

-- Comentarios
COMMENT ON TABLE login_logs IS 'Registro de inicios de sesión de empleados';