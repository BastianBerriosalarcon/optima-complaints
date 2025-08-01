# Guía de Configuración: n8n Multitenant

Este documento describe la arquitectura y los pasos necesarios para configurar una instancia de n8n en modo "multitenant" (multi-inquilino). Esta configuración permite servir a múltiples clientes o equipos desde una única instancia de n8n, manteniendo sus datos, flujos de trabajo y credenciales completamente aislados.

La arquitectura se basa en un patrón común y robusto: un **proxy inverso** que gestiona el enrutamiento de los tenants y una **única instancia de n8n** que se apoya en **esquemas de PostgreSQL** para el aislamiento de datos.

---

## Arquitectura Requerida

Los tres componentes fundamentales son:

1.  **Proxy Inverso (Reverse Proxy)**:
    *   **Función**: Es el único punto de entrada público. Su tarea es identificar a qué tenant pertenece cada solicitud HTTP basándose en el subdominio (ej: `cliente-a.midominio.com`).
    *   **Implementación**: Se puede usar Nginx, Caddy, Traefik o una aplicación custom. Nginx es una opción popular y robusta.

2.  **Instancia de n8n**:
    *   **Función**: Ejecuta los flujos de trabajo. Debe estar configurada para entender el modo multitenant. No se expone directamente a internet.
    *   **Aislamiento**: n8n crea y gestiona un esquema de base de datos separado para cada tenant, asegurando que los datos no se mezclen.

3.  **Base de Datos PostgreSQL**:
    *   **Función**: Almacena todos los datos (workflows, credenciales, ejecuciones).
    *   **Requisito**: Debe ser PostgreSQL, ya que n8n utiliza su capacidad de manejar múltiples esquemas para lograr el aislamiento de datos. Se usa una sola base de datos con múltiples esquemas dentro.

---

## Paso 1: Configurar la Base de Datos PostgreSQL

Asegúrate de tener una base de datos PostgreSQL accesible para n8n. No necesitas crear los esquemas para cada tenant manualmente; n8n lo hará automáticamente la primera vez que reciba una solicitud para un nuevo tenant.

**Datos que necesitarás:**
*   Host de la base de datos (ej: `db.example.com`)
*   Puerto (ej: `5432`)
*   Nombre de la base de datos (ej: `n8n_main`)
*   Usuario y contraseña con permisos para crear esquemas.

---

## Paso 2: Configurar el Proxy Inverso

El proxy es el componente más crítico para el enrutamiento. A continuación, se muestra un ejemplo usando **Nginx**.

#### a) Crear el `Dockerfile` para el Proxy

Crea un archivo `Dockerfile.proxy` para construir la imagen del contenedor del proxy.

```Dockerfile
# Dockerfile.proxy
FROM nginx:alpine

# Copia tu archivo de configuración de Nginx al contenedor
COPY nginx.conf /etc/nginx/nginx.conf

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### b) Crear el archivo de configuración `nginx.conf`

Este archivo contiene la lógica para identificar al tenant y pasar la información a n8n.

```nginx
# nginx.conf
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        # Captura el subdominio. Ej: "cliente-a" de "cliente-a.midominio.com"
        server_name ~^(?<tenant>.+)\.midominio\.com$;

        location / {
            proxy_pass http://n8n:5678; # Apunta al servicio de n8n
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Cabecera clave para n8n: Pasa el nombre del tenant capturado
            proxy_set_header X-Tenant-Id $tenant;

            # Necesario para WebSockets (ej: para ver ejecuciones en vivo)
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
        }
    }
}
```
**Nota Importante:** El nombre de la cabecera (`X-Tenant-Id` en este ejemplo) es arbitrario, pero debe coincidir con la variable de entorno `TENANT_HEADER_NAME` que configurarás en n8n.

---

## Paso 3: Configurar la Instancia de n8n

La configuración de n8n se realiza a través de variables de entorno. Estas le indican que debe operar en modo multitenant y cómo conectarse a la base de datos.

A continuación, se listan las variables de entorno **esenciales**:

```env
# --- Configuración Multitenant ---
N8N_MULTI_TENANCY=true
TENANT_HEADER_NAME=X-Tenant-Id # Debe coincidir con la cabecera del proxy

# --- Configuración de la Base de Datos ---
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=tu-db-host.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n_main
DB_POSTGRESDB_USER=tu_usuario
DB_POSTGRESDB_PASSWORD=tu_contraseña
# ¡IMPORTANTE! No definas DB_POSTGRESDB_SCHEMA. n8n lo gestionará dinámicamente.

# --- Configuración General ---
N8N_HOST="0.0.0.0" # Escucha en todas las interfaces dentro del contenedor
N8N_PORT=5678
# El WEBHOOK_URL debe ser genérico para que funcione para todos los tenants.
# n8n reemplazará el asterisco (*) con el subdominio del tenant correspondiente.
WEBHOOK_URL=https://*.midominio.com/
```

---

## Paso 4: Orquestación con Docker Compose

Un archivo `docker-compose.yml` es ideal para ejecutar ambos servicios (proxy y n8n) en un entorno de desarrollo o en un solo servidor.

```yaml
# docker-compose.yml
version: '3.8'

services:
  # El proxy que se expone al mundo
  proxy:
    build:
      context: .
      dockerfile: Dockerfile.proxy
    ports:
      - "80:80" # Mapea el puerto 80 del host al 80 del contenedor
    networks:
      - n8n-network

  # La instancia de n8n, no expuesta directamente
  n8n:
    image: n8nio/n8n
    restart: always
    environment:
      # --- Pega aquí todas las variables de entorno de n8n del Paso 3 ---
      - N8N_MULTI_TENANCY=true
      - TENANT_HEADER_NAME=X-Tenant-Id
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db # Suponiendo que la DB corre en otro contenedor
      - DB_POSTGRESDB_DATABASE=n8n_main
      # ... etc.
      - WEBHOOK_URL=https://*.midominio.com/
    networks:
      - n8n-network

networks:
  n8n-network:
```

---

## Paso 5: Consideraciones para Despliegue en Cloud Run

Cloud Run no soporta directamente `docker-compose` con múltiples contenedores en un solo servicio. Tienes dos opciones principales:

1.  **Dos Servicios Separados (Recomendado)**:
    *   Despliega el **proxy** como un servicio de Cloud Run público.
    *   Despliega **n8n** como otro servicio de Cloud Run, configurándolo para aceptar solo tráfico interno (desde el proxy).
    *   En la configuración del proxy, `proxy_pass` apuntaría a la URL interna del servicio de n8n que Cloud Run proporciona.

2.  **Contenedor Único con Múltiples Procesos**:
    *   Crea una imagen de contenedor que incluya tanto Nginx como n8n.
    *   Utiliza un gestor de procesos como `supervisord` o un script de inicio (`startup.sh`) para lanzar ambos procesos (Nginx y n8n) cuando el contenedor arranque.
    *   Esta opción puede ser más compleja de configurar y mantener.

En ambos casos, las variables de entorno de n8n se configuran directamente en la definición del servicio de Cloud Run.
