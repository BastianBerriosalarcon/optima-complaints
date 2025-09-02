"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Target, ClipboardCheck, CircleAlert, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface DashboardStatsProps {
  stats: {
    leads: {
      total: number;
      nuevos: number;
      contactados: number;
      cotizados: number;
      vendidos: number;
      perdidos: number;
      conversion_rate: number;
    };
    ventas: {
      mes_actual: number;
      mes_anterior: number;
      objetivo_mensual: number;
      monto_total: number;
      ticket_promedio: number;
    };
    encuestas: {
      post_venta: {
        total: number;
        completadas: number;
        pendientes: number;
        nps_score: number;
        satisfaccion_promedio: number;
      };
      ventas: {
        total: number;
        completadas: number;
        pendientes: number;
        satisfaccion_promedio: number;
      };
    };
    reclamos: {
      total: number;
      pendientes: number;
      en_proceso: number;
      cerrados: number;
      black_alerts: number;
      tiempo_promedio_resolucion: number;
    };
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const ventasChange = stats.ventas.mes_actual - stats.ventas.mes_anterior;
  const ventasChangePercent = formatPercentage(ventasChange, stats.ventas.mes_anterior);
  const isVentasPositive = ventasChange >= 0;

  return (
    <div className="dashboard-grid">
      {/* Leads Stats */}
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="metric-value">{stats.leads.total}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {stats.leads.nuevos} nuevos
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatPercentage(stats.leads.vendidos, stats.leads.total)} conversión
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ventas Stats */}
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="metric-value">{stats.ventas.mes_actual}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 text-sm ${isVentasPositive ? 'metric-change-positive' : 'metric-change-negative'}`}>
              {isVentasPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {ventasChangePercent} vs mes anterior
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Objetivo: {stats.ventas.objetivo_mensual} ({formatPercentage(stats.ventas.mes_actual, stats.ventas.objetivo_mensual)})
          </p>
        </CardContent>
      </Card>

      {/* Encuestas Stats */}
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfacción NPS</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="metric-value">{stats.encuestas.post_venta.nps_score}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs bg-green-500">
              Post-venta: {stats.encuestas.post_venta.satisfaccion_promedio}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Ventas: {stats.encuestas.ventas.satisfaccion_promedio}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reclamos Stats */}
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reclamos Pendientes</CardTitle>
          <CircleAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="metric-value">{stats.reclamos.pendientes}</div>
          <div className="flex items-center gap-2 mt-2">
            {stats.reclamos.black_alerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.reclamos.black_alerts} Black Alert
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {stats.reclamos.en_proceso} en proceso
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tiempo promedio: {stats.reclamos.tiempo_promedio_resolucion} días
          </p>
        </CardContent>
      </Card>
    </div>
  );
}