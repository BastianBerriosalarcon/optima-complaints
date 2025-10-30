import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Obtener sesión del usuario
  const { data: { user }, error } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in") ||
                     request.nextUrl.pathname.startsWith("/sign-up") ||
                     request.nextUrl.pathname === "/";
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // Redirigir usuarios autenticados desde páginas de auth al dashboard
  if (!error && user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Proteger rutas del dashboard
  if (isDashboard) {
    if (error || !user) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar perfil de usuario en la base de datos
    const { data: userProfile } = await supabase
      .from("usuarios")
      .select("role, is_active")
      .eq("auth_user_id", user.id)
      .single();

    if (!userProfile?.is_active) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("error", "account_disabled");
      return NextResponse.redirect(redirectUrl);
    }

    if (!userProfile) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("error", "profile_not_found");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
