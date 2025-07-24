#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://omsxsirtxfrvxiddhmxr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc3hzaXJ0eGZydnhpZGRobXhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc4MTQzOSwiZXhwIjoyMDY3MzU3NDM5fQ.HEyFGvRX891zt982BOQFZBVkaO_tBfnC1fof20UGgMk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createSearchKnowledgeBaseFunction = async () => {
  console.log('Creating search_knowledge_base function...');
  
  const sql = `
    CREATE OR REPLACE FUNCTION search_knowledge_base(
      query_embedding vector(768),
      tenant_filter text,
      similarity_threshold float DEFAULT 0.7,
      max_results int DEFAULT 10
    )
    RETURNS TABLE(
      id uuid,
      contenido text,
      similarity float,
      metadata jsonb,
      documento_id uuid,
      chunk_index int
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        dc.id,
        dc.contenido,
        (1 - (dc.embedding <=> query_embedding)) as similarity,
        dc.metadata,
        dc.documento_id,
        dc.chunk_index
      FROM documento_chunks dc
      INNER JOIN documentos_conocimiento dk ON dc.documento_id = dk.id
      WHERE dk.concesionario_id = tenant_filter::uuid
        AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold
      ORDER BY dc.embedding <=> query_embedding
      LIMIT max_results;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating function:', error);
      
      // Try alternative approach using raw query
      const { data: altData, error: altError } = await supabase
        .from('pg_stat_activity')
        .select('*')
        .limit(1);
        
      if (altError) {
        console.error('Connection test failed:', altError);
        return;
      }
      
      console.log('Connection successful. Trying direct SQL execution...');
      
      // Execute SQL directly using the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        return;
      }
      
      const result = await response.json();
      console.log('Function creation result:', result);
      
    } else {
      console.log('Function created successfully:', data);
    }
    
  } catch (err) {
    console.error('Exception occurred:', err);
    process.exit(1);
  }
};

// Test the function after creation
const testSearchFunction = async () => {
  console.log('Testing search_knowledge_base function...');
  
  try {
    // Create a dummy embedding vector (768 dimensions of zeros)
    const dummyEmbedding = Array(768).fill(0);
    const testTenantId = '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: dummyEmbedding,
      tenant_filter: testTenantId,
      similarity_threshold: 0.1,
      max_results: 5
    });
    
    if (error) {
      console.error('Test error:', error);
    } else {
      console.log('Test successful. Results:', data);
    }
    
  } catch (err) {
    console.error('Test exception:', err);
  }
};

// Main execution
const main = async () => {
  await createSearchKnowledgeBaseFunction();
  await testSearchFunction();
  console.log('Done!');
};

main().catch(console.error);