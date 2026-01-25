export const WORK_HOURS = 8;
export const WORK_START_HOUR = 9; // 9 AM
export const WORK_END_HOUR = 17; // 5 PM

export const ROLES = {
  EMPLOYEE: 'employee' as const,
  ADMIN: 'admin' as const,
};

export const NOTIFICATION_TYPES = {
  OVERTIME_REQUEST: 'overtime_request' as const,
  APPROVAL: 'approval' as const,
  INFO: 'info' as const,
};

export const ALERT_DURATION = 5000; // milliseconds