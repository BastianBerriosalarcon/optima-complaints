"use client";

import { formatDateTime, formatTimeAgo } from "@/lib/formatters";
import {
  FileText,
  UserPlus,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpCircle
} from "lucide-react";

interface Seguimiento {
  id: string;
  reclamo_id: string;
  user_id: string;
  tipo_seguimiento: string;
  titulo: string;
  descripcion: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  created_at: string;
  usuario: {
    nombre: string;
    rol: string;
  };
}

interface ComplaintTimelineProps {
  seguimientos: Seguimiento[];
}

export default function ComplaintTimeline({ seguimientos }: ComplaintTimelineProps) {
  if (!seguimientos || seguimientos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Sin seguimientos registrados</p>
      </div>
    );
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "creacion":
        return <FileText className="h-4 w-4" />;
      case "asignacion":
        return <UserPlus className="h-4 w-4" />;
      case "comentario":
        return <MessageSquare className="h-4 w-4" />;
      case "escalamiento":
        return <AlertTriangle className="h-4 w-4" />;
      case "cambio_estado":
        return <CheckCircle className="h-4 w-4" />;
      case "resolucion":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case "creacion":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "asignacion":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "comentario":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "escalamiento":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "cambio_estado":
        return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400";
      case "resolucion":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Ordenar por fecha descendente (más reciente primero)
  const seguimientosOrdenados = [...seguimientos].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {seguimientosOrdenados.map((seguimiento, index) => (
        <div key={seguimiento.id} className="relative">
          {/* Línea vertical conectora */}
          {index < seguimientosOrdenados.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
          )}

          <div className="flex gap-3">
            {/* Icono */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(seguimiento.tipo_seguimiento)}`}
            >
              {getIcon(seguimiento.tipo_seguimiento)}
            </div>

            {/* Contenido */}
            <div className="flex-1 pb-4">
              <div className="bg-muted rounded-lg p-3 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{seguimiento.titulo}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(seguimiento.created_at)}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {seguimiento.descripcion}
                </p>

                {/* Cambio de estado si aplica */}
                {seguimiento.estado_anterior && seguimiento.estado_nuevo && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="px-2 py-0.5 rounded bg-background border capitalize">
                      {seguimiento.estado_anterior}
                    </span>
                    <ArrowUpCircle className="h-3 w-3 text-muted-foreground" />
                    <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 capitalize">
                      {seguimiento.estado_nuevo}
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{seguimiento.usuario.nombre}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground capitalize">{seguimiento.usuario.rol}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(seguimiento.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
