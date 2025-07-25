# Advisor Workload Management System for Óptima-CX

## Overview

The Advisor Workload Management System provides intelligent lead assignment and workload balancing for sales advisors in the Óptima-CX platform. It supports multiple sales roles (`asesor_ventas`, `jefe_ventas`, `gerente_ventas`) with automatic workload tracking and audit logging.

## Key Features

### 🎯 Intelligent Assignment
- **Role Hierarchy**: Prioritizes `gerente_ventas` > `jefe_ventas` > `asesor_ventas` for high-priority leads
- **Specialization Matching**: Matches advisors with specific vehicle/brand expertise
- **Workload Balancing**: Assigns leads to advisors with lowest current workload
- **Sucursal Filtering**: Respects branch-specific assignments

### 📊 Workload Tracking
- **Real-time Updates**: Automatic increment/decrement of advisor workload
- **Audit Logging**: Complete history of all workload changes
- **Lead Reference**: Links workload changes to specific leads
- **Statistics**: Comprehensive reporting on advisor performance

### 🔒 Multi-tenant Security
- **RLS Enforcement**: All operations respect Row Level Security
- **Tenant Isolation**: Complete data segregation by `concesionario_id`
- **Secure Functions**: All database functions use `SECURITY DEFINER`

## Database Setup

Execute the SQL functions from `/home/bastianberrios_a/advisor_workload_functions.sql` in your Supabase SQL Editor:

```sql
-- 1. Add workload columns to usuarios table
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS carga_actual INTEGER DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS especialidad TEXT;

-- 2. Create workload log table
CREATE TABLE IF NOT EXISTS public.advisor_workload_log (...);

-- 3. Create workload management functions
CREATE OR REPLACE FUNCTION incrementar_carga_asesor(...);
CREATE OR REPLACE FUNCTION decrementar_carga_asesor(...);
CREATE OR REPLACE FUNCTION get_available_sales_team(...);
CREATE OR REPLACE FUNCTION get_advisor_workload_stats(...);
```

## N8N Integration

### AdvisorAssigner Node Operations

#### 1. Assign Advisor (Smart Assignment)
```javascript
// N8N Node Configuration
{
  "operation": "assignAdvisor",
  "leadData": {
    "id": "lead-uuid",
    "sucursal_id": "sucursal-uuid",
    "modelo_interes": "Toyota Corolla",
    "mensaje_inicial": "Necesito comprar un auto urgente"
  },
  "assignmentCriteria": {
    "considerSpecialty": true,
    "strategy": "balanced_workload"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead_id": "lead-uuid",
    "advisor_id": "advisor-uuid",
    "advisor_name": "Juan Pérez",
    "advisor_role": "asesor_ventas",
    "specialty": "Toyota",
    "current_workload": 5,
    "assignment_reason": "Assigned via balanced_workload strategy. Advisor workload: 5",
    "priority": "high",
    "assigned_at": "2025-01-23T10:30:00Z"
  }
}
```

#### 2. Get Available Advisors
```javascript
{
  "operation": "getAvailableAdvisors",
  "filters": {
    "sucursalId": "sucursal-uuid",
    "especialidad": "Toyota"
  }
}
```

#### 3. Reassign Lead
```javascript
{
  "operation": "reassignLead",
  "reassignmentFields": {
    "leadId": "lead-uuid",
    "fromAdvisorId": "old-advisor-uuid",
    "toAdvisorId": "new-advisor-uuid",
    "reason": "Original advisor unavailable"
  }
}
```

#### 4. Get Workload Statistics
```javascript
{
  "operation": "getAdvisorWorkload",
  "workloadAndAvailability": {
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-01-31"
  }
}
```

## TypeScript Service Usage

### AdvisorWorkloadManager Class

```typescript
import { AdvisorWorkloadManager } from '@shared/services/helpers/AdvisorWorkloadManager';

const workloadManager = new AdvisorWorkloadManager(supabaseClient);

// Get best advisor for lead assignment
const advisor = await workloadManager.getBestAdvisorForAssignment(
  'concesionario-uuid',
  {
    sucursalId: 'sucursal-uuid',
    vehicleModel: 'Toyota Corolla',
    leadPriority: 'high',
    requiresSpecialty: true
  }
);

// Assign lead and increment workload atomically
await workloadManager.assignLeadToAdvisor(
  'lead-uuid',
  advisor.id,
  'concesionario-uuid'
);

// Get workload statistics
const stats = await workloadManager.getWorkloadStats(
  'concesionario-uuid',
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
```

## Database Functions Reference

### incrementar_carga_asesor(p_asesor_id, p_lead_id)
- **Purpose**: Increases advisor workload by 1
- **Roles Supported**: `asesor_ventas`, `jefe_ventas`, `gerente_ventas`
- **Logging**: Automatic audit log entry
- **Error Handling**: Raises exception if advisor not found or inactive

### decrementar_carga_asesor(p_asesor_id, p_lead_id)
- **Purpose**: Decreases advisor workload by 1 (minimum 0)
- **Roles Supported**: `asesor_ventas`, `jefe_ventas`, `gerente_ventas`
- **Logging**: Automatic audit log entry
- **Error Handling**: Raises exception if advisor not found or inactive

### get_available_sales_team(p_concesionario_id, p_sucursal_id, p_especialidad)
- **Purpose**: Returns available advisors ordered by assignment priority
- **Filtering**: Optional sucursal and specialization filters
- **Ordering**: Role hierarchy → Specialization match → Workload → Creation date

### get_advisor_workload_stats(p_concesionario_id, p_fecha_inicio, p_fecha_fin)
- **Purpose**: Returns comprehensive workload statistics
- **Metrics**: Current load, increments, decrements, net changes
- **Time Range**: Configurable date range (default: last 30 days)

## Assignment Strategy

### Priority Logic
1. **High Priority Leads** → Prefer `gerente_ventas` or `jefe_ventas`
2. **Specialization Match** → Exact match > partial match > no specialty
3. **Workload Balance** → Lowest current workload first
4. **Fairness** → Oldest advisor as tiebreaker

### Example Assignment Flow
```
Lead: "Necesito comprar Toyota Corolla urgente"
├── Priority: HIGH (contains "urgente")
├── Model: Toyota Corolla
├── Available Advisors:
│   ├── Gerente Ana (Toyota specialist, load: 3) ✓ SELECTED
│   ├── Jefe Carlos (General, load: 2)
│   └── Asesor Pedro (Toyota specialist, load: 5)
└── Assignment: Ana (role hierarchy + specialization)
```

## Monitoring and Metrics

### Workload Distribution
- Real-time view of advisor workloads
- Historical trends and patterns
- Workload balance across team

### Assignment Effectiveness
- Lead conversion rates by advisor
- Average response times
- Reassignment frequency

### System Health
- Function execution performance
- Error rates and exceptions
- Audit trail completeness

## Error Handling

### Common Errors
- **No Available Advisors**: All advisors offline or overloaded
- **Invalid Advisor ID**: Advisor not found or inactive
- **Tenant Mismatch**: Advisor not in requesting tenant

### Error Responses
```json
{
  "success": false,
  "error": "No se pudo actualizar la carga del asesor con ID: uuid. Verificar que el usuario existe, está activo y tiene rol de ventas."
}
```

## Best Practices

### 1. Lead Assignment
- Always use `assignLeadToAdvisor()` for atomic operations
- Check advisor availability before manual assignments
- Consider lead priority for role selection

### 2. Workload Management
- Monitor workload distribution regularly
- Set reasonable workload limits per advisor
- Use reassignment for workload balancing

### 3. Performance
- Index on `(concesionario_id, role, activo, carga_actual)`
- Regular cleanup of old audit logs
- Monitor function execution times

### 4. Multi-tenancy
- Always pass `concesionario_id` to functions
- Verify RLS policies are active
- Test tenant isolation thoroughly

## Integration with Existing Systems

### Lead Management
- Seamless integration with existing lead tables
- Automatic state transitions (`nuevo` → `asignado`)
- Preserves existing lead data structure

### User Management
- Extends `usuarios` table with workload fields
- Respects existing role hierarchies
- Maintains user permissions model

### Notification System
- Compatible with existing N8N notification flows
- Provides rich assignment context for emails
- Supports custom notification templates

This system provides a robust, scalable foundation for intelligent lead assignment while maintaining the multi-tenant security and performance requirements of Óptima-CX.