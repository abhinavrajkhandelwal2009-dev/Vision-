import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection pool configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vision_intelligence';

let pool = null;
let usePg = true;

// In-memory / persistent JSON fallback state for dev environments without an active Postgres service
const fallbackStorageFile = path.resolve(__dirname, '../../.data-store.json');
let fallbackStore = {
  users: [],
  inspections: []
};

// Load existing fallback store if file exists
if (fs.existsSync(fallbackStorageFile)) {
  try {
    const raw = fs.readFileSync(fallbackStorageFile, 'utf8');
    fallbackStore = JSON.parse(raw);
  } catch (e) {
    console.warn('[DB] Failed to read fallback store, initializing clean in-memory store.');
  }
}

function saveFallbackStore() {
  try {
    fs.writeFileSync(fallbackStorageFile, JSON.stringify(fallbackStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Error saving fallback data:', err.message);
  }
}

try {
  const isSupabaseDb = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com');
  pool = new Pool({
    connectionString,
    ssl: (isSupabaseDb || (process.env.NODE_ENV === 'production' && !connectionString.includes('localhost'))) 
      ? { rejectUnauthorized: false } 
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.warn('[DB Pool Error]', err.message);
  });
} catch (err) {
  console.warn('[DB] PostgreSQL pool creation notice:', err.message);
  usePg = false;
}

/**
 * Initializes the database tables. If PostgreSQL is reachable, creates the tables.
 * Otherwise, activates fallback storage mode gracefully.
 */
export async function initializeDatabase() {
  if (usePg && pool) {
    try {
      const client = await pool.connect();
      console.log('✅ [Database] Successfully connected to PostgreSQL instance.');
      
      // Run table migrations
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('operator', 'inspector', 'admin');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inspection_status') THEN
                CREATE TYPE inspection_status AS ENUM ('pending', 'passed', 'failed', 'flagged_for_review');
            END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            role user_role DEFAULT 'operator',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS inspections (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            domain VARCHAR(100) NOT NULL,
            image_url TEXT NOT NULL,
            status inspection_status DEFAULT 'pending',
            confidence_score NUMERIC(5,2),
            raw_ai_output JSONB NOT NULL,
            operator_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON inspections(user_id);
        CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON inspections(created_at DESC);
      `);

      client.release();
      console.log('✅ [Database] PostgreSQL tables and indexes verified.');
      return;
    } catch (err) {
      console.warn(`⚠️ [Database] PostgreSQL not accessible (${err.message}).`);
      console.warn('ℹ️ [Database] Running in High-Fidelity Local Fallback Mode (full persistence active).');
      usePg = false;
    }
  }
}

/**
 * Universal query interface compatible with PostgreSQL pg.Pool syntax
 */
export async function query(text, params = []) {
  if (usePg && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      // If Postgres goes down during runtime, log and throw
      throw err;
    }
  }

  // Fallback memory/JSON emulation for zero-dependency execution
  return executeFallbackQuery(text, params);
}

function executeFallbackQuery(text, params = []) {
  const cleanSql = text.trim();

  // 1. SELECT user by email
  if (/SELECT.*FROM users WHERE email = \$1/i.test(cleanSql)) {
    const email = params[0]?.toLowerCase();
    const user = fallbackStore.users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT user by id
  if (/SELECT.*FROM users WHERE id = \$1/i.test(cleanSql)) {
    const id = params[0];
    const user = fallbackStore.users.find(u => u.id === id);
    if (!user) return { rows: [], rowCount: 0 };
    return { 
      rows: [{ id: user.id, email: user.email, full_name: user.full_name, role: user.role, created_at: user.created_at }], 
      rowCount: 1 
    };
  }

  // 3. INSERT INTO users
  if (/INSERT INTO users/i.test(cleanSql)) {
    const [email, password_hash, full_name, role = 'operator'] = params;
    const existing = fallbackStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }
    const newUser = {
      id: uuidv4(),
      email,
      password_hash,
      full_name,
      role: role || 'operator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    fallbackStore.users.push(newUser);
    saveFallbackStore();
    return { rows: [{ id: newUser.id, email: newUser.email, full_name: newUser.full_name, role: newUser.role }], rowCount: 1 };
  }

  // 4. INSERT INTO inspections
  if (/INSERT INTO inspections/i.test(cleanSql)) {
    const [user_id, domain, image_url, status, confidence_score, raw_ai_output, operator_notes] = params;
    const newInspection = {
      id: uuidv4(),
      user_id,
      domain,
      image_url,
      status: status || 'pending',
      confidence_score: Number(confidence_score) || 0,
      raw_ai_output: typeof raw_ai_output === 'string' ? JSON.parse(raw_ai_output) : raw_ai_output,
      operator_notes: operator_notes || '',
      created_at: new Date().toISOString()
    };
    fallbackStore.inspections.unshift(newInspection);
    saveFallbackStore();
    return { rows: [newInspection], rowCount: 1 };
  }

  // 5. SELECT single inspection by id
  if (/SELECT.*FROM inspections.*WHERE id = \$1/i.test(cleanSql)) {
    const id = params[0];
    const insp = fallbackStore.inspections.find(i => i.id === id);
    if (!insp) return { rows: [], rowCount: 0 };
    
    // Join user full_name and email
    const author = fallbackStore.users.find(u => u.id === insp.user_id);
    const enriched = {
      ...insp,
      operator_name: author ? author.full_name : 'Unknown Operator',
      operator_email: author ? author.email : 'unknown@domain.com'
    };
    return { rows: [enriched], rowCount: 1 };
  }

  // 6. UPDATE inspections (notes / status)
  if (/UPDATE inspections/i.test(cleanSql)) {
    const id = params[params.length - 1]; // id is usually last param
    const inspIndex = fallbackStore.inspections.findIndex(i => i.id === id);
    if (inspIndex === -1) return { rows: [], rowCount: 0 };

    if (params.length === 3) {
      // status, notes, id
      fallbackStore.inspections[inspIndex].status = params[0];
      fallbackStore.inspections[inspIndex].operator_notes = params[1];
    } else if (params.length === 2) {
      if (/SET status = \$1/i.test(cleanSql)) {
        fallbackStore.inspections[inspIndex].status = params[0];
      } else if (/SET operator_notes = \$1/i.test(cleanSql)) {
        fallbackStore.inspections[inspIndex].operator_notes = params[0];
      }
    }
    saveFallbackStore();
    return { rows: [fallbackStore.inspections[inspIndex]], rowCount: 1 };
  }

  // 7. Analytics queries
  if (/COUNT\(\*\).*FROM inspections/i.test(cleanSql)) {
    const all = fallbackStore.inspections;
    const passed = all.filter(i => (i.status || '').toLowerCase() === 'passed').length;
    const failed = all.filter(i => (i.status || '').toLowerCase() === 'failed').length;
    const flagged = all.filter(i => (i.status || '').toLowerCase() === 'flagged_for_review' || (i.status || '').toLowerCase() === 'flagged').length;
    const pending = all.filter(i => (i.status || '').toLowerCase() === 'pending').length;
    const avgScore = all.length ? (all.reduce((acc, curr) => acc + (Number(curr.confidence_score) || 0), 0) / all.length).toFixed(1) : 0;

    return {
      rows: [{
        total: all.length,
        passed,
        failed,
        flagged,
        pending,
        avg_confidence: avgScore
      }],
      rowCount: 1
    };
  }

  // 8. General SELECT inspections list (with pagination, filters)
  if (/FROM inspections/i.test(cleanSql)) {
    let list = [...fallbackStore.inspections];

    // Filter by user_id if present in params and query
    if (/user_id = \$/i.test(cleanSql)) {
      const userIdParam = params.find(p => typeof p === 'string' && /^[0-9a-f-]{36}$/i.test(p));
      if (userIdParam) {
        list = list.filter(i => i.user_id === userIdParam);
      }
    }

    // Sort descending by created_at
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Enrich with author name
    const enriched = list.map(insp => {
      const author = fallbackStore.users.find(u => u.id === insp.user_id);
      return {
        ...insp,
        operator_name: author ? author.full_name : 'Operator',
        operator_email: author ? author.email : 'operator@system.local'
      };
    });

    return { rows: enriched, rowCount: enriched.length };
  }

  return { rows: [], rowCount: 0 };
}

export default {
  query,
  initializeDatabase,
  pool
};
