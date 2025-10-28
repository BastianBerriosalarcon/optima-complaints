"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { redirect } from "next/navigation";

import Sidebar from "@/components/navigation/Sidebar";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, CircleAlert, Bell, TrendingUp } from "lucide-react";

// Los datos mock se eliminarán o se reemplazarán con llamadas a la API
const mockNotifications: any[] = []; // Inicialmente vacío

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission } = useRole();
  
  const [notifications, setNotifications] = useState(mockNotifications);

  if (!isAuthenticated || !user) {
    redirect("/sign-in");
  }

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, leida: true }))
    );
  };

  const unreadNotifications = notifications.filter(n => !n.leida);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Panel de Control</h1>
              <p className="text-muted-foreground">
                Bienvenido de vuelta, {user.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Aquí irían las estadísticas principales del dashboard (ej. Reclamos) */}
          {/* <DashboardStats stats={stats} /> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Acciones Rápidas
                  </CardTitle>
                  <CardDescription>
                    Accesos directos a las funciones más utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hasPermission('reclamos:create') && (
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <CircleAlert className="h-6 w-6" />
                        <span className="text-sm">Nuevo Reclamo</span>
                      </Button>
                    )}
                    
                    {hasPermission('reports:view') && (
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <LayoutGrid className="h-6 w-6" />
                        <span className="text-sm">Reportes</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Últimas acciones y eventos en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <CircleAlert className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Reclamo Black Alert</p>
                        <p className="text-xs text-muted-foreground">Roberto Martínez - Falla eléctrica</p>
                      </div>
                      <span className="text-xs text-muted-foreground">Hace 5 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
