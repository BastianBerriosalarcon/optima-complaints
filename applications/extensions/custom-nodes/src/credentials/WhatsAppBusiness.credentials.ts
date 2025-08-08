// WhatsApp Business API Credentials - Principio de Responsabilidad Única
import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class WhatsAppBusiness implements ICredentialType {
  name = 'whatsAppBusiness';
  displayName = 'WhatsApp Business API';
  documentationUrl = 'https://developers.facebook.com/docs/whatsapp';
  icon = 'file:whatsapp.svg';

  properties: INodeProperties[] = [
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: {
        password: true
      },
      default: '',
      required: true,
      description: 'WhatsApp Business API access token'
    },
    {
      displayName: 'Phone Number ID',
      name: 'phoneNumberId',
      type: 'string',
      default: '',
      required: true,
      description: 'WhatsApp Business phone number ID'
    },
    {
      displayName: 'Webhook Verify Token',
      name: 'webhookVerifyToken',
      type: 'string',
      typeOptions: {
        password: true
      },
      default: '',
      description: 'Token for webhook verification'
    },
    {
      displayName: 'API Version',
      name: 'apiVersion',
      type: 'options',
      options: [
        {
          name: 'v18.0',
          value: 'v18.0'
        },
        {
          name: 'v17.0',
          value: 'v17.0'
        },
        {
          name: 'v16.0',
          value: 'v16.0'
        }
      ],
      default: 'v18.0',
      description: 'WhatsApp API version to use'
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://graph.facebook.com',
      description: 'Base URL for WhatsApp Business API'
    }
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'Authorization': '=Bearer {{$credentials.accessToken}}',
        'Content-Type': 'application/json'
      }
    }
  };
}