import { supabase } from './client';
import type { User, CreateUserDTO } from '@/types';

export const employeesService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    return data;
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }

    return data;
  },

  async getEmployees(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    return data;
  },

  async create(employee: CreateUserDTO): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...employee,
        role: 'employee'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
};