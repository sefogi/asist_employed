import { supabase } from './client';
import type { AttendanceRecord, CreateAttendanceDTO, UpdateAttendanceDTO } from '@/types';

export const attendanceService = {
  async getAll(): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('check_in', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }

    return data;
  },

  async getByEmployeeId(employeeId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('check_in', { ascending: false });

    if (error) {
      console.error('Error fetching employee attendance:', error);
      throw error;
    }

    return data;
  },

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('check_in', `${date}T00:00:00`)
      .lte('check_in', `${date}T23:59:59`)
      .order('check_in', { ascending: true });

    if (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }

    return data;
  },

  async getTodayByEmployeeId(employeeId: string): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('check_in', `${today}T00:00:00`)
      .lte('check_in', `${today}T23:59:59`)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching today attendance:', error);
      throw error;
    }

    return data;
  },

  async create(attendance: CreateAttendanceDTO): Promise<AttendanceRecord> {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendance])
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: UpdateAttendanceDTO): Promise<AttendanceRecord> {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  }
};