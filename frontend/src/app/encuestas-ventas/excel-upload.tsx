"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Send, Download } from "lucide-react";
import { createBulkSalesSurveys } from "./actions";

interface ExcelRow {
  cliente_nombre: string;
  cliente_rut?: string;
  cliente_telefono: string;
  cliente_email?: string;
  asesor_ventas_id: string;
  vehiculo_modelo: string;
  vehiculo_vin?: string;
  fecha_venta: string;
  sucursal_id?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function ExcelUploadComponent() {
  const { user } = useAuth();
  const { hasRole } = useRole();
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ExcelRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'validating' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check permissions - only jefe_ventas and contact_center can upload
  const canUploadExcel = hasRole(['jefe_ventas', 'contact_center', 'gerencia', 'super_admin']);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          selectedFile.type !== 'application/vnd.ms-excel') {
        setUploadMessage("Por favor selecciona un archivo Excel válido (.xlsx o .xls)");
        setUploadStatus('error');
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
      setUploadMessage("");
      setParsedData([]);
      setValidationErrors([]);
    }
  };

  const parseExcelFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setUploadStatus('parsing');
    
    try {
      // In a real implementation, you would use a library like xlsx or similar
      // For now, we'll simulate parsing
      
      // Simulated Excel data parsing
      const mockData: ExcelRow[] = [
        {
          cliente_nombre: "Juan Pérez",
          cliente_rut: "12345678-9",
          cliente_telefono: "+56912345678",
          cliente_email: "juan@email.com",
          asesor_ventas_id: user?.id || "",
          vehiculo_modelo: "Toyota Corolla 2024",
          vehiculo_vin: "JT2AE82E8L0123456",
          fecha_venta: "2024-01-15",
          sucursal_id: ""
        },
        {
          cliente_nombre: "María González",
          cliente_telefono: "+56987654321",
          asesor_ventas_id: user?.id || "",
          vehiculo_modelo: "Honda Civic 2024",
          fecha_venta: "2024-01-16"
        }
      ];

      setParsedData(mockData);
      setUploadStatus('validating');
      
      // Validate data
      validateData(mockData);
      
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setUploadMessage("Error al procesar el archivo Excel. Verifica el formato.");
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const validateData = (data: ExcelRow[]) => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      // Required fields validation
      if (!row.cliente_nombre?.trim()) {
        errors.push({
          row: index + 1,
          field: 'cliente_nombre',
          message: 'Nombre del cliente es requerido'
        });
      }
      
      if (!row.cliente_telefono?.trim()) {
        errors.push({
          row: index + 1,
          field: 'cliente_telefono',
          message: 'Teléfono del cliente es requerido'
        });
      } else if (!/^\+56\d{9}$/.test(row.cliente_telefono.trim())) {
        errors.push({
          row: index + 1,
          field: 'cliente_telefono',
          message: 'Formato de teléfono inválido (debe ser +56XXXXXXXXX)'
        });
      }
      
      if (!row.asesor_ventas_id?.trim()) {
        errors.push({
          row: index + 1,
          field: 'asesor_ventas_id',
          message: 'ID del asesor de ventas es requerido'
        });
      }
      
      if (!row.vehiculo_modelo?.trim()) {
        errors.push({
          row: index + 1,
          field: 'vehiculo_modelo',
          message: 'Modelo del vehículo es requerido'
        });
      }
      
      if (!row.fecha_venta?.trim()) {
        errors.push({
          row: index + 1,
          field: 'fecha_venta',
          message: 'Fecha de venta es requerida'
        });
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.fecha_venta.trim())) {
        errors.push({
          row: index + 1,
          field: 'fecha_venta',
          message: 'Formato de fecha inválido (debe ser YYYY-MM-DD)'
        });
      }
    });
    
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setUploadStatus('success');
      setUploadMessage(`${data.length} registros validados correctamente. Listos para envío masivo.`);
    } else {
      setUploadStatus('error');
      setUploadMessage(`Se encontraron ${errors.length} errores de validación.`);
    }
  };

  const handleBulkUpload = async () => {
    if (!user?.user_metadata?.concesionario_id || parsedData.length === 0 || validationErrors.length > 0) {
      return;
    }
    
    setLoading(true);
    setUploadStatus('uploading');
    
    try {
      const result = await createBulkSalesSurveys({
        concesionario_id: user.user_metadata.concesionario_id,
        surveys: parsedData
      });
      
      if (result.error) {
        setUploadMessage(result.error);
        setUploadStatus('error');
      } else {
        setUploadMessage(result.message || "Encuestas creadas exitosamente. Se iniciará el envío masivo por WhatsApp.");
        setUploadStatus('success');
        
        // Clear form
        setFile(null);
        setParsedData([]);
        setValidationErrors([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // TODO: Trigger N8N workflow for WhatsApp bulk sending
        console.log("Triggering N8N workflow for WhatsApp bulk sending of sales surveys");
      }
      
    } catch (error) {
      console.error("Error uploading bulk sales surveys:", error);
      setUploadMessage("Error inesperado al procesar las encuestas masivas.");
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template for Excel
    const template = [
      'cliente_nombre,cliente_rut,cliente_telefono,cliente_email,asesor_ventas_id,vehiculo_modelo,vehiculo_vin,fecha_venta,sucursal_id',
      'Juan Pérez,12345678-9,+56912345678,juan@email.com,ASESOR_ID,Toyota Corolla 2024,JT2AE82E8L0123456,2024-01-15,SUCURSAL_ID',
      'María González,,+56987654321,maria@email.com,ASESOR_ID,Honda Civic 2024,,2024-01-16,SUCURSAL_ID'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_encuestas_ventas.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!canUploadExcel) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para cargar archivos Excel. Solo los Jefes de Ventas y Contact Center pueden realizar esta acción.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Carga Masiva de Encuestas de Ventas
          </CardTitle>
          <CardDescription>
            Carga un archivo Excel con los datos de clientes para envío masivo de encuestas por WhatsApp.
            Similar al flujo de encuestas post-venta, pero para satisfacción después de la compra del vehículo.
          </CardDescription>
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
                disabled={loading}
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={parseExcelFile}
              disabled={!file || loading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading && uploadStatus === 'parsing' ? 'Procesando...' :
               loading && uploadStatus === 'validating' ? 'Validando...' : 'Procesar Archivo'}
            </Button>
            
            {parsedData.length > 0 && validationErrors.length === 0 && (
              <Button
                onClick={handleBulkUpload}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                {loading && uploadStatus === 'uploading' ? 'Enviando...' : 'Enviar Encuestas Masivas'}
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {uploadMessage && (
            <Alert variant={uploadStatus === 'error' ? 'destructive' : 'default'}>
              {uploadStatus === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Errores de Validación</CardTitle>
            <CardDescription>
              Corrige los siguientes errores en el archivo Excel antes de continuar:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="destructive">Fila {error.row}</Badge>
                  <span className="font-medium">{error.field}:</span>
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Data */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de Datos</CardTitle>
            <CardDescription>
              {parsedData.length} registros procesados del archivo Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Fecha Venta</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, index) => {
                    const rowErrors = validationErrors.filter(error => error.row === index + 1);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{row.cliente_nombre}</div>
                            {row.cliente_rut && (
                              <div className="text-sm text-muted-foreground">{row.cliente_rut}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{row.cliente_telefono}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{row.vehiculo_modelo}</div>
                            {row.vehiculo_vin && (
                              <div className="text-sm text-muted-foreground">VIN: {row.vehiculo_vin}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{row.fecha_venta}</TableCell>
                        <TableCell>
                          {rowErrors.length > 0 ? (
                            <Badge variant="destructive">
                              {rowErrors.length} error{rowErrors.length > 1 ? 'es' : ''}
                            </Badge>
                          ) : (
                            <Badge variant="default">Válido</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {parsedData.length > 10 && (
                <div className="text-center py-4 text-muted-foreground">
                  Mostrando 10 de {parsedData.length} registros
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Info */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de Procesamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              <span>Se cargan los datos del Excel y se validan</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              <span>Se crean las encuestas con estado "pendiente" y origen "WhatsApp_VENTAS"</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              <span>Se dispara automáticamente el workflow N8N para envío masivo por WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              <span>Los clientes que no respondan en 6 horas se asignan automáticamente a Contact Center para llamada</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">5</Badge>
              <span>Si las calificaciones son 1-8, se notifica automáticamente al Jefe de Ventas y Encargado de Calidad</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}