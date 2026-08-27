const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://pfqbhrfykyhzrhdeeiff.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcWJocmZ5a3loenJoZGVlaWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDMxOTksImV4cCI6MjEwMzA3OTE5OX0.A3WZkja5iDp8be06mr7OjfSOdDvHNZtf3T4TNGr2A64'
);

async function check() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  console.log('Test select:', { data, error });
}

check();
