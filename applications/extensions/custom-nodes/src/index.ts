// OptimaCX Custom Nodes - Export Index
// Siguiendo principios SOLID para extensibilidad

// Credentials
export { OptimaCxApi } from './credentials/OptimaCxApi.credentials';

// Base Classes
export { OptimaCxNodeBase, IOptimaCxNodeService } from './nodes/base/OptimaCxNodeBase';

// Custom Nodes
export { TenantConfigLoader } from './nodes/TenantConfigLoader/TenantConfigLoader.node';
export { AIAnalyzer } from './nodes/AIAnalyzer/AIAnalyzer.node';

// Services (exported for potential external use)
export { TenantConfigLoaderService } from './nodes/TenantConfigLoader/TenantConfigLoaderService';
export { AIAnalyzerService } from './nodes/AIAnalyzer/AIAnalyzerService';

// Package information
export const OPTIMACX_CUSTOM_NODES_VERSION = '1.0.0';
export const OPTIMACX_CUSTOM_NODES_DESCRIPTION = 'Custom N8N nodes for OptimaCX automotive CRM platform';

// Node categories for better organization
export const NODE_CATEGORIES = {
  AI_ANALYSIS: 'AI Analysis',
  CONFIGURATION: 'Configuration',
} as const;

// Export node collection for easy registration
export const OPTIMACX_NODES = [
  TenantConfigLoader,
  AIAnalyzer
] as const;

// Export credentials collection
export const OPTIMACX_CREDENTIALS = [
  OptimaCxApi
] as const;