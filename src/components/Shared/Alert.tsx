import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { AlertProps } from '@/types';

const Alert: React.FC<AlertProps> = ({ alert, onClose }) => {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  if (!alert) return null;

  const styles: Record<string, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className={`${styles[alert.type]} p-4 rounded-lg border-2 flex items-center gap-3 animate-pulse`}>
      {alert.type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium flex-1">{alert.message}</span>
    </div>
  );
};

export default Alert;