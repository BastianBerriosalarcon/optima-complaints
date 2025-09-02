"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Phone, Mail, Car, AlertTriangle, User } from "lucide-react";
import { formatDate, formatPhone } from "@/lib/formatters";
import { ComplaintStatus, ComplaintUrgency } from "@/lib/enums";

interface Complaint {
  id: string;
  id_externo: string;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    email: string;
  };
  vehiculo: {
    id: string;
    modelo: string;
    patente: string;
    vin: string;
  };
  detalle: string;
  tipo_reclamo: string;
  estado: string;
  urgencia: string;
  black_alert: boolean;
  fecha_creacion: string;
  sucursal: {
    id: string;
    nombre: string;
  };
  taller: {
    id: string;
    nombre: string;
  };
  asesor_asignado?: {
    id: string;
    nombre: string;
    email: string;
  };
}

interface ComplaintsTableProps {
  complaints: Complaint[];
  onUpdateStatus?: (complaintId: string, status: string) => void;
  onAssignComplaint?: (complaintId: string, asesorId: string) => void;
  canAssignComplaints?: boolean;
}

export default function ComplaintsTable({ 
  complaints, 
  onUpdateStatus, 
  onAssignComplaint,
  canAssignComplaints = false 
}: ComplaintsTableProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      [ComplaintStatus.PENDIENTE]: "status-pendiente",
      [ComplaintStatus.EN_PROCESO]: "status-en-proceso",
      [ComplaintStatus.CERRADO]: "status-cerrado"
    } as const;

    const labels = {
      [ComplaintStatus.PENDIENTE]: "Pendiente",
      [ComplaintStatus.EN_PROCESO]: "En Proceso", 
      [ComplaintStatus.CERRADO]: "Cerrado"
    };

    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || 'status-pendiente'}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      [ComplaintUrgency.ALTA]: "complaint-urgent",
      [ComplaintUrgency.MEDIA]: "complaint-medium",
      [ComplaintUrgency.BAJA]: "complaint-low"
    } as const;

    const labels = {
      [ComplaintUrgency.ALTA]: "Alta",
      [ComplaintUrgency.MEDIA]: "Media",
      [ComplaintUrgency.BAJA]: "Baja"
    };

    return (
      <Badge className={`status-badge ${variants[urgency as keyof typeof variants] || 'complaint-low'}`}>
        {labels[urgency as keyof typeof labels] || urgency}
      </Badge>
    );
  };

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(complaintId, newStatus);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Reclamo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead>Urgencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asesor Asignado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow 
              key={complaint.id}
              className={complaint.black_alert ? "black-alert" : ""}
            >
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{complaint.id_externo}</div>
                  {complaint.black_alert && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Black Alert
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{complaint.cliente.nombre}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {formatPhone(complaint.cliente.telefono)}
                  </div>
                  {complaint.cliente.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {complaint.cliente.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    {complaint.vehiculo.modelo}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Patente: {complaint.vehiculo.patente}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    VIN: {complaint.vehiculo.vin}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm line-clamp-3" title={complaint.detalle}>
                    {complaint.detalle}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {getUrgencyBadge(complaint.urgencia)}
              </TableCell>
              <TableCell>
                {getStatusBadge(complaint.estado)}
              </TableCell>
              <TableCell>
                {complaint.asesor_asignado ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{complaint.asesor_asignado.nombre}</div>
                      <div className="text-xs text-muted-foreground">{complaint.asesor_asignado.email}</div>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline">Sin asignar</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(complaint.fecha_creacion)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {complaint.sucursal.nombre}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(complaint.id, ComplaintStatus.EN_PROCESO)}>
                      Marcar En Proceso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(complaint.id, ComplaintStatus.CERRADO)}>
                      Marcar como Cerrado
                    </DropdownMenuItem>
                    {canAssignComplaints && (
                      <DropdownMenuItem>
                        Reasignar Asesor
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      Ver Detalles
                    </DropdownMenuItem>
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