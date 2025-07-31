# Guía de Despliegue de n8n en Google Cloud Run

Esta guía detalla los pasos para desplegar una instancia de n8n en Google Cloud Run, replicando una configuración existente. Está diseñada para que un usuario con una cuenta de Google Cloud pueda realizar el despliegue en un nuevo proyecto.

## 1. Requisitos Previos

- **Cuenta de Google Cloud:** Se necesita una cuenta de GCP con permisos para crear y administrar recursos de Cloud Run, Secret Manager, IAM y Container Registry.
- **Proyecto de GCP:** Un proyecto de Google Cloud nuevo o existente donde se desplegará n8n. Para esta guía, usaremos el ID de proyecto `optima-cx-467616`.
- **SDK de `gcloud`:** La [herramienta de línea de comandos de `gcloud`](https://cloud.google.com/sdk/docs/install) debe estar instalada y configurada.
- **Docker:** Docker debe estar instalado localmente para construir la imagen del contenedor.

## 2. Configuración del Proyecto

Asegúrate de que las APIs necesarias estén habilitadas en tu nuevo proyecto:

```bash
gcloud services enable run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com --project optima-cx-467616
```

## 3. Construir y Subir la Imagen del Contenedor

En lugar de usar la imagen del proyecto antiguo, construiremos una nueva y la subiremos a tu nuevo proyecto.

1.  **Localiza tu `Dockerfile`:** Busca el archivo `Dockerfile` en tu repositorio. Basado en la estructura de tu proyecto, probablemente se encuentre en `config/docker/Dockerfile.proxy`.

2.  **Autentica Docker con gcloud:**
    ```bash
    gcloud auth configure-docker southamerica-west1-docker.pkg.dev --project optima-cx-467616
    ```

3.  **Construye y etiqueta la imagen:**
    ```bash
    # Navega al directorio que contiene el Dockerfile
    cd config/docker 

    # Construye la imagen
    docker build . -f Dockerfile.proxy -t southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-with-proxy:latest
    ```

4.  **Sube la imagen a Google Container Registry:**
    ```bash
    docker push southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-with-proxy:latest
    ```

## 4. Creación de Secretos

n8n utiliza secretos para almacenar información sensible. Debes crearlos en Secret Manager.

```bash
# 1. Clave de encriptación de n8n
gcloud secrets create n8n-encryption-key-dev --replication-policy="automatic" --project optima-cx-467616
echo -n "UNA_CLAVE_DE_ENCRIPTACION_MUY_SEGURA" | gcloud secrets versions add n8n-encryption-key-dev --data-file=- --project optima-cx-467616

# 2. Host de la base de datos
gcloud secrets create n8n-database-host-dev --replication-policy="automatic" --project optima-cx-467616
echo -n "LA_IP_O_HOST_DE_TU_BASE_DE_DATOS" | gcloud secrets versions add n8n-database-host-dev --data-file=- --project optima-cx-467616

# 3. Contraseña de la base de datos (¡Recomendado!)
gcloud secrets create n8n-database-password-dev --replication-policy="automatic" --project optima-cx-467616
echo -n "N8n.Optimacx2024" | gcloud secrets versions add n8n-database-password-dev --data-file=- --project optima-cx-467616
```

## 5. Configuración de la Cuenta de Servicio

Crea una cuenta de servicio para que n8n pueda acceder a los secretos.

```bash
# 1. Crear la cuenta de servicio
gcloud iam service-accounts create n8n-service-account-dev \
    --display-name="n8n Service Account" \
    --project optima-cx-467616

# 2. Otorgar permisos para acceder a los secretos
gcloud secrets add-iam-policy-binding n8n-encryption-key-dev \
    --member="serviceAccount:n8n-service-account-dev@optima-cx-467616.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project optima-cx-467616

gcloud secrets add-iam-policy-binding n8n-database-host-dev \
    --member="serviceAccount:n8n-service-account-dev@optima-cx-467616.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project optima-cx-467616

gcloud secrets add-iam-policy-binding n8n-database-password-dev \
    --member="serviceAccount:n8n-service-account-dev@optima-cx-467616.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project optima-cx-467616
```

## 6. Despliegue en Cloud Run

Utiliza el siguiente comando para desplegar el servicio.

```bash
gcloud run deploy n8n-optimacx-supabase \
    --image southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-with-proxy:latest \
    --project optima-cx-467616 \
    --region southamerica-west1 \
    --platform managed \
    --allow-unauthenticated \
    --service-account n8n-service-account-dev@optima-cx-467616.iam.gserviceaccount.com \
    --port 5678 \
    --min-instances 1 \
    --max-instances 20 \
    --concurrency 160 \
    --timeout 300 \
    --cpu 2 \
    --memory 4Gi \
    --set-env-vars="N8N_HOST=0.0.0.0,N8N_PORT=5678,N8N_PROTOCOL=https,WEBHOOK_URL=https://TU_NUEVA_URL_DE_CLOUD_RUN,GENERIC_TIMEZONE=America/Santiago,DB_TYPE=postgresdb,DB_POSTGRESDB_PORT=5432,DB_POSTGRESDB_DATABASE=postgres,DB_POSTGRESDB_USER=n8n,DB_POSTGRESDB_SCHEMA=public,N8N_DIAGNOSTICS_ENABLED=false,N8N_VERSION_NOTIFICATIONS_ENABLED=false" \
    --set-secrets=DB_POSTGRESDB_HOST=n8n-database-host-dev:latest,N8N_ENCRYPTION_KEY=n8n-encryption-key-dev:latest,DB_POSTGRESDB_PASSWORD=n8n-database-password-dev:latest
```

**Importante:** Reemplaza `https://TU_NUEVA_URL_DE_CLOUD_RUN` con la URL que Cloud Run te proporcionará después del despliegue.

## 7. Aclaraciones de Configuración

-   **Multi-inquilino (User Management):** La configuración actual **habilita la gestión de usuarios** por defecto en n8n. Esto te permite registrar múltiples usuarios, cada uno con sus propias credenciales y flujos de trabajo. No se necesita una variable de entorno adicional para esto, ya que es el comportamiento predeterminado.

-   **Telemetría:** La telemetría y las notificaciones de nuevas versiones están **deshabilitadas** a través de las siguientes variables de entorno:
    -   `N8N_DIAGNOSTICS_ENABLED=false`
    -   `N8N_VERSION_NOTIFICATIONS_ENABLED=false`

## 8. Verificación

Una vez que el despliegue se complete, `gcloud` te proporcionará la URL del servicio. Accede a esa URL en tu navegador para verificar que n8n se está ejecutando correctamente.
