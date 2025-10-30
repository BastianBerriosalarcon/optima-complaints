// Servicio de autenticación simplificado
import { createClient } from "../../supabase/client";

// Tipos locales para el servicio de autenticación
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  tenant_id: string;
}

export class AuthService {
  private supabase = createClient();
  private dataService = ServiceFactory.getDataService();

  async signIn(data: SignInData): Promise<ServiceResponse<User | null>> {
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          data: null
        };
      }

      // Obtener información adicional del usuario
      const context: WorkflowContext = {
        tenant_id: '', // Se obtendrá de la consulta
        user_id: authData.user.id,
        correlation_id: crypto.randomUUID(),
        timestamp: new Date()
      };

      const userResult = await this.dataService.queryOne<User>(
        `SELECT id, email, role, tenant_id FROM users WHERE id = $1`,
        [authData.user.id],
        context
      );

      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: 'User profile not found',
          data: null
        };
      }

      return {
        success: true,
        data: userResult.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async signUp(data: SignUpData): Promise<ServiceResponse<User | null>> {
    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          data: null
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'User creation failed',
          data: null
        };
      }

      // Crear perfil de usuario
      const context: WorkflowContext = {
        tenant_id: data.tenant_id,
        user_id: authData.user.id,
        correlation_id: crypto.randomUUID(),
        timestamp: new Date()
      };

      const userResult = await this.dataService.queryOne<User>(
        `INSERT INTO users (id, email, role, tenant_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING id, email, role, tenant_id`,
        [authData.user.id, data.email, 'user', data.tenant_id],
        context
      );

      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: 'Failed to create user profile',
          data: null
        };
      }

      return {
        success: true,
        data: userResult.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async signOut(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message,
          data: undefined
        };
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: undefined
      };
    }
  }

  async getCurrentUser(): Promise<ServiceResponse<User | null>> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      
      if (!authData.user) {
        return {
          success: true,
          data: null
        };
      }

      const context: WorkflowContext = {
        tenant_id: '',
        user_id: authData.user.id,
        correlation_id: crypto.randomUUID(),
        timestamp: new Date()
      };

      const userResult = await this.dataService.queryOne<User>(
        `SELECT id, email, role, tenant_id FROM users WHERE id = $1`,
        [authData.user.id],
        context
      );

      if (!userResult.success) {
        return {
          success: false,
          error: userResult.error,
          data: null
        };
      }

      return {
        success: true,
        data: userResult.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }
}