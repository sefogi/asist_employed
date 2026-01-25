import { supabase } from './client';
import type { LoginLog, CreateLoginLogDTO } from '@/types';

export const loginLogsService = {
  async getAll(): Promise<LoginLog[]> {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('login_time', { ascending: false });

    if (error) {
      console.error('Error fetching login logs:', error);
      throw error;
    }

    return data;
  },

  async getByEmployeeId(employeeId: string): Promise<LoginLog[]> {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .order('login_time', { ascending: false});

    if (error) {
      console.error('Error fetching employee login logs:', error);
      throw error;
    }

    return data;
  },

  async getByDate(date: string): Promise<LoginLog[]> {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .gte('login_time', `${date}T00:00:00`)
      .lte('login_time', `${date}T23:59:59`)
      .order('login_time', { ascending: true });

    if (error) {
      console.error('Error fetching login logs by date:', error);
      throw error;
    }

    return data;
  },

  async getToday(): Promise<LoginLog[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today);
  },

  async create(loginLog: CreateLoginLogDTO): Promise<LoginLog> {
    const { data, error } = await supabase
      .from('login_logs')
      .insert([loginLog])
      .select()
      .single();

    if (error) {
      console.error('Error creating login log:', error);
      throw error;
    }

    return data;
  }
};