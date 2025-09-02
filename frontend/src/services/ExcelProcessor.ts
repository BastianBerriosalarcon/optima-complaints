// Excel processor implementation

import { BaseFileProcessor, ProcessingResult } from './base/BaseFileProcessor';
import { PostSaleValidator } from './PostSaleValidator';
import { ValidationRule } from './base/BaseValidator';

export class ExcelProcessor extends BaseFileProcessor {
  private validator: PostSaleValidator;

  constructor(
    validationRules: ValidationRule[],
    onStatusChange?: (status: any) => void
  ) {
    super(onStatusChange);
    this.validator = new PostSaleValidator(validationRules);
  }

  async processFile(file: File): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // Validate file type and size
      if (!this.validateFileType(file, [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ])) {
        throw new Error('Tipo de archivo no válido');
      }

      if (!this.validateFileSize(file, 10 * 1024 * 1024)) { // 10MB
        throw new Error('Archivo demasiado grande');
      }

      // Parse file
      this.updateStatus('parsing', 20, 'Procesando archivo Excel...');
      const rawData = await this.parseExcelFile(file);

      // Validate data
      this.updateStatus('validating', 60, 'Validando datos...');
      const validationResult = this.validator.validate(rawData);

      // Check for duplicates
      const duplicates = this.validator.detectDuplicates(rawData);

      this.updateStatus('processing', 90, 'Finalizando procesamiento...');

      const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

      const result: ProcessingResult = {
        success: validationResult.isValid && duplicates.length === 0,
        totalRows: rawData.length,
        processedRows: validationResult.validRows,
        errors: [...validationResult.errors, ...duplicates],
        processingTime
      };

      this.updateStatus('success', 100, 'Procesamiento completado');
      return result;

    } catch (error) {
      this.updateStatus('error', 0, `Error: ${error}`);
      throw error;
    }
  }

  private async parseExcelFile(file: File): Promise<any[]> {
    // In real implementation, use a library like xlsx
    // For now, return mock data
    return [
      {
        cliente_nombre: "Juan Pérez",
        cliente_telefono: "+56912345678",
        cliente_email: "juan@email.com",
        vehiculo_modelo: "Toyota Corolla",
        vehiculo_patente: "ABCD12",
        fecha_servicio: "2024-01-15",
        sucursal_id: "SUC001",
        taller_id: "TAL001"
      }
    ];
  }
}