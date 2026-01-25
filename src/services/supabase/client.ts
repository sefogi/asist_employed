import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de la base de datos
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password: string;
          role: 'employee' | 'admin';
          department: string;
          position: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password: string;
          role?: 'employee' | 'admin';
          department: string;
          position: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password?: string;
          role?: 'employee' | 'admin';
          department?: string;
          position?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          employee_name: string;
          check_in: string;
          check_out: string | null;
          overtime_requested: boolean;
          overtime_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          employee_name: string;
          check_in: string;
          check_out?: string | null;
          overtime_requested?: boolean;
          overtime_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          employee_name?: string;
          check_in?: string;
          check_out?: string | null;
          overtime_requested?: boolean;
          overtime_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      login_logs: {
        Row: {
          id: string;
          employee_id: string;
          employee_name: string;
          login_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          employee_name: string;
          login_time?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          employee_name?: string;
          login_time?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          employee_id: string;
          employee_name: string;
          message: string;
          type: 'overtime_request' | 'approval' | 'info';
          read: boolean;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          employee_name: string;
          message: string;
          type: 'overtime_request' | 'approval' | 'info';
          read?: boolean;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          employee_name?: string;
          message?: string;
          type?: 'overtime_request' | 'approval' | 'info';
          read?: boolean;
          timestamp?: string;
          created_at?: string;
        };
      };
    };
  };
};