import React from 'react';
import { User } from 'lucide-react';
import type { EmployeeProfileProps } from '@/types';

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ user }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-indigo-100">{user.position}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-xs text-indigo-100">Departamento</p>
          <p className="font-semibold">{user.department}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-xs text-indigo-100">ID Empleado</p>
          <p className="font-semibold">EMP-{user.id.toString().padStart(4, '0')}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;