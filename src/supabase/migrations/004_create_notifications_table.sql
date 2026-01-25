-- Crear tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('overtime_request', 'approval', 'info')),
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices
CREATE INDEX idx_notifications_employee_id ON notifications(employee_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp);

-- Comentarios
COMMENT ON TABLE notifications IS 'Notificaciones del sistema';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: overtime_request, approval, info';