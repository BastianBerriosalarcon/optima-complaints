"use client";

import { ReactNode } from 'react';
import { useRole, type Permission } from '@/hooks/useRole';
import { type UserRole } from '@/hooks/useAuth';

interface RoleGuardProps {
  children: ReactNode;
  
  // Control por rol específico
  requiredRole?: UserRole | UserRole[];
  
  // Control por permisos específicos
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean; // true = requiere TODOS los permisos, false = requiere AL MENOS UNO
  
  // Control por módulo
  requiredModule?: 'ventas' | 'post-venta' | 'admin';
  
  // Componente a mostrar cuando no tiene acceso
  fallback?: ReactNode;
  
  // Si debe mostrar error o simplemente ocultar
  hideOnNoAccess?: boolean;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
  requiredModule,
  fallback = <div className="text-red-500 p-4">No tienes permisos para ver este contenido</div>,
  hideOnNoAccess = false
}: RoleGuardProps) {
  const {
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess: canAccessModule
  } = useRole();

  // Verificar acceso por rol
  if (requiredRole) {
    const hasRole = Array.isArray(requiredRole)
      ? requiredRole.includes(role as UserRole)
      : role === requiredRole;

    if (!hasRole) {
      return hideOnNoAccess ? null : fallback;
    }
  }

  // Verificar acceso por permiso único
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return hideOnNoAccess ? null : fallback;
    }
  }

  // Verificar acceso por múltiples permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return hideOnNoAccess ? null : fallback;
    }
  }

  // Verificar acceso por módulo
  if (requiredModule) {
    if (!canAccessModule(requiredModule)) {
      return hideOnNoAccess ? null : fallback;
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>;
}

// Componentes especializados para casos comunes
export function AdminOnly({ 
  children, 
  fallback,
  hideOnNoAccess = false 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
  hideOnNoAccess?: boolean;
}) {
  return (
    <RoleGuard 
      requiredRole={['super_admin', 'admin_concesionario']}
      fallback={fallback}
      hideOnNoAccess={hideOnNoAccess}
    >
      {children}
    </RoleGuard>
  );
}

export function SalesOnly({ 
  children, 
  fallback,
  hideOnNoAccess = false 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
  hideOnNoAccess?: boolean;
}) {
  return (
    <RoleGuard 
      requiredModule="ventas"
      fallback={fallback}
      hideOnNoAccess={hideOnNoAccess}
    >
      {children}
    </RoleGuard>
  );
}

export function ServiceOnly({
  children,
  fallback,
  hideOnNoAccess = false
}: {
  children: ReactNode;
  fallback?: ReactNode;
  hideOnNoAccess?: boolean;
}) {
  return (
    <RoleGuard
      requiredModule="post-venta"
      fallback={fallback}
      hideOnNoAccess={hideOnNoAccess}
    >
      {children}
    </RoleGuard>
  );
}

export function ConfigOnly({
  children,
  fallback,
  hideOnNoAccess = false
}: {
  children: ReactNode;
  fallback?: ReactNode;
  hideOnNoAccess?: boolean;
}) {
  return (
    <RoleGuard
      requiredModule="admin"
      fallback={fallback}
      hideOnNoAccess={hideOnNoAccess}
    >
      {children}
    </RoleGuard>
  );
}