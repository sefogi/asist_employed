import { useState, useEffect } from 'react';
import { notificationsService } from '@/services/supabase/notifications';
import type { Notification, CreateNotificationDTO } from '@/types';

export const useNotifications = () => {
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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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

  return {
    notifications,
    loading,
    error,
    createNotification,
    markAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};