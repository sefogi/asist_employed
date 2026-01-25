import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center bg-white rounded-lg shadow-lg p-6">
      <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
      <div className="text-4xl font-bold text-gray-800 mb-1">
        {time.toLocaleTimeString('es-ES')}
      </div>
      <div className="text-sm text-gray-600">
        {time.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
};

export default LiveClock;