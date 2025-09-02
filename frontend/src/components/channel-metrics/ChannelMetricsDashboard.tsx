"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartColumnIncreasing, QrCode, MessageSquare, Phone, TrendingUp, TrendingDown } from "lucide-react";

interface ChannelMetrics {
  qr_responses: {
    total_scanned: number;
    completed_surveys: number;
    completion_rate: number;
    average_time: string;
  };
  whatsapp_responses: {
    total_sent: number;
    responses_received: number;
    completion_rate: number;
    average_response_time: string;
  };
  call_responses: {
    total_assigned: number;
    completed_calls: number;
    completion_rate: number;
    average_call_duration: string;
  };
  overall_nps: number;
  satisfaction_distribution: {
    excelente: number;
    bueno: number;
    regular: number;
    bajo: number;
  };
}

interface ChannelMetricsDashboardProps {
  metrics: ChannelMetrics;
  title?: string;
  showComparison?: boolean;
}

export default function ChannelMetricsDashboard({
  metrics,
  title = "Métricas por Canal",
  showComparison = true
}: ChannelMetricsDashboardProps) {

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionRateStatus = (rate: number) => {
    if (rate >= 70) return "Excelente";
    if (rate >= 50) return "Bueno";
    if (rate >= 30) return "Regular";
    return "Bajo";
  };

  const getNPSColor = (nps: number) => {
    if (nps >= 8) return "text-green-600";
    if (nps >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const totalSatisfactionResponses = Object.values(metrics.satisfaction_distribution)
    .reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartColumnIncreasing className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="channel-metrics-grid">
            {/* QR Channel */}
            <div className="metric-card channel-qr">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  <h3 className="font-semibold">Código QR</h3>
                </div>
                <Badge className="channel-qr">
                  {getCompletionRateStatus(metrics.qr_responses.completion_rate)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Escaneados</span>
                  <span className="font-medium">{metrics.qr_responses.total_scanned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completados</span>
                  <span className="font-medium">{metrics.qr_responses.completed_surveys}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasa de Finalización</span>
                    <span className={`font-bold ${getCompletionRateColor(metrics.qr_responses.completion_rate)}`}>
                      {metrics.qr_responses.completion_rate}%
                    </span>
                  </div>
                  <Progress value={metrics.qr_responses.completion_rate} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tiempo Promedio</span>
                  <span className="font-medium">{metrics.qr_responses.average_time}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Channel */}
            <div className="metric-card channel-whatsapp">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="font-semibold">WhatsApp</h3>
                </div>
                <Badge className="channel-whatsapp">
                  {getCompletionRateStatus(metrics.whatsapp_responses.completion_rate)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Enviados</span>
                  <span className="font-medium">{metrics.whatsapp_responses.total_sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Respuestas</span>
                  <span className="font-medium">{metrics.whatsapp_responses.responses_received}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasa de Respuesta</span>
                    <span className={`font-bold ${getCompletionRateColor(metrics.whatsapp_responses.completion_rate)}`}>
                      {metrics.whatsapp_responses.completion_rate}%
                    </span>
                  </div>
                  <Progress value={metrics.whatsapp_responses.completion_rate} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tiempo Promedio</span>
                  <span className="font-medium">{metrics.whatsapp_responses.average_response_time}</span>
                </div>
              </div>
            </div>

            {/* Call Channel */}
            <div className="metric-card channel-call">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <h3 className="font-semibold">Llamadas</h3>
                </div>
                <Badge className="channel-call">
                  {getCompletionRateStatus(metrics.call_responses.completion_rate)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Asignadas</span>
                  <span className="font-medium">{metrics.call_responses.total_assigned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completadas</span>
                  <span className="font-medium">{metrics.call_responses.completed_calls}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasa de Éxito</span>
                    <span className={`font-bold ${getCompletionRateColor(metrics.call_responses.completion_rate)}`}>
                      {metrics.call_responses.completion_rate}%
                    </span>
                  </div>
                  <Progress value={metrics.call_responses.completion_rate} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duración Promedio</span>
                  <span className="font-medium">{metrics.call_responses.average_call_duration}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall NPS and Satisfaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NPS General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getNPSColor(metrics.overall_nps)}`}>
                {metrics.overall_nps}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Net Promoter Score
              </div>
              <Progress value={(metrics.overall_nps / 10) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Satisfacción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.satisfaction_distribution).map(([level, count]) => {
                const percentage = totalSatisfactionResponses > 0 
                  ? (count / totalSatisfactionResponses) * 100 
                  : 0;
                
                const colorMap = {
                  excelente: 'bg-green-500',
                  bueno: 'bg-blue-500',
                  regular: 'bg-yellow-500',
                  bajo: 'bg-red-500'
                };

                return (
                  <div key={level} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{level}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colorMap[level as keyof typeof colorMap]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Comparison */}
      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Canales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Eficiencia de cada canal basada en tasas de finalización
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Código QR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">
                      {metrics.qr_responses.completion_rate}%
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">
                      {metrics.whatsapp_responses.completion_rate}%
                    </span>
                    {metrics.whatsapp_responses.completion_rate >= 60 ? (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Llamadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">
                      {metrics.call_responses.completion_rate}%
                    </span>
                    {metrics.call_responses.completion_rate >= 60 ? (
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}