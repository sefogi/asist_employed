import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/api/notifications';
import type { Notification } from '@/types';

// enabled: solo el admin puede ver notificaciones
export const useNotifications = (enabled: boolean) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getAll();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [enabled, fetchNotifications]);

  const deleteNotification = async (id: string): Promise<void> => {
    await notificationsService.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    loading,
    error,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
