const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:pfqbhrfykyhzrhdeeiff@db.pfqbhrfykyhzrhdeeiff.supabase.co:5432/postgres' // Let's try replacing [YOUR-PASSWORD] with the project ref or guess if it is project ref or if we can use it.
});

async function run() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error connecting to postgres:', err);
  } finally {
    await client.end();
  }
}

run();
