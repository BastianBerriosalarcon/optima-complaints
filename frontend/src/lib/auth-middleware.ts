import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { type UserRole } from '@/hooks/useAuth'; // Correcto: importar desde useAuth

// Configuración de rutas protegidas simplificada
interface RouteConfig {
  path: string;
  requiredRoles: UserRole[];
  redirectTo?: string;
}

// Rutas protegidas actualizadas para el módulo de reclamos
const PROTECTED_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    requiredRoles: [
      'super_admin',
      'admin_concesionario',
      'jefe_servicio',
      'asesor_servicio',
      'contact_center',
      'encargado_calidad',
    ],
    redirectTo: '/sign-in',
  },
  {
    path: '/dashboard/reclamos',
    requiredRoles: [
      'super_admin',
      'admin_concesionario',
      'jefe_servicio',
      'asesor_servicio',
      'contact_center',
      'encargado_calidad',
    ],
    redirectTo: '/dashboard',
  },
  {
    path: '/dashboard/admin',
    requiredRoles: ['super_admin', 'admin_concesionario'],
    redirectTo: '/dashboard',
  },
  {
    path: '/dashboard/usuarios',
    requiredRoles: ['super_admin', 'admin_concesionario'],
    redirectTo: '/dashboard',
  },
  {
    path: '/dashboard/config',
    requiredRoles: ['super_admin'],
    redirectTo: '/dashboard',
  },
];

// Función de verificación de acceso simplificada
function hasRequiredAccess(userRole: UserRole, routeConfig: RouteConfig): boolean {
  return routeConfig.requiredRoles.includes(userRole);
}

// Middleware principal de autenticación
export async function authMiddleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // La configuración de Supabase se asume que está en variables de entorno
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const routeConfig = PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));

  if (!routeConfig) {
    return response;
  }

  if (!session) {
    const redirectUrl = new URL(routeConfig.redirectTo || '/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('role, is_active')
      .eq('auth_user_id', session.user.id)
      .single();

    if (!userProfile?.is_active) {
      const redirectUrl = new URL('/sign-in?error=account_disabled', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (!hasRequiredAccess(userProfile.role as UserRole, routeConfig)) {
      const redirectUrl = new URL(routeConfig.redirectTo || '/dashboard', request.url);
      redirectUrl.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error verifying permissions:', error);
    const redirectUrl = new URL('/sign-in?error=profile_error', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
