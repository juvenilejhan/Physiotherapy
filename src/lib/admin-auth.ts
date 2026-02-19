import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole, canAccessAdmin, canManageUser, canManageBilling, canViewAllPatients, canManageContent, hasPermission } from './rbac';
import { db } from './db';

/**
 * Get the current authenticated user with session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      staffProfile: {
        include: {
          services: true,
        },
      },
      patientProfile: true,
    },
  });

  return user;
}

/**
 * Require authentication and return user
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

/**
 * Require admin access
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  if (!user.role || !canAccessAdmin(user.role as UserRole)) {
    redirect('/dashboard');
  }

  return user;
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: string) {
  const user = await requireAuth();
  
  if (!user.role || !hasPermission(user.role as UserRole, permission)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

/**
 * Require billing management access
 */
export async function requireBillingAccess() {
  const user = await requireAuth();
  
  if (!user.role || !canManageBilling(user.role as UserRole)) {
    throw new Error('Insufficient permissions for billing');
  }

  return user;
}

/**
 * Require patient management access
 */
export async function requirePatientAccess() {
  const user = await requireAuth();
  
  if (!user.role || !canViewAllPatients(user.role as UserRole)) {
    throw new Error('Insufficient permissions for patient management');
  }

  return user;
}

/**
 * Require content management access
 */
export async function requireContentAccess() {
  const user = await requireAuth();
  
  if (!user.role || !canManageContent(user.role as UserRole)) {
    throw new Error('Insufficient permissions for content management');
  }

  return user;
}
