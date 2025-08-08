# 🚀 OptimaCX Frontend

Frontend de la plataforma OptimaCX desarrollado con Next.js 14, TypeScript y Supabase.

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase
- **Estilos**: Tailwind CSS + shadcn/ui
- **Testing**: Jest + Playwright
- **Auth**: Supabase Auth

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Todos los tests
npm run test:all
```

## 📦 Build & Deploy

```bash
# Build de producción
npm run build

# Iniciar servidor
npm run start
```

## 📁 Estructura

```
src/
├── app/              # App Router (Next.js 14)
├── components/       # Componentes reutilizables
├── hooks/           # Custom hooks
├── lib/             # Utilidades y configuración
├── services/        # Servicios de API
└── types/           # Definiciones TypeScript
```

## 🔧 Configuración

Ver `.env.example` para las variables de entorno requeridas.

### Variables de Entorno Opcionales

- `NEXT_PUBLIC_TEMPO`: Habilita Tempo DevTools para análisis de performance (solo desarrollo)

## 🧪 Testing Setup

```bash
# Configuración completa de testing (unificado)
./testing-setup.sh

# Si necesitas permisos de administrador para dependencias de sistema
sudo ./testing-setup.sh
```