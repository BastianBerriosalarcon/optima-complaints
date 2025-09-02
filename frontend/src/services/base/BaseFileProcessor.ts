// Base file processor following SOLID principles

export interface ProcessingResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  errors: any[];
  processingTime: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'parsing' | 'validating' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
}

export abstract class BaseFileProcessor {
  protected onStatusChange?: (status: ProcessingStatus) => void;

  constructor(onStatusChange?: (status: ProcessingStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  abstract processFile(file: File): Promise<ProcessingResult>;

  protected updateStatus(
    status: ProcessingStatus['status'],
    progress: number,
    message: string
  ): void {
    if (this.onStatusChange) {
      this.onStatusChange({ status, progress, message });
    }
  }

  protected async parseFile(file: File): Promise<any[]> {
    this.updateStatus('parsing', 10, 'Analizando archivo...');
    
    // Simulate file parsing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock parsed data
        resolve([]);
      }, 1000);
    });
  }

  protected validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  protected validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}