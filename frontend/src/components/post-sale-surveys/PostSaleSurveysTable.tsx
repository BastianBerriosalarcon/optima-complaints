"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Phone, Mail, Car, User, Clock } from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/formatters";

interface PostSaleSurvey {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  vehiculo_modelo: string;
  vehiculo_patente: string;
  fecha_servicio: string;
  sucursal: {
    id: string;
    nombre: string;
  };
  taller: {
    id: string;
    nombre: string;
  };
  recomendacion: number;
  satisfaccion: number;
  lavado: number;
  asesor: number;
  comentario?: string;
  origen: 'QR' | 'WhatsApp' | 'Llamada';
  estado: 'pendiente' | 'completado' | 'vencido';
  fecha_creacion: string;
  fecha_completado?: string;
  promedio_calificacion: number;
  requiere_seguimiento: boolean;
  contact_center_asignado?: {
    id: string;
    nombre: string;
  };
}

interface PostSaleSurveysTableProps {
  surveys: PostSaleSurvey[];
  onUpdateStatus?: (surveyId: string, status: string) => void;
  onAssignToContactCenter?: (surveyId: string, userId: string) => void;
  canAssignToContactCenter?: boolean;
}

export default function PostSaleSurveysTable({
  surveys,
  onUpdateStatus,
  onAssignToContactCenter,
  canAssignToContactCenter = false
}: PostSaleSurveysTableProps) {

  const getOriginBadge = (origin: string) => {
    const variants = {
      "QR": "channel-qr",
      "WhatsApp": "channel-whatsapp",
      "Llamada": "channel-call"
    } as const;

    return (
      <Badge className={`status-badge ${variants[origin as keyof typeof variants] || 'channel-qr'}`}>
        {origin}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "pendiente": "status-pendiente",
      "completado": "status-completado",
      "vencido": "status-vencido"
    } as const;

    const labels = {
      "pendiente": "Pendiente",
      "completado": "Completado", 
      "vencido": "Vencido"
    };

    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || 'status-pendiente'}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9) return <Badge className="survey-score-excellent">Excelente ({score})</Badge>;
    if (score >= 7) return <Badge className="survey-score-good">Bueno ({score})</Badge>;
    if (score >= 5) return <Badge className="survey-score-regular">Regular ({score})</Badge>;
    return <Badge className="survey-score-poor">Bajo ({score})</Badge>;
  };

  const handleStatusChange = (surveyId: string, newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(surveyId, newStatus);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Seguimiento</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{survey.cliente_nombre}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {survey.cliente_telefono}
                  </div>
                  {survey.cliente_email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {survey.cliente_email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    {survey.vehiculo_modelo}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Patente: {survey.vehiculo_patente}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {formatDate(survey.fecha_servicio)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {survey.sucursal.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {survey.taller.nombre}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getOriginBadge(survey.origen)}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {getStatusBadge(survey.estado)}
                  {survey.estado === 'completado' && survey.fecha_completado && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(survey.fecha_completado)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {survey.estado === 'completado' ? (
                  <div className="space-y-1">
                    {getScoreBadge(survey.promedio_calificacion)}
                    <div className="text-xs text-muted-foreground">
                      R:{survey.recomendacion} S:{survey.satisfaccion} L:{survey.lavado} A:{survey.asesor}
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline">Sin calificar</Badge>
                )}
              </TableCell>
              <TableCell>
                {survey.requiere_seguimiento ? (
                  <div className="space-y-1">
                    <Badge variant="destructive" className="text-xs">
                      Requiere seguimiento
                    </Badge>
                    {survey.contact_center_asignado && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {survey.contact_center_asignado.nombre}
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Sin seguimiento
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {survey.estado === 'pendiente' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'completado')}>
                        Marcar como Completado
                      </DropdownMenuItem>
                    )}
                    {survey.estado === 'pendiente' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'vencido')}>
                        Marcar como Vencido
                      </DropdownMenuItem>
                    )}
                    {canAssignToContactCenter && survey.estado === 'pendiente' && (
                      <DropdownMenuItem>
                        Asignar a Contact Center
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      Ver Detalles
                    </DropdownMenuItem>
                    {survey.comentario && (
                      <DropdownMenuItem>
                        Ver Comentarios
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