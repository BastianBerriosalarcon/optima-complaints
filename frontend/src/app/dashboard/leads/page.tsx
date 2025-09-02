"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import LeadsTable from "@/components/leads/LeadsTable";
import FilterBar from "@/components/shared/FilterBar";
import { mockLeads } from "@/lib/mockData";
import { LeadStatus, LeadSource, LeadPriority } from "@/lib/enums";

export default function LeadsPage() {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  
  const [leads, setLeads] = useState(mockLeads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    estado: "",
    nivel_interes: "",
    asesor_id: "",
    sucursal_id: "",
    fecha_desde: "",
    fecha_hasta: ""
  });

  // Permissions
  const canViewLeads = hasPermission('leads:view');
  const canCreateLeads = hasPermission('leads:create');
  const canAssignLeads = hasPermission('leads:assign');
  const canExportData = hasPermission('reports:export');

  const filterOptions = [
    {
      key: "estado",
      label: "Estado",
      value: filters.estado,
      options: [
        { value: LeadStatus.NUEVO, label: "Nuevo" },
        { value: LeadStatus.CONTACTADO, label: "Contactado" },
        { value: LeadStatus.COTIZADO, label: "Cotizado" },
        { value: LeadStatus.VENDIDO, label: "Vendido" },
        { value: LeadStatus.PERDIDO, label: "Perdido" }
      ]
    },
    {
      key: "nivel_interes",
      label: "Nivel de Interés",
      value: filters.nivel_interes,
      options: [
        { value: LeadPriority.ALTO, label: "Alto" },
        { value: LeadPriority.MEDIO, label: "Medio" },
        { value: LeadPriority.BAJO, label: "Bajo" }
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
      nivel_interes: "",
      asesor_id: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: ""
    });
  };

  const handleUpdateStatus = (leadId: string, status: string) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, estado: status }
          : lead
      )
    );
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log("Exporting leads data...");
  };

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchValue || 
      lead.nombre_cliente.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.telefono_cliente.includes(searchValue) ||
      lead.modelo_interes.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilters = 
      (!filters.estado || lead.estado === filters.estado) &&
      (!filters.nivel_interes || lead.nivel_interes === filters.nivel_interes);

    return matchesSearch && matchesFilters;
  });

  if (!canViewLeads) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a la gestión de leads.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Leads</h1>
          <p className="text-muted-foreground">
            Sistema de gestión de leads con scoring automático y seguimiento del ciclo de ventas
          </p>
        </div>
        
        <div className="flex gap-2">
          {canCreateLeads && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Carga Masiva
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Lead
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Leads</TabsTrigger>
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
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                Lista de todos los leads con información de contacto y estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando leads...</div>
              ) : (
                <LeadsTable
                  leads={filteredLeads}
                  onUpdateStatus={handleUpdateStatus}
                  canAssignLeads={canAssignLeads}
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
                Analíticas de Leads
              </CardTitle>
              <CardDescription>
                Métricas y análisis del rendimiento de leads
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