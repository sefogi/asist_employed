import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationsService } from '@/services/supabase/notifications';
import type { Notification, CreateNotificationDTO } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  createNotification: (data: CreateNotificationDTO) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getUnread();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: CreateNotificationDTO): Promise<void> => {
    try {
      const newNotification = await notificationsService.create(notificationData);
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear notificación');
    }
  };

  const markAsRead = async (id: string): Promise<void> => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al marcar como leída');
    }
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      await notificationsService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar notificación');
    }
  };

  const value: NotificationContextType = {
    notifications,
    loading,
    error,
    unreadCount: notifications.filter(n => !n.read).length,
    createNotification,
    markAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};