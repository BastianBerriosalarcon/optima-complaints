import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { type UserRole } from '@/hooks/useAuth';
import { type Permission } from '@/hooks/useRole';
import { config } from '@optimacx/shared/config/ConfigService';

// Configuración de rutas protegidas
interface RouteConfig {
  path: string;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  redirectTo?: string;
}

// Configuración de rutas del sistema
const PROTECTED_ROUTES: RouteConfig[] = [
  // Dashboard principal - cualquier usuario autenticado
  {
    path: '/dashboard',
    requiredRoles: [
      'super_admin', 'admin_concesionario', 'gerente_ventas', 
      'asesor_ventas', 'jefe_servicio', 'asesor_servicio', 
      'contact_center', 'encargado_calidad', 'marketing'
    ],
    redirectTo: '/sign-in'
  },
  
  // Módulo de Ventas
  {
    path: '/dashboard/ventas',
    requiredPermissions: ['leads:view'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/ventas/leads',
    requiredPermissions: ['leads:view'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/ventas/cotizaciones',
    requiredPermissions: ['cotizaciones:view'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/ventas/productos',
    requiredPermissions: ['productos:view'],
    redirectTo: '/dashboard'
  },
  
  // Módulo Post-Venta
  {
    path: '/dashboard/encuestas',
    requiredPermissions: ['encuestas:view'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/reclamos',
    requiredPermissions: ['reclamos:view'],
    redirectTo: '/dashboard'
  },
  
  // Configuración - Solo admins
  {
    path: '/dashboard/admin',
    requiredRoles: ['super_admin', 'admin_concesionario'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/usuarios',
    requiredPermissions: ['usuarios:view'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/config',
    requiredPermissions: ['config:view'],
    redirectTo: '/dashboard'
  },
  
  // Métricas
  {
    path: '/dashboard/metrics',
    requiredPermissions: ['metrics:view'],
    redirectTo: '/dashboard'
  },
  {
    path: '/dashboard/reports',
    requiredPermissions: ['reports:view'],
    redirectTo: '/dashboard'
  }
];

// Función para verificar si el usuario tiene los permisos necesarios
function hasRequiredAccess(
  userRole: UserRole,
  routeConfig: RouteConfig
): boolean {
  // Verificar por roles si están definidos
  if (routeConfig.requiredRoles) {
    return routeConfig.requiredRoles.includes(userRole);
  }
  
  // Verificar por permisos si están definidos
  if (routeConfig.requiredPermissions) {
    // Aquí deberías implementar la lógica de permisos
    // Por ahora, mapeo básico de roles a permisos
    return hasPermissionsByRole(userRole, routeConfig.requiredPermissions);
  }
  
  return true;
}

// Mapeo simplificado de roles a permisos para el middleware
function hasPermissionsByRole(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions: Record<UserRole, Permission[]> = {
    super_admin: [
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
      'leads:view', 'leads:create', 'leads:edit', 'leads:assign',
      'cotizaciones:view', 'cotizaciones:create', 'cotizaciones:edit',
      'ventas:view', 'ventas:create', 'ventas:edit',
      'usuarios:view',
      'productos:view', 'productos:create', 'productos:edit',
      'metrics:view', 'reports:view', 'reports:export'
    ],
    asesor_ventas: [
      'leads:view', 'leads:create', 'leads:edit',
      'cotizaciones:view', 'cotizaciones:create', 'cotizaciones:edit',
      'ventas:view', 'ventas:create', 'ventas:edit',
      'productos:view',
      'metrics:view'
    ],
    jefe_servicio: [
      'encuestas:view', 'encuestas:create', 'encuestas:edit',
      'reclamos:view', 'reclamos:create', 'reclamos:edit', 'reclamos:assign',
      'usuarios:view',
      'metrics:view', 'reports:view', 'reports:export'
    ],
    asesor_servicio: [
      'encuestas:view', 'encuestas:create', 'encuestas:edit',
      'reclamos:view', 'reclamos:create', 'reclamos:edit',
      'metrics:view'
    ],
    contact_center: [
      'encuestas:view', 'encuestas:create', 'encuestas:edit',
      'reclamos:view', 'reclamos:create',
      'leads:view', 'leads:create',
      'metrics:view'
    ],
    encargado_calidad: [
      'encuestas:view', 'encuestas:create', 'encuestas:edit',
      'reclamos:view', 'reclamos:create', 'reclamos:edit',
      'metrics:view', 'reports:view', 'reports:export'
    ],
    marketing: [
      'leads:view',
      'metrics:view', 'reports:view'
    ]
  };
  
  const userPermissions = rolePermissions[role] || [];
  return permissions.some(permission => userPermissions.includes(permission));
}

// Middleware principal de autenticación
export async function authMiddleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const dbConfig = config.getDatabaseConfig();
  const supabase = createServerClient(
    dbConfig.url,
    dbConfig.key,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession();
  
  const { pathname } = request.nextUrl;
  
  // Buscar configuración de la ruta actual
  const routeConfig = PROTECTED_ROUTES.find(route => 
    pathname.startsWith(route.path)
  );
  
  // Si la ruta no está protegida, continuar
  if (!routeConfig) {
    return response;
  }
  
  // Si no hay sesión y la ruta está protegida, redirigir al login
  if (!session) {
    const redirectUrl = new URL(routeConfig.redirectTo || '/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Obtener perfil del usuario para verificar rol
  try {
    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('role, activo')
      .eq('id', session.user.id)
      .single();
    
    // Si el usuario no está activo, redirigir
    if (!userProfile?.activo) {
      const redirectUrl = new URL('/sign-in?error=account_disabled', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Verificar permisos
    if (!hasRequiredAccess(userProfile.role, routeConfig)) {
      const redirectUrl = new URL(routeConfig.redirectTo || '/dashboard', request.url);
      redirectUrl.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(redirectUrl);
    }
    
  } catch (error) {
    console.error('Error verificando permisos:', error);
    const redirectUrl = new URL('/sign-in?error=profile_error', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}

// Función helper para usar en getServerSideProps o API routes
export async function requireAuth(
  requiredRole?: UserRole[],
  requiredPermissions?: Permission[]
) {
  // Esta función se puede usar en pages que necesiten verificación server-side
  return {
    requiredRole,
    requiredPermissions
  };
}