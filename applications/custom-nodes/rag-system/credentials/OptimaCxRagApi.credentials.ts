import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class OptimaCxRagApi implements ICredentialType {
  name = 'optimaCxRagApi';
  displayName = 'Optima-CX RAG API';
  documentationUrl = 'https://docs.optima-cx.com/rag-api';
  properties: INodeProperties[] = [
    {
      displayName: 'Google Cloud Configuration',
      name: 'gcpConfig',
      type: 'notice',
      default: '',
      description: 'Configure your Google Cloud Platform settings',
    },
    {
      displayName: 'GCP Project ID',
      name: 'gcpProjectId',
      type: 'string',
      default: '',
      required: true,
      description: 'Google Cloud Project ID',
    },
    {
      displayName: 'GCP Region',
      name: 'gcpRegion',
      type: 'string',
      default: 'us-central1',
      required: true,
      description: 'Google Cloud Region for Vertex AI',
    },
    {
      displayName: 'Service Account Key',
      name: 'serviceAccountKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Google Cloud Service Account Key JSON (optional if using default credentials)',
    },
    {
      displayName: 'Storage Configuration',
      name: 'storageConfig',
      type: 'notice',
      default: '',
      description: 'Configure Google Cloud Storage settings',
    },
    {
      displayName: 'Default Storage Bucket',
      name: 'defaultBucket',
      type: 'string',
      default: '',
      description: 'Default Google Cloud Storage bucket for documents',
    },
    {
      displayName: 'RAG Configuration',
      name: 'ragConfig',
      type: 'notice',
      default: '',
      description: 'Configure RAG system settings',
    },
    {
      displayName: 'Default Embedding Model',
      name: 'defaultEmbeddingModel',
      type: 'options',
      options: [
        {
          name: 'Text Embedding 004',
          value: 'text-embedding-004',
        },
        {
          name: 'Text Embedding Gecko',
          value: 'textembedding-gecko',
        },
        {
          name: 'Text Embedding Gecko Multilingual',
          value: 'textembedding-gecko-multilingual',
        },
      ],
      default: 'text-embedding-004',
      description: 'Default embedding model to use',
    },
    {
      displayName: 'Default LLM Model',
      name: 'defaultLlmModel',
      type: 'options',
      options: [
        {
          name: 'Gemini 2.5 Pro',
          value: 'gemini-2.5-pro',
        },
        {
          name: 'Gemini 1.5 Pro',
          value: 'gemini-1.5-pro',
        },
        {
          name: 'Gemini 1.5 Flash',
          value: 'gemini-1.5-flash',
        },
      ],
      default: 'gemini-2.5-pro',
      description: 'Default LLM model for AI responses',
    },
    {
      displayName: 'Default Similarity Threshold',
      name: 'defaultSimilarityThreshold',
      type: 'number',
      default: 0.8,
      description: 'Default similarity threshold for RAG queries',
      typeOptions: {
        minValue: 0,
        maxValue: 1,
        numberStepSize: 0.1,
      },
    },
    {
      displayName: 'Security Configuration',
      name: 'securityConfig',
      type: 'notice',
      default: '',
      description: 'Security and access control settings',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API Key for authentication (optional)',
    },
    {
      displayName: 'Rate Limit (requests/minute)',
      name: 'rateLimit',
      type: 'number',
      default: 60,
      description: 'Rate limit for API requests',
    },
    {
      displayName: 'Enable Request Logging',
      name: 'enableLogging',
      type: 'boolean',
      default: false,
      description: 'Enable detailed request logging',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'User-Agent': 'n8n-optima-cx-rag',
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.optima-cx.com',
      url: '/health',
      method: 'GET',
    },
    rules: [
      {
        type: 'responseSuccessBody',
        properties: {
          key: 'status',
          value: 'ok',
        },
      },
    ],
  };
}