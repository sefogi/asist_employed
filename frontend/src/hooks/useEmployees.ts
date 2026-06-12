import { useState, useEffect, useCallback } from 'react';
import { employeesService } from '@/services/api/employees';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/types';

// enabled: solo el admin puede listar empleados; evita llamadas 403 innecesarias
export const useEmployees = (enabled: boolean) => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Carga inicial de datos: el setLoading síncrono dentro del fetch es intencional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  }, [enabled, fetchEmployees]);

  const createEmployee = async (employeeData: CreateUserDTO): Promise<void> => {
    const newEmployee = await employeesService.create(employeeData);
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = async (id: string, updates: UpdateUserDTO): Promise<void> => {
    const updated = await employeesService.update(id, updates);
    setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const deleteEmployee = async (id: string): Promise<void> => {
    await employeesService.delete(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    // Derivado: deshabilitado (p. ej. tras logout) no expone datos antiguos
    employees: enabled ? employees : [],
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
};
