import { checkSupabaseHealth, supabaseAdmin } from './config/supabaseClient.js';
import { uploadVisualAsset } from './services/supabaseStorageService.js';

async function main() {
  console.log('🔍 Testing Supabase Connection & Services...\n');

  const health = await checkSupabaseHealth();
  console.log('1. Health Check:');
  console.log('   - Configured:', health.configured);
  console.log('   - Connected:', health.connected);
  console.log('   - Status Message:', health.message);

  if (health.configured && health.connected) {
    console.log('\n2. Testing Supabase Storage Asset Upload...');
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const assetUrl = await uploadVisualAsset(testBase64, 'image/png');
    console.log('   - Upload Result URL:', assetUrl);
  } else {
    console.log('\nℹ️  To connect your live Supabase project:');
    console.log('   1. Open backend/.env');
    console.log('   2. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY');
    console.log('   3. Run: node backend/testSupabase.js');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

