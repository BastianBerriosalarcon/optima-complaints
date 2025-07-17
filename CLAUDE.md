# OptimaCX Platform - Proyecto Restructurado

## Arquitectura Actual

### 🏗️ Estructura del Proyecto
```
optimacx-platform/
├── 📁 shared/                    # Servicios y configuración compartida
│   ├── config/                   # Configuración centralizada
│   ├── services/                 # Abstracciones e implementaciones
│   └── types/                    # Tipos compartidos
├── 📁 frontend/                  # Next.js Frontend
├── 📁 applications/              # Custom Nodes N8N
├── 📁 database/                  # Esquemas y migraciones
└── 📁 infrastructure/            # Terraform módulos
```

### 🔧 Servicios Centralizados

#### ConfigService
- **Ubicación**: `shared/config/ConfigService.ts`
- **Función**: Configuración centralizada con manejo de ambientes
- **Uso**: `config.getDatabaseConfig()`, `config.getEnvironment()`

#### ServiceFactory
- **Ubicación**: `shared/services/ServiceFactory.ts`
- **Función**: Factory pattern para inyección de dependencias
- **Uso**: `ServiceFactory.getDataService()`, `ServiceFactory.getLeadRepository()`

#### Abstracciones Implementadas
- **IDataService**: Abstracción para operaciones de base de datos
- **ILeadRepository**: Repositorio para leads con operaciones CRUD
- **AuthService**: Servicio de autenticación usando abstracciones

### 🚀 Comandos Comunes

#### Desarrollo
```bash
# Instalar dependencias shared
cd shared && npm install

# Construir shared
cd shared && npm run build

# Desarrollo frontend
cd frontend && npm run dev
```

#### Testing
```bash
# Ejecutar tests (determinar framework primero)
# npm run test

# Linting
# npm run lint

# Type checking
# npm run typecheck
```

### 🔄 Cambios Recientes

#### ✅ Completado
1. **Configuración centralizada** - ConfigService implementado
2. **Abstracciones de datos** - IDataService y repositorios
3. **Frontend refactorizado** - Usa AuthService
4. **Custom nodes actualizados** - Usan ServiceFactory
5. **Middlewares limpiados** - Eliminados duplicados

#### 📋 Variables de Entorno
```bash
# Requeridas en producción
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NODE_ENV=production
```

### 🎯 Próximos Pasos Recomendados

1. **Implementar testing** - Definir framework y crear tests
2. **Completar repositorios** - TenantRepository, AdvisorRepository
3. **Migrar componentes restantes** - Actualizar auth actions
4. **Documentar APIs** - Interfaces y contratos
5. **Preparar para multi-proyecto** - Separación según crecimiento

### 📚 Referencias

- Configuración: `shared/config/ConfigService.ts`
- Servicios: `shared/services/ServiceFactory.ts`
- Abstracciones: `shared/services/interfaces/IDataService.ts`
- Implementaciones: `shared/services/implementations/`

### 🔍 Debugging

- **Logs centralizados** - ConfigService maneja logging level
- **Error handling** - ServiceResponse pattern consistente
- **Validación** - Validación en servicios y repositorios

---

**Proyecto listo para escalado horizontal y separación en múltiples proyectos GCP**