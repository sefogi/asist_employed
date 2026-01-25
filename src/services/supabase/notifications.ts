import { supabase } from './client';
import type { Notification, CreateNotificationDTO } from '@/types';

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data;
  },

  async getUnread(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }

    return data;
  },

  async getByType(type: 'overtime_request' | 'approval' | 'info'): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', type)
      .order('timestamp', { ascending: false});

    if (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }

    return data;
  },

  async create(notification: CreateNotificationDTO): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};