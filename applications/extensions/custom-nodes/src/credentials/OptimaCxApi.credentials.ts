// OptimaCX API Credentials - Principio de Responsabilidad Única
import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class OptimaCxApi implements ICredentialType {
  name = 'optimaCxApi';
  displayName = 'OptimaCX API';
  documentationUrl = 'https://docs.optimacx.com/api';
  icon = 'file:optimacx.svg';

  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Development',
          value: 'dev'
        },
        {
          name: 'Staging',
          value: 'staging'
        },
        {
          name: 'Production',
          value: 'prod'
        }
      ],
      default: 'dev',
      description: 'Select the OptimaCX environment to connect to'
    },
    {
      displayName: 'API Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.optimacx.com',
      description: 'Base URL for the OptimaCX API'
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true
      },
      default: '',
      description: 'Your OptimaCX API key'
    },
    {
      displayName: 'Tenant ID',
      name: 'tenantId',
      type: 'string',
      default: '',
      description: 'Your OptimaCX tenant identifier'
    },
    {
      displayName: 'Supabase URL',
      name: 'supabaseUrl',
      type: 'string',
      default: '',
      required: true,
      description: 'URL of your Supabase project',
    },
    {
      displayName: 'Supabase Service Role Key',
      name: 'supabaseServiceKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Supabase service_role key for backend operations',
    },
  ];

  // Principio Abierto/Cerrado - Extensible sin modificar
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'Authorization': '=Bearer {{$credentials.apiKey}}',
        'X-Tenant-ID': '={{$credentials.tenantId}}',
        'X-Environment': '={{$credentials.environment}}',
        'Content-Type': 'application/json',
        'User-Agent': 'OptimaCX-N8N/1.0.0'
      }
    }
  };

  // Método para validar credenciales
  test: INodeProperties = {
    displayName: 'Test Connection',
    name: 'test',
    type: 'button',
    default: '',
    description: 'Test the connection to OptimaCX API'
  };
}