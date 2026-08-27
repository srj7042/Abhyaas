const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const url = 'https://pfqbhrfykyhzrhdeeiff.supabase.co/rest/v1/';
  const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcWJocmZ5a3loenJoZGVlaWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUwMzE5OSwiZXhwIjoyMTAzMDc5MTk5fQ.rHh6lefyUdzF6IfEplyln9h6N7J4NSf1mgxoaVaqTvA'
  };
  try {
    const res = await fetch(url, { headers });
    const json = await res.json();
    console.log('Exposed paths:', Object.keys(json.paths || {}));
  } catch (err) {
    console.error(err);
  }
}

run();
