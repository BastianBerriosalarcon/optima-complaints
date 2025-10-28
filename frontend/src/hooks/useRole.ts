import { useAuth } from './useAuth';

// Permisos granulares del sistema
export type Permission =
  | 'reclamos:view'
  | 'reclamos:create'
  | 'reclamos:edit'
  | 'reclamos:assign'
  | 'config:view'
  | 'config:edit'
  | 'usuarios:view'
  | 'usuarios:create'
  | 'usuarios:edit'
  | 'metrics:view'
  | 'reports:view'
  | 'reports:export';

// Mapeo de roles a permisos
const rolePermissions: Record<string, Permission[]> = {
  super_admin: [
    'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
    'config:view', 'config:edit',
    'usuarios:view', 'usuarios:create', 'usuarios:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  admin_concesionario: [
    'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
    'config:view', 'config:edit',
    'usuarios:view', 'usuarios:create', 'usuarios:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  jefe_servicio: [
    'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
    'usuarios:view',
    'metrics:view', 'reports:view', 'reports:export'
  ],
  asesor_servicio: [
    'reclamos:view', 'reclamos:create', 'reclamos:edit',
    'metrics:view'
  ],
  contact_center: [
    'reclamos:view', 'reclamos:create',
    'metrics:view'
  ],
  encargado_calidad: [
    'reclamos:view', 'reclamos:create', 'reclamos:edit',
    'metrics:view', 'reports:view', 'reports:export'
  ],
};

export const useRole = () => {
  const { user } = useAuth();
  const role = user?.role || '';

  const hasPermission = (permission: Permission): boolean => {
    if (role === 'super_admin') return true;
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (role === 'super_admin') return true;
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (role === 'super_admin') return true;
    return permissions.every(p => hasPermission(p));
  };

  const canAccess = (module: 'ventas' | 'post-venta' | 'admin'): boolean => {
    if (module === 'ventas') {
      return hasAnyPermission(['reclamos:view']); // Solo reclamos en este proyecto
    }
    if (module === 'post-venta') {
      return hasAnyPermission(['reclamos:view']); // Solo reclamos en este proyecto
    }
    if (module === 'admin') {
      return hasAnyPermission(['config:view', 'usuarios:view']);
    }
    return false;
  };

  return { user, role, hasPermission, hasAnyPermission, hasAllPermissions, canAccess };
};