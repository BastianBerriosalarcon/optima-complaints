"use client";

import { useAuth, type UserRole } from "./useAuth";

// Permisos específicos por módulo
export type Permission = 
  // Ventas
  | 'leads:view'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:assign'
  | 'cotizaciones:view'
  | 'cotizaciones:create'
  | 'cotizaciones:edit'
  | 'ventas:view'
  | 'ventas:create'
  | 'ventas:edit'
  // Post-venta
  | 'encuestas:view'
  | 'encuestas:create'
  | 'encuestas:edit'
  | 'reclamos:view'
  | 'reclamos:create'
  | 'reclamos:edit'
  | 'reclamos:assign'
  // Configuración
  | 'config:view'
  | 'config:edit'
  | 'usuarios:view'
  | 'usuarios:create'
  | 'usuarios:edit'
  | 'productos:view'
  | 'productos:create'
  | 'productos:edit'
  // Métricas
  | 'metrics:view'
  | 'reports:view'
  | 'reports:export';

// Matriz de permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Tiene todos los permisos
    'leads:view', 'leads:create', 'leads:edit', 'leads:assign',
    'cotizaciones:view', 'cotizaciones:create', 'cotizaciones:edit',
    'ventas:view', 'ventas:create', 'ventas:edit',
    'encuestas:view', 'encuestas:create', 'encuestas:edit',
    'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
    'config:view', 'config:edit',
    'usuarios:view', 'usuarios:create', 'usuarios:edit',
    'productos:view', 'productos:create', 'productos:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  
  admin_concesionario: [
    // Administrador del concesionario - casi todos los permisos
    'leads:view', 'leads:create', 'leads:edit', 'leads:assign',
    'cotizaciones:view', 'cotizaciones:create', 'cotizaciones:edit',
    'ventas:view', 'ventas:create', 'ventas:edit',
    'encuestas:view', 'encuestas:create', 'encuestas:edit',
    'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
    'config:view', 'config:edit',
    'usuarios:view', 'usuarios:create', 'usuarios:edit',
    'productos:view', 'productos:create', 'productos:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  
  gerente_ventas: [
    // Gerente de ventas - enfoque en módulo ventas
    'leads:view', 'leads:create', 'leads:edit', 'leads:assign',
    'cotizaciones:view', 'cotizaciones:create', 'cotizaciones:edit',
    'ventas:view', 'ventas:create', 'ventas:edit',
    'usuarios:view', // Solo ver usuarios de ventas
    'productos:view', 'productos:create', 'productos:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  
  asesor_ventas: [
    // Asesor de ventas - solo sus leads y operaciones básicas
    'leads:view', // Solo sus leads asignados
    'leads:create', 'leads:edit', // Solo los que le asignen
    'cotizaciones:view', 'cotizaciones:create', 'cotizaciones:edit',
    'ventas:view', 'ventas:create', 'ventas:edit',
    'productos:view',
    'metrics:view' // Solo sus métricas
  ],
  
  jefe_servicio: [
    // Jefe de servicio - enfoque en post-venta
    'encuestas:view', 'encuestas:create', 'encuestas:edit',
    'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
    'usuarios:view', // Solo usuarios de servicio
    'metrics:view', 'reports:view', 'reports:export'
  ],
  
  asesor_servicio: [
    // Asesor de servicio - operaciones básicas post-venta
    'encuestas:view', 'encuestas:create', 'encuestas:edit',
    'reclamos:view', 'reclamos:create', 'reclamos:edit',
    'metrics:view'
  ],
  
  contact_center: [
    // Contact center - gestión de encuestas y seguimiento
    'encuestas:view', 'encuestas:create', 'encuestas:edit',
    'reclamos:view', 'reclamos:create',
    'leads:view', 'leads:create', // Pueden generar leads
    'metrics:view'
  ],
  
  encargado_calidad: [
    // Encargado de calidad - análisis y reportes
    'encuestas:view', 'encuestas:create', 'encuestas:edit',
    'reclamos:view', 'reclamos:create', 'reclamos:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  
  marketing: [
    // Marketing - métricas y leads (datos anonimizados)
    'leads:view', // Solo métricas, no datos personales
    'metrics:view', 'reports:view'
  ]
};

export interface RoleHook {
  role: UserRole | null;
  concesionarioId: string | null;
  isRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessModule: (module: 'ventas' | 'post_venta' | 'config' | 'metrics') => boolean;
}

export function useRole(): RoleHook {
  const { profile, isAuthenticated } = useAuth();

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !profile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    
    return profile.role === role;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !profile) return false;
    
    const userPermissions = ROLE_PERMISSIONS[profile.role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessModule = (module: 'ventas' | 'post_venta' | 'config' | 'metrics'): boolean => {
    if (!isAuthenticated || !profile) return false;
    
    switch (module) {
      case 'ventas':
        return hasAnyPermission(['leads:view', 'cotizaciones:view', 'ventas:view']);
      
      case 'post_venta':
        return hasAnyPermission(['encuestas:view', 'reclamos:view']);
      
      case 'config':
        return hasAnyPermission(['config:view', 'usuarios:view', 'productos:view']);
      
      case 'metrics':
        return hasPermission('metrics:view');
      
      default:
        return false;
    }
  };

  return {
    role: profile?.role || null,
    concesionarioId: profile?.concesionario_id || null,
    isRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule
  };
}