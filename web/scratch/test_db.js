const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pfqbhrfykyhzrhdeeiff.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcWJocmZ5a3loenJoZGVlaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwMzE5OSwiZXhwIjoyMTAzMDc5MTk5fQ.rHh6lefyUdzF6IfEplyln9h6N7J4NSf1mgxoaVaqTvA' // Service role key
);

async function test() {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .limit(1);
  console.log('Assessments table check:', { data, error });
}

test();
