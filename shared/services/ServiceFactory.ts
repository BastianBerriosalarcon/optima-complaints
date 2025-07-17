// Factory para crear servicios con las implementaciones correctas
import { IDataService, ILeadRepository } from './interfaces/IDataService';
import { SupabaseDataService } from './implementations/SupabaseDataService';
import { SupabaseLeadRepository } from './implementations/SupabaseLeadRepository';

export class ServiceFactory {
  private static dataService: IDataService;
  private static leadRepository: ILeadRepository;

  static getDataService(): IDataService {
    if (!this.dataService) {
      this.dataService = new SupabaseDataService();
    }
    return this.dataService;
  }

  static getLeadRepository(): ILeadRepository {
    if (!this.leadRepository) {
      this.leadRepository = new SupabaseLeadRepository();
    }
    return this.leadRepository;
  }

  // Método para testing - permite inyectar mocks
  static setDataService(service: IDataService): void {
    this.dataService = service;
  }

  static setLeadRepository(repository: ILeadRepository): void {
    this.leadRepository = repository;
  }

  // Reset para testing
  static reset(): void {
    this.dataService = null as any;
    this.leadRepository = null as any;
  }
}