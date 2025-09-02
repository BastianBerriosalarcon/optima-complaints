// Base validator following SOLID principles

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'length' | 'pattern' | 'unique';
  message: string;
  value?: any;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
  errorType: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  validRows: number;
  invalidRows: number;
}

export abstract class BaseValidator {
  protected rules: ValidationRule[] = [];

  constructor(rules: ValidationRule[]) {
    this.rules = rules;
  }

  abstract validate(data: any[]): ValidationResult;

  protected validateField(
    value: any, 
    rule: ValidationRule, 
    row: number
  ): ValidationError | null {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value, rule, row);
      case 'format':
        return this.validateFormat(value, rule, row);
      case 'pattern':
        return this.validatePattern(value, rule, row);
      default:
        return null;
    }
  }

  private validateRequired(
    value: any, 
    rule: ValidationRule, 
    row: number
  ): ValidationError | null {
    if (!value || value.toString().trim() === '') {
      return {
        row,
        field: rule.field,
        message: rule.message,
        value,
        errorType: 'required_field'
      };
    }
    return null;
  }

  private validateFormat(
    value: any, 
    rule: ValidationRule, 
    row: number
  ): ValidationError | null {
    if (!value) return null;
    
    const formatPatterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+56\d{9}$/,
      date: /^\d{4}-\d{2}-\d{2}$/
    };

    const pattern = formatPatterns[rule.value as keyof typeof formatPatterns];
    if (pattern && !pattern.test(value.toString())) {
      return {
        row,
        field: rule.field,
        message: rule.message,
        value,
        errorType: 'invalid_format'
      };
    }
    return null;
  }

  private validatePattern(
    value: any, 
    rule: ValidationRule, 
    row: number
  ): ValidationError | null {
    if (!value || !rule.value) return null;
    
    const pattern = new RegExp(rule.value);
    if (!pattern.test(value.toString())) {
      return {
        row,
        field: rule.field,
        message: rule.message,
        value,
        errorType: 'invalid_format'
      };
    }
    return null;
  }
}