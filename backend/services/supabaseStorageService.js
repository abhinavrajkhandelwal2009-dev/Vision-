import { supabaseAdmin } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'inspection-assets';

let bucketVerified = false;

/**
 * Ensures the target Supabase Storage bucket exists and is set to public read
 */
async function ensureBucketExists() {
  if (bucketVerified || !supabaseAdmin) return;

  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      console.warn(`[Supabase Storage] List buckets note: ${error.message}`);
      return;
    }

    const exists = (buckets || []).some(b => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024, // 20MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (createError) {
        console.warn(`[Supabase Storage] Bucket creation notice: ${createError.message}`);
      } else {
        console.log(`✅ [Supabase Storage] Created public bucket '${BUCKET_NAME}'.`);
      }
    }
    bucketVerified = true;
  } catch (err) {
    console.warn(`[Supabase Storage] Notice: ${err.message}`);
  }
}

/**
 * Uploads a visual asset (base64 string) to Supabase Storage and returns its public URL.
 * Falls back to Data URL if Supabase is offline or unconfigured.
 */
export async function uploadVisualAsset(base64Image, mimeType = 'image/jpeg') {
  // If Supabase is not configured, preserve standard base64 data URL
  if (!supabaseAdmin) {
    return base64Image.startsWith('data:') 
      ? base64Image 
      : `data:${mimeType};base64,${base64Image}`;
  }

  try {
    await ensureBucketExists();

    // Strip prefix if present
    const rawData = base64Image.includes(';base64,')
      ? base64Image.split(';base64,')[1]
      : base64Image;

    const buffer = Buffer.from(rawData, 'base64');
    const ext = mimeType.split('/')[1] || 'jpg';
    const filePath = `inspections/${new Date().getFullYear()}/${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn(`[Supabase Storage Upload Notice] ${error.message}. Storing data URL.`);
      return base64Image.startsWith('data:') ? base64Image : `data:${mimeType};base64,${base64Image}`;
    }

    // Retrieve public CDN URL from Supabase
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn(`[Supabase Storage Error] ${err.message}. Using local payload.`);
    return base64Image.startsWith('data:') ? base64Image : `data:${mimeType};base64,${base64Image}`;
  }
}

export default {
  uploadVisualAsset
};

