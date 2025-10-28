"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Car, 
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  FileText,
  Brain,
  TrendingUp
} from "lucide-react";
import { formatDate, formatDateTime, formatPhone } from "@/lib/formatters";
import { ComplaintStatus, ComplaintUrgency } from "@/lib/enums";
import { mockComplaints } from "@/lib/mockData";
import { 
  clasificacionesIA, 
  sentimientosAnalisis, 
  seguimientosTimeline 
} from "@/lib/mockComplaintDetails";
import ComplaintTimeline from "@/components/complaints/ComplaintTimeline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ComplaintDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // Buscar reclamo por ID
  const complaint = mockComplaints.find(c => c.id === resolvedParams.id);
  
  if (!complaint) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Reclamo no encontrado</h2>
              <p className="text-muted-foreground mb-4">
                El reclamo con ID {resolvedParams.id} no existe.
              </p>
              <Button onClick={() => router.push('/dashboard/reclamos')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtener datos adicionales
  const clasificacionIA = clasificacionesIA[complaint.id];
  const sentimientoAnalisis = sentimientosAnalisis[complaint.id];
  const seguimientos = seguimientosTimeline[complaint.id] || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      [ComplaintStatus.PENDIENTE]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [ComplaintStatus.EN_PROCESO]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [ComplaintStatus.CERRADO]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "nuevo": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "asignado": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      "resuelto": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    } as const;

    const labels = {
      nuevo: "Nuevo",
      asignado: "Asignado",
      en_proceso: "En Proceso",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
      pendiente: "Pendiente"
    } as any;

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.nuevo}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      [ComplaintUrgency.ALTA]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [ComplaintUrgency.MEDIA]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      [ComplaintUrgency.BAJA]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    } as const;

    const labels = {
      [ComplaintUrgency.ALTA]: "Alta",
      [ComplaintUrgency.MEDIA]: "Media",
      [ComplaintUrgency.BAJA]: "Baja"
    };

    return (
      <Badge className={variants[urgency as keyof typeof variants] || variants[ComplaintUrgency.BAJA]}>
        {labels[urgency as keyof typeof labels] || urgency}
      </Badge>
    );
  };

  const getChannelBadge = (channel: string) => {
    const labels = {
      contact_center: "Contact Center",
      email: "Email",
      web: "Web",
      api: "API"
    } as any;

    return (
      <Badge variant="outline">
        {labels[channel] || channel}
      </Badge>
    );
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === "positivo") return "😊";
    if (sentiment === "negativo") return "😠";
    return "😐";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/reclamos')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Lista
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{complaint.id_externo}</h1>
              {complaint.black_alert && (
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  BLACK ALERT
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(complaint.estado)}
              {getUrgencyBadge(complaint.urgencia)}
              {/* {getChannelBadge(complaint.canal_ingreso)} */}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Actualizar Estado</Button>
            <Button variant="outline">Reasignar</Button>
            <Button variant="outline">Agregar Comentario</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nombre Completo</dt>
                  <dd className="mt-1 text-sm font-semibold">{complaint.cliente.nombre}</dd>
                </div>
                {complaint.cliente.rut && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">RUT</dt>
                    <dd className="mt-1 text-sm font-semibold">{complaint.cliente.rut}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                  <dd className="mt-1 text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {formatPhone(complaint.cliente.telefono)}
                  </dd>
                </div>
                {complaint.cliente.email && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="mt-1 text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {complaint.cliente.email}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Información del Vehículo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Información del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Patente</dt>
                  <dd className="mt-1 text-sm font-semibold">{complaint.vehiculo.patente}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Marca y Modelo</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {complaint.vehiculo.marca} {complaint.vehiculo.modelo}
                  </dd>
                </div>
                {complaint.vehiculo.vin && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">VIN</dt>
                    <dd className="mt-1 text-sm font-mono">{complaint.vehiculo.vin}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Detalles del Reclamo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles del Reclamo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-2">Descripción</dt>
                <dd className="text-sm leading-relaxed bg-muted p-4 rounded-md">
                  {complaint.detalle}
                </dd>
              </div>

              <Separator />

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Tipo de Reclamo</dt>
                  <dd className="mt-1 text-sm font-semibold capitalize">{complaint.tipo_reclamo}</dd>
                </div>
                {/* <div>
                  <dt className="text-sm font-medium text-muted-foreground">Canal de Ingreso</dt>
                  <dd className="mt-1 text-sm">{getChannelBadge(complaint.canal_ingreso)}</dd>
                </div> */}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Creación
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatDateTime(complaint.fecha_creacion)}
                  </dd>
                </div>
                {complaint.fecha_limite_resolucion && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Fecha Límite
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-orange-600">
                      {formatDateTime(complaint.fecha_limite_resolucion)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Sucursal
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{complaint.sucursal.nombre}</dd>
                </div>
                {complaint.asesor_asignado && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Asignado a</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {complaint.asesor_asignado.nombre}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Análisis IA */}
          {clasificacionIA && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Análisis de Inteligencia Artificial
                </CardTitle>
                <CardDescription>
                  Clasificación automática del reclamo basada en IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Categoría Detectada</dt>
                    <dd className="mt-1 text-sm font-semibold capitalize">
                      {clasificacionIA.categoria}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Urgencia IA</dt>
                    <dd className="mt-1">{getUrgencyBadge(clasificacionIA.urgencia_detectada)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Nivel de Confianza</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {(clasificacionIA.confianza * 100).toFixed(0)}%
                    </dd>
                  </div>
                </dl>

                {clasificacionIA.sugerencias_resolucion && clasificacionIA.sugerencias_resolucion.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-2">
                        Sugerencias de Resolución
                      </dt>
                      <ul className="space-y-2">
                        {clasificacionIA.sugerencias_resolucion.map((sugerencia, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{sugerencia}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {clasificacionIA.referencias_politicas && clasificacionIA.referencias_politicas.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-2">
                        Referencias a Políticas
                      </dt>
                      {clasificacionIA.referencias_politicas.map((ref, idx) => (
                        <div key={idx} className="text-sm bg-purple-50 dark:bg-purple-950/30 p-3 rounded-md mb-2">
                          <div className="font-semibold">{ref.documento}</div>
                          <div className="text-muted-foreground">{ref.seccion}</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            Relevancia: {(ref.relevancia * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Análisis de Sentimiento */}
          {sentimientoAnalisis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Análisis de Sentimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Sentimiento</dt>
                    <dd className="mt-1 text-sm font-semibold capitalize flex items-center gap-2">
                      <span className="text-2xl">{getSentimentIcon(sentimientoAnalisis.sentimiento)}</span>
                      {sentimientoAnalisis.sentimiento}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Score</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {sentimientoAnalisis.score > 0 ? '+' : ''}{sentimientoAnalisis.score.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Tono</dt>
                    <dd className="mt-1 text-sm font-semibold capitalize">
                      {sentimientoAnalisis.tono}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Emociones Detectadas</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {sentimientoAnalisis.emociones.map((emocion, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs capitalize">
                          {emocion}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Lateral (1/3) - Timeline */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Timeline de Auditoría</CardTitle>
              <CardDescription>
                Historial de cambios y seguimientos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintTimeline seguimientos={seguimientos} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
