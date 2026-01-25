import React from 'react';
import { Users, User } from 'lucide-react';
import type { EmployeeListProps } from '@/types';

const EmployeeList: React.FC<EmployeeListProps> = ({ employees }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
        <Users className="w-6 h-6 text-indigo-600" />
        Lista de Empleados ({employees.filter(e => e.role === 'employee').length})
      </h3>
      <div className="space-y-2">
        {employees.filter(e => e.role === 'employee').map(employee => (
          <div key={employee.id} className="bg-gray-50 p-4 rounded-lg border hover:border-indigo-300 transition">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{employee.position}</p>
                <p className="text-xs text-gray-500">{employee.department}</p>
              </div>
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">
                ID: {employee.id.toString().padStart(4, '0')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;