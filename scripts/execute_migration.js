const fs = require('fs');
const https = require('https');

// Read the SQL migration file
const sqlContent = fs.readFileSync('/home/bastianberrios_a/supabase/migrations/20250123_advisor_workload_functions_updated.sql', 'utf8');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase configuration');
    process.exit(1);
}

// Split SQL content into individual statements
const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
    .map(s => s + ';');

console.log(`Found ${statements.length} SQL statements to execute`);

// Function to execute SQL via Supabase Edge Function or RPC
async function executeSqlStatements() {
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + '...');
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY
                },
                body: JSON.stringify({
                    sql: statement
                })
            });

            if (!response.ok) {
                console.error(`Error executing statement ${i + 1}: ${response.statusText}`);
                const errorText = await response.text();
                console.error(errorText);
            } else {
                console.log(`✓ Statement ${i + 1} executed successfully`);
            }
        } catch (error) {
            console.error(`Error executing statement ${i + 1}:`, error.message);
        }
    }
}

// Since we can't use fetch in Node.js without imports, let's use a simpler approach
// Create a simpler version that prints the statements
console.log('\n=== SQL STATEMENTS TO EXECUTE ===\n');
statements.forEach((statement, index) => {
    console.log(`-- Statement ${index + 1}`);
    console.log(statement);
    console.log('');
});

console.log('\n=== EXECUTION COMPLETE ===');
console.log('Please execute these statements manually in your Supabase SQL Editor or via psql.');