const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function setupDatabase() {
  const schemaPath = path.join(__dirname, '../../db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await pool.query(schema);
  console.log('Database setup completed.');
}

setupDatabase()
  .catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    pool.end();
  });
