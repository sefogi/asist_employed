import { supabase } from './client';
import type { User, LoginCredentials } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .eq('password', credentials.password)
      .single();

    if (error) {
      console.error('Login error:', error);
      return null;
    }

    return data;
  },

  async getCurrentUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    return data;
  },

  async validateSession(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    return !error && !!data;
  }
};