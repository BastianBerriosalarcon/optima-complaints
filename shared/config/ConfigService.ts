// Servicio centralizado de configuración

export interface DatabaseConfig {
  url: string;
  key: string;
  serviceKey?: string;
  type: string;
  pool_size: number;
  timeout: number;
}

export interface ServiceConfig {
  name: string;
  version: string;
  environment: string;
  database: DatabaseConfig;
  n8n: {
    user_management_disabled: boolean;
    metrics_enabled: boolean;
    diagnostics_enabled: boolean;
  };
  security: {
    encryption_algorithm: string;
    session_timeout: number;
  };
  monitoring: {
    logging_level: string;
    metrics_enabled: boolean;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private config: ServiceConfig;
  private environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'dev';
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): ServiceConfig {
    // Configuración basada en variables de entorno
    return {
      name: 'optimacx-platform',
      version: '1.0.0',
      environment: this.environment,
      database: {
        url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        type: 'supabase',
        pool_size: 10,
        timeout: 30000
      },
      n8n: {
        user_management_disabled: false,
        metrics_enabled: true,
        diagnostics_enabled: this.environment !== 'prod'
      },
      security: {
        encryption_algorithm: 'AES-256-GCM',
        session_timeout: 3600000
      },
      monitoring: {
        logging_level: this.environment === 'prod' ? 'warn' : 'debug',
        metrics_enabled: true
      }
    };
  }

  private mergeConfigs(base: any, env: any): any {
    const result = { ...base };
    
    for (const key in env) {
      if (typeof env[key] === 'object' && env[key] !== null && !Array.isArray(env[key])) {
        result[key] = this.mergeConfigs(result[key] || {}, env[key]);
      } else {
        result[key] = env[key];
      }
    }
    
    return result;
  }

  public getConfig(): ServiceConfig {
    return this.config;
  }

  public getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public isProduction(): boolean {
    return this.environment === 'prod';
  }

  public isDevelopment(): boolean {
    return this.environment === 'dev';
  }
}

// Instancia singleton para fácil acceso
export const config = ConfigService.getInstance();