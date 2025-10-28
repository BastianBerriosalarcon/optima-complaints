"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleAlert, TrendingUp, TrendingDown } from "lucide-react";

// Props simplificadas solo para reclamos
interface DashboardStatsProps {
  stats: {
    reclamos: {
      total: number;
      pendientes: number;
      en_proceso: number;
      cerrados: number;
      black_alerts: number;
      tiempo_promedio_resolucion: number; // en días
    };
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Reclamos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reclamos</CardTitle>
          <CircleAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reclamos.total}</div>
          <p className="text-xs text-muted-foreground">en el último período</p>
        </CardContent>
      </Card>

      {/* Reclamos Pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reclamos Pendientes</CardTitle>
          <CircleAlert className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reclamos.pendientes}</div>
          {stats.reclamos.black_alerts > 0 && (
            <Badge variant="destructive" className="text-xs mt-1">
              {stats.reclamos.black_alerts} Black Alert
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Reclamos en Proceso */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reclamos.en_proceso}</div>
          <p className="text-xs text-muted-foreground">siendo gestionados activamente</p>
        </CardContent>
      </Card>

      {/* Tiempo de Resolución */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Resolución Promedio</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reclamos.tiempo_promedio_resolucion.toFixed(1)} días</div>
          <p className="text-xs text-muted-foreground">para cerrar un reclamo</p>
        </CardContent>
      </Card>
    </div>
  );
}
