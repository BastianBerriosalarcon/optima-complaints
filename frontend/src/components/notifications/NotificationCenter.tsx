"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellDot, Check, X, Target, CircleAlert, ClipboardCheck } from "lucide-react";
import { formatTimeAgo } from "@/lib/formatters";

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  usuario_id: string;
  datos_adicionales?: Record<string, any>;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.leida).length;

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'lead_asignado':
      case 'lead_escalado':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'reclamo_nuevo':
      case 'reclamo_black_alert':
        return <CircleAlert className="h-4 w-4 text-red-500" />;
      case 'encuesta_baja_calificacion':
        return <ClipboardCheck className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationVariant = (tipo: string) => {
    switch (tipo) {
      case 'reclamo_black_alert':
        return 'destructive';
      case 'lead_escalado':
      case 'encuesta_baja_calificacion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellDot className="h-5 w-5 text-blue-500" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    !notification.leida 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.tipo)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {notification.titulo}
                          </h4>
                          <Badge 
                            variant={getNotificationVariant(notification.tipo)}
                            className="text-xs"
                          >
                            {notification.tipo.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.fecha)}
                        </p>
                      </div>
                    </div>
                    {!notification.leida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}