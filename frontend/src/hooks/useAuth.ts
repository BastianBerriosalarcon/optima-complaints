"use client";

import { useEffect, useState } from "react";
import { AuthService, User } from "@/services/AuthService";

// Tipos para el sistema de roles
export type UserRole =
  | 'super_admin'
  | 'admin_concesionario'
  | 'gerente_ventas'
  | 'asesor_ventas'
  | 'jefe_servicio'
  | 'asesor_servicio'
  | 'contact_center'
  | 'encargado_calidad'
  | 'marketing';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  const authService = new AuthService();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const result = await authService.getCurrentUser();
        
        if (result.success) {
          setAuthState({
            user: result.data || null,
            loading: false,
            error: null,
            isAuthenticated: !!result.data
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: result.error || null,
            isAuthenticated: false
          });
        }
      } catch (err) {
        setAuthState({
          user: null,
          loading: false,
          error: err instanceof Error ? err.message : "Unknown error",
          isAuthenticated: false
        });
      }
    };

    getInitialSession();
  }, []);

  return authState;
}