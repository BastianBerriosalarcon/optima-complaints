// Servicio centralizado de configuración
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

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
    try {
      // Cargar configuración base
      const basePath = join(__dirname, 'base.yaml');
      const baseConfig = yaml.load(readFileSync(basePath, 'utf8')) as any;

      // Cargar configuración específica del ambiente
      const envPath = join(__dirname, 'environments', `${this.environment}.yaml`);
      const envConfig = yaml.load(readFileSync(envPath, 'utf8')) as any;

      // Combinar configuraciones
      const mergedConfig = this.mergeConfigs(baseConfig, envConfig);

      // Agregar variables de entorno
      return {
        ...mergedConfig,
        environment: this.environment,
        database: {
          ...mergedConfig.database,
          url: process.env.SUPABASE_URL || '',
          key: process.env.SUPABASE_ANON_KEY || '',
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        }
      };
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw new Error('Failed to load configuration');
    }
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