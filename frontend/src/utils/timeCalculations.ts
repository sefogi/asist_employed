export const calculateHoursWorked = (
  checkIn: string,
  checkOut: string | null
): number => {
  if (!checkOut) return 0;
  
  const checkInTime = new Date(checkIn);
  const checkOutTime = new Date(checkOut);
  
  return (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
};

export const formatHours = (hours: number): string => {
  return `${hours.toFixed(1)} hrs`;
};

export const getTimeDifference = (
  loginTime: string,
  checkInTime: string | null
): string => {
  if (!checkInTime) return 'Sin marcar';
  
  const login = new Date(loginTime);
  const checkIn = new Date(checkInTime);
  const diffMinutes = Math.round((checkIn.getTime() - login.getTime()) / (1000 * 60));
  
  if (diffMinutes === 0) return 'Inmediato';
  if (diffMinutes < 0) return `${Math.abs(diffMinutes)} min antes`;
  return `${diffMinutes} min después`;
};

export const isToday = (date: string): boolean => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return (
    today.getDate() === compareDate.getDate() &&
    today.getMonth() === compareDate.getMonth() &&
    today.getFullYear() === compareDate.getFullYear()
  );
};