import { supabaseAdmin, supabaseAnon } from '../config/supabaseClient.js';

/**
 * Supabase SDK Database Layer
 * Used alongside PostgreSQL pool for flexible cloud queries and RLS enforcement.
 */

export async function insertSupabaseInspection(inspectionData) {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('inspections')
      .insert([
        {
          user_id: inspectionData.userId,
          domain: inspectionData.domain,
          image_url: inspectionData.imageUrl,
          status: inspectionData.status,
          confidence_score: inspectionData.confidenceScore,
          raw_ai_output: inspectionData.rawAiOutput,
          operator_notes: inspectionData.operatorNotes
        }
      ])
      .select()
      .single();

    if (error) {
      console.warn(`[Supabase DB Insert Notice] ${error.message}`);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[Supabase DB Exception] ${err.message}`);
    return null;
  }
}

export async function getSupabaseInspections({ userId, role, domain, status, limit = 20 }) {
  if (!supabaseAdmin) return null;

  try {
    let query = supabaseAdmin
      .from('inspections')
      .select(`
        id,
        user_id,
        domain,
        image_url,
        status,
        confidence_score,
        raw_ai_output,
        operator_notes,
        created_at,
        users:user_id ( full_name, email )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Operator Row-Level Isolation
    if (role === 'operator' && userId) {
      query = query.eq('user_id', userId);
    }
    if (domain) {
      query = query.eq('domain', domain);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.warn(`[Supabase DB Select Notice] ${error.message}`);
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export default {
  insertSupabaseInspection,
  getSupabaseInspections
};

