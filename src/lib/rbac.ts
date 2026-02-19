export type UserRole = 'SUPER_ADMIN' | 'CLINIC_MANAGER' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

export interface RolePermissions {
  [key: string]: string[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  SUPER_ADMIN: [
    // User Management
    'users:view',
    'users:create',
    'users:update',
    'users:delete',
    'users:manage_roles',
    
    // Staff Management
    'staff:view',
    'staff:create',
    'staff:update',
    'staff:delete',
    'staff:manage_schedule',
    
    // Services
    'services:view',
    'services:create',
    'services:update',
    'services:delete',
    
    // Appointments
    'appointments:view',
    'appointments:create',
    'appointments:update',
    'appointments:delete',
    'appointments:cancel',
    'appointments:reschedule',
    'appointments:manage_all',
    
    // Patients
    'patients:view',
    'patients:create',
    'patients:update',
    'patients:delete',
    'patients:view_medical_history',
    'patients:manage_consent_forms',
    
    // Billing
    'billing:view',
    'billing:create',
    'billing:update',
    'billing:delete',
    'billing:manage_payments',
    
    // Content Management
    'content:view',
    'content:create',
    'content:update',
    'content:delete',
    
    // Reports
    'reports:view',
    'reports:export',
    
    // Settings
    'settings:view',
    'settings:update',
    
    // Calendar
    'calendar:view',
    'calendar:manage',
  ],
  CLINIC_MANAGER: [
    'users:view',
    'staff:view',
    'staff:create',
    'staff:update',
    'staff:manage_schedule',
    'services:view',
    'services:create',
    'services:update',
    'appointments:view',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'appointments:reschedule',
    'appointments:manage_all',
    'patients:view',
    'patients:create',
    'patients:update',
    'patients:view_medical_history',
    'patients:manage_consent_forms',
    'billing:view',
    'billing:create',
    'billing:update',
    'billing:manage_payments',
    'content:view',
    'content:create',
    'content:update',
    'content:delete',
    'reports:view',
    'reports:export',
    'settings:view',
    'settings:update',
    'calendar:view',
    'calendar:manage',
  ],
  DOCTOR: [
    'appointments:view',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'appointments:reschedule',
    'patients:view',
    'patients:update',
    'patients:view_medical_history',
    'patients:manage_consent_forms',
    'services:view',
    'calendar:view',
    'calendar:manage',
    'billing:view',
  ],
  RECEPTIONIST: [
    'appointments:view',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'appointments:reschedule',
    'patients:view',
    'patients:create',
    'patients:update',
    'services:view',
    'calendar:view',
    'billing:view',
    'billing:create',
    'billing:update',
  ],
  PATIENT: [
    'appointments:view',
    'appointments:create',
    'appointments:cancel',
    'appointments:reschedule',
    'patients:view_own',
    'patients:update_own',
    'billing:view_own',
  ],
};

// Role hierarchy (higher number = more power)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  CLINIC_MANAGER: 80,
  DOCTOR: 60,
  RECEPTIONIST: 40,
  PATIENT: 20,
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  CLINIC_MANAGER: 'Clinic Manager',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// Check if user can manage another user
export function canManageUser(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
}

// Get all users with role equal to or lower than specified level
export function getAccessibleRoles(userRole: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= userLevel)
    .map(([role]) => role as UserRole);
}

// Check if user can access admin panel
export function canAccessAdmin(role: UserRole): boolean {
  return ['SUPER_ADMIN', 'CLINIC_MANAGER', 'DOCTOR', 'RECEPTIONIST'].includes(role);
}

// Check if user can manage billing
export function canManageBilling(role: UserRole): boolean {
  return hasPermission(role, 'billing:manage_payments');
}

// Check if user can view all patients
export function canViewAllPatients(role: UserRole): boolean {
  return hasPermission(role, 'patients:view');
}

// Check if user can manage content
export function canManageContent(role: UserRole): boolean {
  return hasPermission(role, 'content:create');
}
