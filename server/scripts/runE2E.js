import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 Spawning VisionIntelligence Server for E2E validation...');
  const serverPath = path.resolve(__dirname, '../server.js');
  
  const server = fork(serverPath, [], {
    stdio: ['inherit', 'pipe', 'pipe', 'ipc']
  });

  server.stdout.on('data', (d) => {
    process.stdout.write(`[SERVER] ${d.toString()}`);
  });

  server.stderr.on('data', (d) => {
    process.stderr.write(`[SERVER ERR] ${d.toString()}`);
  });

  // Wait for server to become healthy
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/health');
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  if (!ready) {
    console.error('❌ Server failed to initialize within timeout.');
    server.kill();
    process.exit(1);
  }

  console.log('✅ Server verified online at http://127.0.0.1:5000.');
  console.log('🏃 Invoking test suite...\n');

  const testPath = path.resolve(__dirname, 'testSuite.js');
  const tester = fork(testPath, [], { stdio: 'inherit' });

  tester.on('exit', (code) => {
    console.log(`\n🧹 Cleaning up server process (exit code: ${code})...`);
    server.kill();
    process.exit(code);
  });
}

main().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});

