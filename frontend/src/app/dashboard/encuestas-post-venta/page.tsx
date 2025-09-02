"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, BarChart3, ClipboardCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import PostSaleSurveysTable from "@/components/post-sale-surveys/PostSaleSurveysTable";
import PostSaleSurveyForm from "@/components/post-sale-surveys/PostSaleSurveyForm";
import ExcelUploadProcessor from "@/components/excel/ExcelUploadProcessor";
import ChannelMetricsDashboard from "@/components/channel-metrics/ChannelMetricsDashboard";
import FilterBar from "@/components/shared/FilterBar";

import { mockPostSaleSurveys, mockChannelMetrics } from "@/lib/phase1MockData";
import { ValidationRule } from "@/services/base/BaseValidator";

export default function EncuestasPostVentaPage() {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  
  const [surveys, setSurveys] = useState(mockPostSaleSurveys);
  const [channelMetrics, setChannelMetrics] = useState(mockChannelMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewSurveyForm, setShowNewSurveyForm] = useState(false);
  
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    estado: "",
    origen: "",
    sucursal_id: "",
    taller_id: "",
    requiere_seguimiento: "",
    fecha_desde: "",
    fecha_hasta: ""
  });

  // Permissions
  const canViewPostSaleSurveys = hasPermission('encuestas:view');
  const canCreateSurveys = hasPermission('encuestas:create');
  const canAssignToContactCenter = hasPermission('encuestas:edit');
  const canExportData = hasPermission('reports:export');

  // Validation rules for Excel upload
  const validationRules: ValidationRule[] = [
    {
      field: 'cliente_nombre',
      type: 'required',
      message: 'Nombre del cliente es requerido'
    },
    {
      field: 'cliente_telefono',
      type: 'required',
      message: 'Teléfono del cliente es requerido'
    },
    {
      field: 'cliente_telefono',
      type: 'format',
      message: 'Formato de teléfono inválido (+56XXXXXXXXX)',
      value: 'phone'
    },
    {
      field: 'vehiculo_modelo',
      type: 'required',
      message: 'Modelo del vehículo es requerido'
    },
    {
      field: 'vehiculo_patente',
      type: 'required',
      message: 'Patente del vehículo es requerida'
    },
    {
      field: 'fecha_servicio',
      type: 'required',
      message: 'Fecha de servicio es requerida'
    },
    {
      field: 'fecha_servicio',
      type: 'format',
      message: 'Formato de fecha inválido (YYYY-MM-DD)',
      value: 'date'
    }
  ];

  const filterOptions = [
    {
      key: "estado",
      label: "Estado",
      value: filters.estado,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "completado", label: "Completado" },
        { value: "vencido", label: "Vencido" }
      ]
    },
    {
      key: "origen",
      label: "Origen",
      value: filters.origen,
      options: [
        { value: "QR", label: "QR" },
        { value: "WhatsApp", label: "WhatsApp" },
        { value: "Llamada", label: "Llamada" }
      ]
    },
    {
      key: "requiere_seguimiento",
      label: "Seguimiento",
      value: filters.requiere_seguimiento,
      options: [
        { value: "true", label: "Requiere seguimiento" },
        { value: "false", label: "Sin seguimiento" }
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
      origen: "",
      sucursal_id: "",
      taller_id: "",
      requiere_seguimiento: "",
      fecha_desde: "",
      fecha_hasta: ""
    });
  };

  const handleUpdateStatus = (surveyId: string, status: string) => {
    setSurveys(prev => 
      prev.map(survey => 
        survey.id === surveyId 
          ? { ...survey, estado: status as any }
          : survey
      )
    );
  };

  const handleCreateSurvey = (data: any) => {
    const newSurvey = {
      id: `post-survey-${Date.now()}`,
      ...data,
      fecha_creacion: new Date().toISOString(),
      estado: 'completado' as const,
      origen: 'Llamada' as const,
      promedio_calificacion: (data.recomendacion + data.satisfaccion + data.lavado + data.asesor) / 4,
      requiere_seguimiento: (data.recomendacion + data.satisfaccion + data.lavado + data.asesor) / 4 <= 8,
      sucursal: { id: 'sucursal-001', nombre: 'Sucursal Centro' },
      taller: { id: 'taller-001', nombre: 'Taller Principal' },
      fecha_servicio: new Date().toISOString()
    };

    setSurveys(prev => [newSurvey, ...prev]);
  };

  const handleExcelProcessComplete = async (result: any) => {
    console.log("Excel processing completed:", result);
    // Here you would typically send the data to your backend
    // and trigger the WhatsApp bulk sending workflow
  };

  const handleExport = () => {
    console.log("Exporting post-sale surveys data...");
  };

  // Filter surveys based on search and filters
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = !searchValue || 
      survey.cliente_nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
      survey.cliente_telefono.includes(searchValue) ||
      survey.vehiculo_modelo.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilters = 
      (!filters.estado || survey.estado === filters.estado) &&
      (!filters.origen || survey.origen === filters.origen) &&
      (!filters.requiere_seguimiento || survey.requiere_seguimiento.toString() === filters.requiere_seguimiento);

    return matchesSearch && matchesFilters;
  });

  if (!canViewPostSaleSurveys) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a las encuestas post-venta.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Encuestas Post-Venta</h1>
          <p className="text-muted-foreground">
            Sistema multicanal de encuestas de satisfacción post-servicio
          </p>
        </div>
        
        <div className="flex gap-2">
          {canCreateSurveys && (
            <Button 
              onClick={() => setShowNewSurveyForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Encuesta
            </Button>
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
          <TabsTrigger value="list">Lista de Encuestas</TabsTrigger>
          <TabsTrigger value="upload">Carga Masiva</TabsTrigger>
          <TabsTrigger value="metrics">Métricas por Canal</TabsTrigger>
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
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Encuestas Post-Venta ({filteredSurveys.length})
              </CardTitle>
              <CardDescription>
                Lista de encuestas de satisfacción post-servicio con seguimiento multicanal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando encuestas...</div>
              ) : (
                <PostSaleSurveysTable
                  surveys={filteredSurveys}
                  onUpdateStatus={handleUpdateStatus}
                  canAssignToContactCenter={canAssignToContactCenter}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <ExcelUploadProcessor
            entityType="post_sale_surveys"
            validationRules={validationRules}
            onProcessComplete={handleExcelProcessComplete}
            allowedFileTypes={[
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel'
            ]}
            title="Carga Masiva de Encuestas Post-Venta"
            description="Carga un archivo Excel con los datos de clientes para envío automático de encuestas por WhatsApp con filtrado inteligente"
          />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <ChannelMetricsDashboard 
            metrics={channelMetrics}
            title="Eficiencia por Canal de Encuestas Post-Venta"
            showComparison={true}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analíticas Avanzadas
              </CardTitle>
              <CardDescription>
                Métricas detalladas y análisis de tendencias de satisfacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dashboard de analíticas avanzadas en desarrollo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Survey Form Modal */}
      <PostSaleSurveyForm
        open={showNewSurveyForm}
        onClose={() => setShowNewSurveyForm(false)}
        onSubmit={handleCreateSurvey}
      />
    </div>
  );
}