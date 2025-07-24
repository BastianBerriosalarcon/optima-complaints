"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Download, Upload, Filter, BarChart3, Users, Phone, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSalesSurvey, getSalesSurveys, getSalesSurveyStats, createBulkSalesSurveys } from "./actions";
import ExcelUploadComponent from "./excel-upload";

interface SalesSurvey {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  vehiculo_modelo: string;
  fecha_venta: string;
  recomendacion?: number;
  atencion_asesor?: number;
  proceso_entrega?: number;
  satisfaccion_general?: number;
  average_score?: number;
  comentario?: string;
  origen: "QR_VENTAS" | "WhatsApp_VENTAS" | "Llamada_VENTAS";
  estado: "pendiente" | "completado";
  usuarios?: { nombre: string; email: string };
  sucursales?: { nombre: string };
  created_at: string;
}

interface SalesSurveyStats {
  total: number;
  completadas: number;
  pendientes: number;
  por_origen: {
    QR_VENTAS: number;
    WhatsApp_VENTAS: number;
    Llamada_VENTAS: number;
  };
  scores: {
    promedio: number;
    excelentes: number;
    buenos: number;
    regulares: number;
    bajos: number;
  };
}

export default function EncuestasVentasPage() {
  const { user } = useAuth();
  const { role, hasRole } = useRole();
  
  const [surveys, setSurveys] = useState<SalesSurvey[]>([]);
  const [stats, setStats] = useState<SalesSurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    origen: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: ""
  });
  
  // New survey form
  const [showNewSurveyForm, setShowNewSurveyForm] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    cliente_nombre: "",
    cliente_telefono: "",
    vehiculo_modelo: "",
    fecha_venta: "",
    origen: "QR_VENTAS" as const
  });

  // Check permissions - only sales roles can access
  const canAccessSalesSurveys = hasRole(['jefe_ventas', 'asesor_ventas', 'gerencia', 'super_admin']);
  const canCreateSurveys = hasRole(['jefe_ventas', 'contact_center', 'gerencia', 'super_admin']);
  const canViewAllSurveys = hasRole(['jefe_ventas', 'gerencia', 'super_admin']);

  useEffect(() => {
    if (canAccessSalesSurveys) {
      loadSurveys();
      loadStats();
    }
  }, [canAccessSalesSurveys, currentPage, filters]);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const result = await getSalesSurveys({
        ...filters,
        page: currentPage,
        limit: 20
      });
      
      if (result.error) {
        setError(result.error);
      } else {
        setSurveys(result.data || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (err) {
      setError("Error al cargar las encuestas de ventas");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getSalesSurveyStats();
      if (result.error) {
        console.error("Error loading stats:", result.error);
      } else {
        setStats(result.data || null);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // For now, we'll create a basic survey structure
      // In real implementation, this would include all survey questions
      const surveyData = {
        concesionario_id: user?.user_metadata?.concesionario_id || "",
        cliente_nombre: newSurvey.cliente_nombre,
        cliente_telefono: newSurvey.cliente_telefono,
        vehiculo_modelo: newSurvey.vehiculo_modelo,
        fecha_venta: newSurvey.fecha_venta,
        asesor_ventas_id: user?.id || "",
        origen: newSurvey.origen,
        // These would be filled when survey is actually completed
        recomendacion: 8,
        atencion_asesor: 8,
        proceso_entrega: 8,
        satisfaccion_general: 8
      };

      const result = await createSalesSurvey(surveyData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setShowNewSurveyForm(false);
        setNewSurvey({
          cliente_nombre: "",
          cliente_telefono: "",
          vehiculo_modelo: "",
          fecha_venta: "",
          origen: "QR_VENTAS"
        });
        loadSurveys();
        loadStats();
      }
    } catch (err) {
      setError("Error al crear la encuesta de ventas");
    }
  };

  const getOrigenBadge = (origen: string) => {
    const variants = {
      "QR_VENTAS": "default",
      "WhatsApp_VENTAS": "secondary", 
      "Llamada_VENTAS": "outline"
    } as const;
    
    const labels = {
      "QR_VENTAS": "QR Ventas",
      "WhatsApp_VENTAS": "WhatsApp",
      "Llamada_VENTAS": "Llamada"
    };
    
    return (
      <Badge variant={variants[origen as keyof typeof variants] || "default"}>
        {labels[origen as keyof typeof labels] || origen}
      </Badge>
    );
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return <Badge variant="outline">Sin calificar</Badge>;
    
    if (score >= 9) return <Badge className="bg-green-500">Excelente ({score})</Badge>;
    if (score >= 7) return <Badge className="bg-blue-500">Bueno ({score})</Badge>;
    if (score >= 5) return <Badge className="bg-yellow-500">Regular ({score})</Badge>;
    return <Badge className="bg-red-500">Bajo ({score})</Badge>;
  };

  if (!canAccessSalesSurveys) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a las encuestas de ventas. 
            Solo los roles de ventas (Jefe de Ventas, Asesor de Ventas) pueden acceder a esta sección.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Encuestas de Ventas</h1>
          <p className="text-muted-foreground">
            Gestión de encuestas de satisfacción post-venta de vehículos
          </p>
        </div>
        
        {canCreateSurveys && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowNewSurveyForm(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Nueva Encuesta
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Encuestas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completadas} completadas, {stats.pendientes} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scores.promedio.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                De 10 puntos posibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por QR</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.por_origen.QR_VENTAS}</div>
              <p className="text-xs text-muted-foreground">
                Respuestas inmediatas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por WhatsApp</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.por_origen.WhatsApp_VENTAS}</div>
              <p className="text-xs text-muted-foreground">
                Envío masivo
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Encuestas</TabsTrigger>
          <TabsTrigger value="upload">Carga Masiva Excel</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="origen">Origen</Label>
                  <Select value={filters.origen} onValueChange={(value) => setFilters({...filters, origen: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los orígenes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="QR_VENTAS">QR Ventas</SelectItem>
                      <SelectItem value="WhatsApp_VENTAS">WhatsApp</SelectItem>
                      <SelectItem value="Llamada_VENTAS">Llamada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={filters.estado} onValueChange={(value) => setFilters({...filters, estado: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha_desde">Desde</Label>
                  <Input
                    type="date"
                    value={filters.fecha_desde}
                    onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="fecha_hasta">Hasta</Label>
                  <Input
                    type="date"
                    value={filters.fecha_hasta}
                    onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Surveys Table */}
          <Card>
            <CardHeader>
              <CardTitle>Encuestas de Ventas</CardTitle>
              <CardDescription>
                Lista de todas las encuestas de satisfacción post-venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando encuestas...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Fecha Venta</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Calificación</TableHead>
                      <TableHead>Asesor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{survey.cliente_nombre}</div>
                            <div className="text-sm text-muted-foreground">{survey.cliente_telefono}</div>
                          </div>
                        </TableCell>
                        <TableCell>{survey.vehiculo_modelo}</TableCell>
                        <TableCell>{new Date(survey.fecha_venta).toLocaleDateString()}</TableCell>
                        <TableCell>{getOrigenBadge(survey.origen)}</TableCell>
                        <TableCell>
                          <Badge variant={survey.estado === 'completado' ? 'default' : 'secondary'}>
                            {survey.estado === 'completado' ? 'Completado' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getScoreBadge(survey.average_score)}</TableCell>
                        <TableCell>{survey.usuarios?.nombre || 'No asignado'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <ExcelUploadComponent />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas de Encuestas de Ventas</CardTitle>
              <CardDescription>
                Métricas detalladas y análisis de satisfacción
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

      {/* New Survey Modal - This would be a proper modal in real implementation */}
      {showNewSurveyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nueva Encuesta de Ventas</CardTitle>
              <CardDescription>
                Crear una nueva encuesta de satisfacción post-venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSurvey} className="space-y-4">
                <div>
                  <Label htmlFor="cliente_nombre">Nombre del Cliente</Label>
                  <Input
                    id="cliente_nombre"
                    value={newSurvey.cliente_nombre}
                    onChange={(e) => setNewSurvey({...newSurvey, cliente_nombre: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_telefono">Teléfono</Label>
                  <Input
                    id="cliente_telefono"
                    value={newSurvey.cliente_telefono}
                    onChange={(e) => setNewSurvey({...newSurvey, cliente_telefono: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vehiculo_modelo">Modelo del Vehículo</Label>
                  <Input
                    id="vehiculo_modelo"
                    value={newSurvey.vehiculo_modelo}
                    onChange={(e) => setNewSurvey({...newSurvey, vehiculo_modelo: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fecha_venta">Fecha de Venta</Label>
                  <Input
                    id="fecha_venta"
                    type="date"
                    value={newSurvey.fecha_venta}
                    onChange={(e) => setNewSurvey({...newSurvey, fecha_venta: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Crear Encuesta</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewSurveyForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}