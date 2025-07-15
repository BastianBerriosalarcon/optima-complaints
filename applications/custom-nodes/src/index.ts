// OptimaCX Custom Nodes - Export Index
// Siguiendo principios SOLID para extensibilidad

// Credentials
export { OptimaCxApi } from './credentials/OptimaCxApi.credentials';
export { WhatsAppBusiness } from './credentials/WhatsAppBusiness.credentials';

// Base Classes
export { OptimaCxNodeBase, IOptimaCxNodeService } from './nodes/base/OptimaCxNodeBase';

// Custom Nodes
export { LeadProcessor } from './nodes/LeadProcessor/LeadProcessor.node';
export { TenantConfigLoader } from './nodes/TenantConfigLoader/TenantConfigLoader.node';
export { AIAnalyzer } from './nodes/AIAnalyzer/AIAnalyzer.node';
export { AdvisorAssigner } from './nodes/AdvisorAssigner/AdvisorAssigner.node';
export { WhatsAppSender } from './nodes/WhatsAppSender/WhatsAppSender.node';

// Services (exported for potential external use)
export { LeadProcessorService } from './nodes/LeadProcessor/LeadProcessorService';
export { TenantConfigLoaderService } from './nodes/TenantConfigLoader/TenantConfigLoaderService';
export { AIAnalyzerService } from './nodes/AIAnalyzer/AIAnalyzerService';
export { AdvisorAssignerService } from './nodes/AdvisorAssigner/AdvisorAssignerService';
export { WhatsAppSenderService } from './nodes/WhatsAppSender/WhatsAppSenderService';

// Package information
export const OPTIMACX_CUSTOM_NODES_VERSION = '1.0.0';
export const OPTIMACX_CUSTOM_NODES_DESCRIPTION = 'Custom N8N nodes for OptimaCX automotive CRM platform';

// Node categories for better organization
export const NODE_CATEGORIES = {
  LEAD_MANAGEMENT: 'Lead Management',
  AI_ANALYSIS: 'AI Analysis',
  CONFIGURATION: 'Configuration',
  COMMUNICATION: 'Communication',
  ASSIGNMENT: 'Assignment'
} as const;

// Export node collection for easy registration
export const OPTIMACX_NODES = [
  LeadProcessor,
  TenantConfigLoader,
  AIAnalyzer,
  AdvisorAssigner,
  WhatsAppSender
] as const;

// Export credentials collection
export const OPTIMACX_CREDENTIALS = [
  OptimaCxApi,
  WhatsAppBusiness
] as const;