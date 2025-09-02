"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock5, ChevronDown, ChevronRight, User, Globe } from "lucide-react";
import { formatDateTime, formatTimeAgo } from "@/lib/formatters";

interface AuditEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'assignment' | 'escalation';
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  fecha: string;
  datos_anteriores: Record<string, any> | null;
  datos_nuevos: Record<string, any>;
  descripcion: string;
  ip_address: string;
  user_agent: string;
}

interface AuditHistoryTimelineProps {
  entries: AuditEntry[];
  entityType: string;
  entityId: string;
  showUserDetails?: boolean;
  maxEntries?: number;
}

export default function AuditHistoryTimeline({
  entries,
  entityType,
  entityId,
  showUserDetails = true,
  maxEntries = 50
}: AuditHistoryTimelineProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const getActionBadge = (action: string) => {
    const variants = {
      create: "audit-action-create",
      update: "audit-action-update",
      delete: "audit-action-delete",
      status_change: "audit-action-status",
      assignment: "audit-action-update",
      escalation: "audit-action-status"
    } as const;

    const labels = {
      create: "Creado",
      update: "Actualizado",
      delete: "Eliminado", 
      status_change: "Cambio de Estado",
      assignment: "Asignación",
      escalation: "Escalación"
    };

    return (
      <Badge className={`status-badge ${variants[action as keyof typeof variants] || 'audit-action-update'}`}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  const getRoleBadge = (rol: string) => {
    const roleLabels = {
      super_admin: "Super Admin",
      admin_concesionario: "Admin",
      jefe_ventas: "Jefe Ventas",
      asesor_ventas: "Asesor Ventas",
      jefe_servicio: "Jefe Servicio",
      asesor_servicio: "Asesor Servicio",
      contact_center: "Contact Center",
      encargado_calidad: "Encargado Calidad"
    };

    return (
      <Badge variant="outline" className="text-xs">
        {roleLabels[rol as keyof typeof roleLabels] || rol}
      </Badge>
    );
  };

  const renderDataChanges = (entry: AuditEntry) => {
    if (!entry.datos_anteriores && !entry.datos_nuevos) return null;

    return (
      <div className="mt-3 space-y-2">
        {entry.datos_anteriores && (
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1">Datos Anteriores:</h5>
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <pre className="text-xs text-red-800 whitespace-pre-wrap">
                {JSON.stringify(entry.datos_anteriores, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {entry.datos_nuevos && (
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1">Datos Nuevos:</h5>
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <pre className="text-xs text-green-800 whitespace-pre-wrap">
                {JSON.stringify(entry.datos_nuevos, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  const displayEntries = entries.slice(0, maxEntries);

  if (displayEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock5 className="h-5 w-5" />
            Historial de Auditoría
          </CardTitle>
          <CardDescription>
            Trazabilidad de modificaciones para {entityType} {entityId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock5 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Sin modificaciones registradas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock5 className="h-5 w-5" />
          Historial de Auditoría
        </CardTitle>
        <CardDescription>
          {displayEntries.length} modificaciones registradas para {entityType} {entityId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="audit-timeline">
          {displayEntries.map((entry, index) => (
            <div key={entry.id} className={`audit-timeline-item audit-action-${entry.action}`}>
              <div className="audit-timeline-dot" />
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getActionBadge(entry.action)}
                    <span className="text-sm font-medium">{entry.descripcion}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock5 className="h-3 w-3" />
                      <span>{formatDateTime(entry.fecha)}</span>
                      <span className="text-xs">({formatTimeAgo(entry.fecha)})</span>
                    </div>
                    
                    {showUserDetails && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{entry.usuario.nombre}</span>
                        {getRoleBadge(entry.usuario.rol)}
                      </div>
                    )}
                  </div>

                  {(entry.datos_anteriores || entry.datos_nuevos) && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(entry.id)}
                          className="h-6 px-2 text-xs"
                        >
                          {expandedEntries.has(entry.id) ? (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronRight className="h-3 w-3 mr-1" />
                          )}
                          Ver detalles de cambios
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {renderDataChanges(entry)}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {showUserDetails && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs mt-1"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Información técnica
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                          <div><strong>Email:</strong> {entry.usuario.email}</div>
                          <div><strong>IP:</strong> {entry.ip_address}</div>
                          <div><strong>User Agent:</strong> {entry.user_agent}</div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {entries.length > maxEntries && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {maxEntries} de {entries.length} entradas
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Ver todas las entradas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}