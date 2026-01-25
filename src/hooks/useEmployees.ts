import { useState, useEffect } from 'react';
import { employeesService } from '@/services/supabase/employees';
import type { User, CreateUserDTO } from '@/types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesService.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: CreateUserDTO): Promise<void> => {
    try {
      const newEmployee = await employeesService.create(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear empleado');
    }
  };

  const updateEmployee = async (id: string, updates: Partial<User>): Promise<void> => {
    try {
      const updated = await employeesService.update(id, updates);
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar empleado');
    }
  };

  const deleteEmployee = async (id: string): Promise<void> => {
    try {
      await employeesService.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar empleado');
    }
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees
  };
};