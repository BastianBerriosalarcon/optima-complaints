import { type NextRequest } from "next/server";
import { updateSession } from "./supabase/middleware";
import { authMiddleware } from "./src/lib/auth-middleware";

export async function middleware(request: NextRequest) {
  // Primero actualizar la sesión de Supabase
  const response = await updateSession(request);
  
  // Luego aplicar el middleware de autorización para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return await authMiddleware(request);
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
