import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard local connection credentials
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ims_db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('Database query error:', { text, error: err.message });
    throw err;
  }
};

export const initDB = async () => {
  const dbName = process.env.DB_NAME || 'ims_db';
  
  // 1. Connect to default 'postgres' database to check/create the target database
  try {
    console.log(`Checking if database "${dbName}" exists...`);
    const tempClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: 'postgres', // default database
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });

    await tempClient.connect();
    const checkRes = await tempClient.query(`SELECT 1 FROM pg_database WHERE datname = $1;`, [dbName]);
    
    if (checkRes.rows.length === 0) {
      console.log(`Database "${dbName}" not found. Creating database...`);
      // CREATE DATABASE cannot be executed in transaction block, so we run directly
      await tempClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
    
    await tempClient.end();
  } catch (err) {
    console.error('Error during database check/creation step:', err.message);
    // Continue anyway, as it might fail due to permissions but the database already exists
  }

  // 2. Connect to our target database and run schema/seeds
  try {
    console.log(`Connecting to database "${dbName}"...`);
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connection established successfully.');

    // Read the SQL init file
    const sqlPath = path.join(__dirname, '../db/init.sql');
    if (fs.existsSync(sqlPath)) {
      console.log('Running database schema and seeding script...');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sqlContent);
      console.log('Database tables verified and seeded successfully.');
    } else {
      console.warn('init.sql script not found. Skipping table generation.');
    }
  } catch (err) {
    console.error('Database connection / initialization failed!');
    console.error(err.message);
    console.error('Ensure that PostgreSQL is running and credentials are correct.');
    process.exit(1);
  }
};

export default pool;
