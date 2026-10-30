import { initializeDatabase } from '../config/db.js';

async function main() {
  console.log('🔄 Initializing VisionIntelligence database...');
  try {
    await initializeDatabase();
    console.log('✅ Database initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

main();

