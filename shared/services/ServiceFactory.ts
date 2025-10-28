// Factory para crear servicios con las implementaciones correctas
// Solo gestión de reclamos - módulo Leads eliminado
import { IDataService } from './interfaces/IDataService';
import { SupabaseDataService } from './implementations/SupabaseDataService';

export class ServiceFactory {
  private static dataService: IDataService;

  static getDataService(): IDataService {
    if (!this.dataService) {
      this.dataService = new SupabaseDataService();
    }
    return this.dataService;
  }

  // Método para testing - permite inyectar mocks
  static setDataService(service: IDataService): void {
    this.dataService = service;
  }

  // Reset para testing
  static reset(): void {
    this.dataService = null as any;
  }
}