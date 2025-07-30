const fs = require('fs');
const path = require('path');

// Configuración de la instancia n8n
const N8N_CONFIG = {
  host: 'https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNTIyYzQ1Ny0zMTkxLTQ1OTAtOGNiMi0yM2FmOTNmYjZhOWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzODQ3NTM4fQ.-k3vQzfiMSYvfHRQ33eZ78p7pU7zB8G13X3777SSVL0'
};

// Función para hacer llamadas HTTP a la API de n8n
async function callN8nAPI(method, endpoint, data = null) {
  const url = `${N8N_CONFIG.host}${endpoint}`;
  const headers = {
    'X-N8N-API-KEY': N8N_CONFIG.apiKey,
    'Content-Type': 'application/json'
  };

  const options = {
    method: method,
    headers: headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`🌐 Llamando API: ${method} ${endpoint}`);
    
    // Usar fetch para hacer la llamada HTTP
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (response.ok) {
      return { success: true, data: responseData };
    } else {
      return { success: false, error: responseData.message || 'Error en la API' };
    }
  } catch (error) {
    console.error('❌ Error en llamada API:', error.message);
    return { success: false, error: error.message };
  }
}

// Función para listar workflows existentes usando la API real
async function listExistingWorkflows() {
  console.log('📋 Listando workflows existentes en n8n...\n');
  
  const result = await callN8nAPI('GET', '/api/v1/workflows');
  
  if (result.success) {
    const workflows = result.data.data || [];
    console.log(`📊 Workflows encontrados: ${workflows.length}\n`);
    
    workflows.forEach(wf => {
      console.log(`   • ${wf.name} (${wf.active ? 'Activo' : 'Inactivo'}) - ID: ${wf.id}`);
    });
    
    return workflows;
  } else {
    console.log(`❌ Error listando workflows: ${result.error}`);
    return [];
  }
}

// Función para crear un workflow usando la API real con formato correcto
async function createWorkflow(workflowData) {
  console.log(`📤 Creando workflow: ${workflowData.name}`);
  
  // Formato correcto para la API de n8n con settings requerido
  const workflowToCreate = {
    name: workflowData.name,
    nodes: workflowData.nodes,
    connections: workflowData.connections,
    settings: {} // Settings mínimo requerido
  };

  const result = await callN8nAPI('POST', '/api/v1/workflows', workflowToCreate);
  
  if (result.success) {
    console.log(`✅ Workflow creado exitosamente`);
    console.log(`   ID: ${result.data.id}`);
    console.log(`   URL: ${N8N_CONFIG.host}/workflow/${result.data.id}`);
    return { success: true, workflowId: result.data.id };
  } else {
    console.log(`❌ Error creando workflow: ${result.error}`);
    return { success: false, error: result.error };
  }
}

// Función para leer un workflow JSON
function readWorkflowFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error.message);
    return null;
  }
}

// Función para cargar un workflow específico
async function uploadSpecificWorkflow(workflowPath, workflowName) {
  console.log(`\n📤 Cargando workflow: ${workflowName}`);
  
  const workflow = readWorkflowFile(workflowPath);
  if (!workflow) {
    console.log(`❌ No se pudo leer el workflow: ${workflowPath}`);
    return { success: false, error: 'Archivo no encontrado o inválido' };
  }

  // Preparar el workflow para la API de n8n con formato correcto
  const workflowToUpload = {
    name: workflowName,
    nodes: workflow.nodes || [],
    connections: workflow.connections || {},
    settings: workflow.settings || {} // Usar settings del workflow o vacío
  };

  console.log(`📋 Detalles del workflow:`);
  console.log(`   Nombre: ${workflowToUpload.name}`);
  console.log(`   Nodos: ${workflowToUpload.nodes.length}`);
  console.log(`   Conexiones: ${Object.keys(workflowToUpload.connections).length}`);
  console.log(`   Settings: ${Object.keys(workflowToUpload.settings).length} propiedades`);

  return await createWorkflow(workflowToUpload);
}

// Función principal
async function main() {
  console.log('🚀 Iniciando carga de workflows usando API directa de n8n...\n');
  
  // Listar workflows existentes
  await listExistingWorkflows();
  
  console.log('\n📤 Cargando workflow de prueba...\n');
  
  // Cargar el workflow de prueba
  const workflowPath = 'applications/n8n-workflows/leads/puntuacion-ia-leads.json';
  const result = await uploadSpecificWorkflow(workflowPath, 'LEADS_Lead_Scoring_de_Calidad');

  console.log('\n📊 RESUMEN DE CARGA');
  console.log('===================');
  if (result.success) {
    console.log('✅ Carga exitosa');
    console.log(`   ID del workflow: ${result.workflowId}`);
    console.log(`   URL del workflow: ${N8N_CONFIG.host}/workflow/${result.workflowId}`);
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Ve a tu instancia n8n y verifica que el workflow se haya creado');
    console.log('   2. Activa el workflow manualmente cuando estés listo');
    console.log('   3. Configura las credenciales necesarias');
    console.log('   4. Prueba el workflow con datos de prueba');
  } else {
    console.log('❌ Carga fallida');
    console.log(`   Error: ${result.error}`);
    console.log('\n🔧 Solución:');
    console.log('   1. Verifica que la URL de n8n sea correcta');
    console.log('   2. Revisa que el API key sea válido');
    console.log('   3. Verifica la conectividad con tu instancia de n8n');
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  callN8nAPI,
  listExistingWorkflows,
  createWorkflow,
  uploadSpecificWorkflow
}; 