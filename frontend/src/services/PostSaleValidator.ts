// Post-sale survey validator implementation

import { BaseValidator, ValidationResult, ValidationError } from './base/BaseValidator';

export interface PostSaleSurveyData {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  vehiculo_modelo: string;
  vehiculo_patente: string;
  fecha_servicio: string;
  sucursal_id: string;
  taller_id: string;
}

export class PostSaleValidator extends BaseValidator {
  validate(data: PostSaleSurveyData[]): ValidationResult {
    const errors: ValidationError[] = [];
    let validRows = 0;

    data.forEach((row, index) => {
      const rowErrors = this.validateRow(row, index + 1);
      if (rowErrors.length === 0) {
        validRows++;
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validRows,
      invalidRows: data.length - validRows
    };
  }

  private validateRow(
    row: PostSaleSurveyData, 
    rowNumber: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate each field using base validator
    this.rules.forEach(rule => {
      const value = row[rule.field as keyof PostSaleSurveyData];
      const error = this.validateField(value, rule, rowNumber);
      if (error) {
        errors.push(error);
      }
    });

    return errors;
  }

  // Check for duplicates based on phone number
  detectDuplicates(data: PostSaleSurveyData[]): ValidationError[] {
    const phoneNumbers = new Set<string>();
    const duplicates: ValidationError[] = [];

    data.forEach((row, index) => {
      if (phoneNumbers.has(row.cliente_telefono)) {
        duplicates.push({
          row: index + 1,
          field: 'cliente_telefono',
          message: 'Número de teléfono duplicado',
          value: row.cliente_telefono,
          errorType: 'duplicate_entry'
        });
      } else {
        phoneNumbers.add(row.cliente_telefono);
      }
    });

    return duplicates;
  }
}