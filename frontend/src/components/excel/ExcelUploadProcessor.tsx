"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, Send } from "lucide-react";
import { ExcelProcessor } from "@/services/ExcelProcessor";
import { ValidationRule } from "@/services/base/BaseValidator";

interface ExcelUploadProcessorProps {
  entityType: 'post_sale_surveys' | 'sales_surveys' | 'leads';
  validationRules: ValidationRule[];
  onProcessComplete: (result: any) => void;
  allowedFileTypes: string[];
  title: string;
  description: string;
}

interface ProcessingStatus {
  status: 'idle' | 'parsing' | 'validating' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
  errorType: string;
}

export default function ExcelUploadProcessor({
  entityType,
  validationRules,
  onProcessComplete,
  allowedFileTypes,
  title,
  description
}: ExcelUploadProcessorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processor = new ExcelProcessor(validationRules, setProcessingStatus);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!allowedFileTypes.includes(selectedFile.type)) {
        setProcessingStatus({
          status: 'error',
          progress: 0,
          message: 'Tipo de archivo no válido. Solo se permiten archivos Excel.'
        });
        return;
      }

      setFile(selectedFile);
      setProcessingStatus({ status: 'idle', progress: 0, message: '' });
      setValidationErrors([]);
      setProcessingResult(null);
      setParsedData([]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;

    try {
      const result = await processor.processFile(file);
      setProcessingResult(result);
      setValidationErrors(result.errors || []);
      
      if (result.success) {
        setProcessingStatus({
          status: 'success',
          progress: 100,
          message: `Procesamiento exitoso: ${result.processedRows} filas válidas de ${result.totalRows} total`
        });
      } else {
        setProcessingStatus({
          status: 'error',
          progress: 100,
          message: `Se encontraron ${result.errors?.length || 0} errores de validación`
        });
      }
    } catch (error) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: `Error al procesar archivo: ${error}`
      });
    }
  };

  const handleBulkUpload = async () => {
    if (!processingResult || !processingResult.success) return;

    try {
      await onProcessComplete(processingResult);
      
      // Reset form
      setFile(null);
      setParsedData([]);
      setValidationErrors([]);
      setProcessingResult(null);
      setProcessingStatus({ status: 'idle', progress: 0, message: '' });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: `Error al enviar datos: ${error}`
      });
    }
  };

  const downloadTemplate = () => {
    const templates = {
      post_sale_surveys: [
        'cliente_nombre,cliente_telefono,cliente_email,vehiculo_modelo,vehiculo_patente,fecha_servicio,sucursal_id,taller_id',
        'Juan Pérez,+56912345678,juan@email.com,Toyota Corolla,ABCD12,2024-01-15,SUC001,TAL001',
        'María González,+56987654321,maria@email.com,Honda Civic,EFGH34,2024-01-16,SUC002,TAL002'
      ],
      sales_surveys: [
        'cliente_nombre,cliente_telefono,cliente_email,vehiculo_modelo,fecha_venta,asesor_ventas_id',
        'Carlos López,+56911111111,carlos@email.com,Toyota RAV4,2024-01-15,ASE001',
        'Ana Martínez,+56922222222,ana@email.com,Honda CR-V,2024-01-16,ASE002'
      ],
      leads: [
        'nombre_cliente,telefono_cliente,email_cliente,modelo_interes,mensaje_original',
        'Pedro Silva,+56933333333,pedro@email.com,Nissan Sentra,Consulta por precio',
        'Laura Torres,+56944444444,laura@email.com,Hyundai Tucson,Información sobre financiamiento'
      ]
    };

    const template = templates[entityType].join('\n');
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_${entityType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'parsing':
      case 'validating':
      case 'processing':
        return 'excel-processing';
      case 'success':
        return 'excel-success';
      case 'error':
        return 'excel-error';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="excel-file">Archivo Excel</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={processingStatus.status === 'processing'}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formatos soportados: .xlsx, .xls
              </p>
            </div>
            
            <div className="flex flex-col justify-end">
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar Plantilla
              </Button>
            </div>
          </div>

          {/* Processing Status */}
          {processingStatus.status !== 'idle' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado del procesamiento</span>
                <span className="text-sm text-muted-foreground">
                  {processingStatus.progress}%
                </span>
              </div>
              <Progress value={processingStatus.progress} className="processing-progress" />
              {processingStatus.message && (
                <Alert className={getStatusColor(processingStatus.status)}>
                  {processingStatus.status === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{processingStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleProcessFile}
              disabled={!file || processingStatus.status === 'processing'}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {processingStatus.status === 'processing' ? 'Procesando...' : 'Procesar Archivo'}
            </Button>
            
            {processingResult?.success && (
              <Button
                onClick={handleBulkUpload}
                disabled={processingStatus.status === 'processing'}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                Enviar Datos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Errores de Validación</CardTitle>
            <CardDescription>
              Se encontraron {validationErrors.length} errores que deben corregirse:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <div key={index} className="excel-validation-error">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="destructive">Fila {error.row}</Badge>
                    <span className="font-medium">{error.field}:</span>
                    <span>{error.message}</span>
                  </div>
                  {error.value && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Valor: "{error.value}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Results Summary */}
      {processingResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Procesamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {processingResult.totalRows}
                </div>
                <div className="text-sm text-muted-foreground">Total de filas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {processingResult.processedRows}
                </div>
                <div className="text-sm text-muted-foreground">Filas válidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {processingResult.errors?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {processingResult.processingTime}
                </div>
                <div className="text-sm text-muted-foreground">Tiempo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}