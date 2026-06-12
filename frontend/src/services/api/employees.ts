import { api } from './client';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/types';

export const employeesService = {
  getAll: (): Promise<User[]> => api.get<User[]>('/employees'),

  getById: (id: string): Promise<User> => api.get<User>(`/employees/${id}`),

  create: (employee: CreateUserDTO): Promise<User> =>
    api.post<User>('/employees', employee),

  update: (id: string, updates: UpdateUserDTO): Promise<User> =>
    api.patch<User>(`/employees/${id}`, updates),

  delete: (id: string): Promise<void> => api.delete<void>(`/employees/${id}`),
};
