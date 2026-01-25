-- Insertar usuarios iniciales (contraseñas hasheadas - en producción usar bcrypt)
INSERT INTO users (id, email, name, password, role, department, position) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@empresa.com', 'Admin Sistema', 'admin', 'admin', 'Administración', 'Gerente'),
  ('22222222-2222-2222-2222-222222222222', 'juan@empresa.com', 'Juan Pérez', '1234', 'employee', 'Ventas', 'Ejecutivo'),
  ('33333333-3333-3333-3333-333333333333', 'maria@empresa.com', 'María González', '1234', 'employee', 'Marketing', 'Diseñadora'),
  ('44444444-4444-4444-4444-444444444444', 'carlos@empresa.com', 'Carlos Ruiz', '1234', 'employee', 'IT', 'Desarrollador');

-- Insertar algunos registros de prueba de asistencia
INSERT INTO attendance (employee_id, employee_name, check_in, check_out, overtime_requested, overtime_approved) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Juan Pérez', TIMEZONE('utc', NOW()) - INTERVAL '1 day' + INTERVAL '9 hours', TIMEZONE('utc', NOW()) - INTERVAL '1 day' + INTERVAL '18 hours', true, true),
  ('33333333-3333-3333-3333-333333333333', 'María González', TIMEZONE('utc', NOW()) - INTERVAL '1 day' + INTERVAL '8 hours 30 minutes', TIMEZONE('utc', NOW()) - INTERVAL '1 day' + INTERVAL '17 hours', false, false),
  ('44444444-4444-4444-4444-444444444444', 'Carlos Ruiz', TIMEZONE('utc', NOW()) - INTERVAL '1 day' + INTERVAL '9 hours 15 minutes', TIMEZONE('utc', NOW()) - INTERVAL '1 day' + INTERVAL '17 hours 30 minutes', false, false);