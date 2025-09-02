"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, AlertTriangle, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import ComplaintsTable from "@/components/complaints/ComplaintsTable";
import FilterBar from "@/components/shared/FilterBar";
import { mockComplaints } from "@/lib/mockData";
import { ComplaintStatus, ComplaintUrgency } from "@/lib/enums";

export default function ReclamosPage() {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  
  const [complaints, setComplaints] = useState(mockComplaints);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    estado: "",
    urgencia: "",
    black_alert: "",
    sucursal_id: "",
    fecha_desde: "",
    fecha_hasta: ""
  });

  // Permissions
  const canViewComplaints = hasPermission('reclamos:view');
  const canCreateComplaints = hasPermission('reclamos:create');
  const canAssignComplaints = hasPermission('reclamos:assign');
  const canExportData = hasPermission('reports:export');

  const filterOptions = [
    {
      key: "estado",
      label: "Estado",
      value: filters.estado,
      options: [
        { value: ComplaintStatus.PENDIENTE, label: "Pendiente" },
        { value: ComplaintStatus.EN_PROCESO, label: "En Proceso" },
        { value: ComplaintStatus.CERRADO, label: "Cerrado" }
      ]
    },
    {
      key: "urgencia",
      label: "Urgencia",
      value: filters.urgencia,
      options: [
        { value: ComplaintUrgency.ALTA, label: "Alta" },
        { value: ComplaintUrgency.MEDIA, label: "Media" },
        { value: ComplaintUrgency.BAJA, label: "Baja" }
      ]
    },
    {
      key: "black_alert",
      label: "Black Alert",
      value: filters.black_alert,
      options: [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" }
      ]
    }
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setFilters({
      estado: "",
      urgencia: "",
      black_alert: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: ""
    });
  };

  const handleUpdateStatus = (complaintId: string, status: string) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, estado: status }
          : complaint
      )
    );
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log("Exporting complaints data...");
  };

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = !searchValue || 
      complaint.cliente.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.cliente.telefono.includes(searchValue) ||
      complaint.id_externo.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.vehiculo.modelo.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.vehiculo.patente.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilters = 
      (!filters.estado || complaint.estado === filters.estado) &&
      (!filters.urgencia || complaint.urgencia === filters.urgencia) &&
      (!filters.black_alert || complaint.black_alert.toString() === filters.black_alert);

    return matchesSearch && matchesFilters;
  });

  const blackAlertCount = filteredComplaints.filter(c => c.black_alert).length;
  const pendingCount = filteredComplaints.filter(c => c.estado === ComplaintStatus.PENDIENTE).length;

  if (!canViewComplaints) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a la gestión de reclamos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reclamos</h1>
          <p className="text-muted-foreground">
            Sistema de gestión de reclamos con clasificación automática y Black Alerts
          </p>
        </div>
        
        <div className="flex gap-2">
          {canCreateComplaints && (
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Reclamo
            </Button>
          )}
        </div>
      </div>

      {/* Alert for Black Alerts */}
      {blackAlertCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {blackAlertCount} reclamo{blackAlertCount > 1 ? 's' : ''} Black Alert que requieren atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Reclamos</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onExport={canExportData ? handleExport : undefined}
            showExport={canExportData}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reclamos ({filteredComplaints.length})</span>
                <div className="flex items-center gap-2">
                  {pendingCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {pendingCount} pendientes
                    </span>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Lista de todos los reclamos con información del cliente y estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando reclamos...</div>
              ) : (
                <ComplaintsTable
                  complaints={filteredComplaints}
                  onUpdateStatus={handleUpdateStatus}
                  canAssignComplaints={canAssignComplaints}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analíticas de Reclamos
              </CardTitle>
              <CardDescription>
                Métricas y análisis del rendimiento de reclamos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dashboard de analíticas en desarrollo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}