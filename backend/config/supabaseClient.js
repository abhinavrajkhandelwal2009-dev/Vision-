import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const isConfigured = 
  Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceKey)) &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your_supabase_anon_key');

/**
 * Public Anonymous Supabase Client (RLS enforced)
 */
export const supabaseAnon = isConfigured && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;

/**
 * Admin Service-Role Supabase Client (bypasses RLS, used for backend automated ingestion & storage provisioning)
 */
export const supabaseAdmin = isConfigured && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  : (isConfigured && supabaseAnonKey ? supabaseAnon : null);

/**
 * Checks connectivity to Supabase Cloud API
 */
export async function checkSupabaseHealth() {
  if (!isConfigured || !supabaseAdmin) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials not yet configured. Local database adapter active.'
    };
  }

  try {
    const { data, error } = await supabaseAdmin.from('inspections').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        configured: true,
        message: `Supabase reachable but query returned notice: ${error.message}`
      };
    }
    return {
      connected: true,
      configured: true,
      projectUrl: supabaseUrl,
      message: 'Supabase Cloud API & Database connected.'
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      message: `Supabase connection attempt failed: ${err.message}`
    };
  }
}

export default {
  supabaseAnon,
  supabaseAdmin,
  isConfigured,
  checkSupabaseHealth
};

