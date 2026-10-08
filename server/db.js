import pkg from 'pg'
const { Pool } = pkg

import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// =====================================================
// INITIALIZE DATABASE
// =====================================================

export const initializeDatabase = async () => {
  let client

  try {
    client = await pool.connect()

    // =================================================
    // USERS
    // =================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add name to older databases that were created
    // before the name column existed.
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS name VARCHAR(100)
    `)

    // =================================================
    // MEMORIES
    // =================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS memories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,
        original_text TEXT NOT NULL,
        title VARCHAR(255),
        summary TEXT,
        category VARCHAR(50),
        tags JSON DEFAULT '[]',
        extracted_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // =================================================
    // REMINDERS
    // =================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,
        memory_id INTEGER
          REFERENCES memories(id)
          ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reminder_date TIMESTAMP NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Database initialized successfully')
  } catch (err) {
    console.error('Database initialization error:', err)
    throw err
  } finally {
    if (client) {
      client.release()
    }
  }
}

export default pool