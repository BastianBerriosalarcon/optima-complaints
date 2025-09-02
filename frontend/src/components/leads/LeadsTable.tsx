"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Phone, Mail, User } from "lucide-react";
import { formatDate, formatLeadScore, formatPhone } from "@/lib/formatters";
import { LeadStatus } from "@/lib/enums";

interface Lead {
  id: string;
  telefono_cliente: string;
  nombre_cliente: string;
  email_cliente?: string;
  intencion_detectada: string;
  modelo_interes: string;
  mensaje_original: string;
  score_calidad: number;
  nivel_interes: string;
  estado: string;
  fecha_creacion: string;
  fecha_primer_contacto?: string;
  asesor_asignado?: {
    id: string;
    nombre: string;
    email: string;
  };
  sucursal?: {
    id: string;
    nombre: string;
  };
}

interface LeadsTableProps {
  leads: Lead[];
  onAssignLead?: (leadId: string, asesorId: string) => void;
  onUpdateStatus?: (leadId: string, status: string) => void;
  canAssignLeads?: boolean;
}

export default function LeadsTable({ 
  leads, 
  onAssignLead, 
  onUpdateStatus, 
  canAssignLeads = false 
}: LeadsTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const getStatusBadge = (status: string) => {
    const variants = {
      [LeadStatus.NUEVO]: "status-nuevo",
      [LeadStatus.CONTACTADO]: "status-contactado", 
      [LeadStatus.COTIZADO]: "status-cotizado",
      [LeadStatus.VENDIDO]: "status-vendido",
      [LeadStatus.PERDIDO]: "status-perdido"
    } as const;

    const labels = {
      [LeadStatus.NUEVO]: "Nuevo",
      [LeadStatus.CONTACTADO]: "Contactado",
      [LeadStatus.COTIZADO]: "Cotizado", 
      [LeadStatus.VENDIDO]: "Vendido",
      [LeadStatus.PERDIDO]: "Perdido"
    };

    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || 'status-nuevo'}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    const { label, color } = formatLeadScore(score);
    return (
      <Badge className={`${color} text-white`}>
        {label} ({score})
      </Badge>
    );
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(leadId, newStatus);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Modelo de Interés</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asesor Asignado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead>Sucursal</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{lead.nombre_cliente}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {formatPhone(lead.telefono_cliente)}
                  </div>
                  {lead.email_cliente && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {lead.email_cliente}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{lead.modelo_interes}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {lead.intencion_detectada}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getScoreBadge(lead.score_calidad)}
              </TableCell>
              <TableCell>
                {getStatusBadge(lead.estado)}
              </TableCell>
              <TableCell>
                {lead.asesor_asignado ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{lead.asesor_asignado.nombre}</div>
                      <div className="text-xs text-muted-foreground">{lead.asesor_asignado.email}</div>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline">Sin asignar</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(lead.fecha_creacion)}
                </div>
                {lead.fecha_primer_contacto && (
                  <div className="text-xs text-muted-foreground">
                    Contactado: {formatDate(lead.fecha_primer_contacto)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {lead.sucursal?.nombre || "No asignada"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(lead.id, LeadStatus.CONTACTADO)}>
                      Marcar como Contactado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(lead.id, LeadStatus.COTIZADO)}>
                      Marcar como Cotizado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(lead.id, LeadStatus.VENDIDO)}>
                      Marcar como Vendido
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(lead.id, LeadStatus.PERDIDO)}>
                      Marcar como Perdido
                    </DropdownMenuItem>
                    {canAssignLeads && (
                      <DropdownMenuItem>
                        Reasignar Asesor
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}