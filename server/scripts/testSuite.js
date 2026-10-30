import http from 'http';

const BASE_URL = 'http://127.0.0.1:5000';

// Simple synthetic 1x1 test image in base64 PNG
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function waitForServer() {
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return true;
    } catch (e) {
      // wait 400ms and retry
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return false;
}

async function runTests() {
  console.log('🧪 Starting VisionIntelligence AI End-to-End Test Suite...');
  
  const ready = await waitForServer();
  if (!ready) {
    throw new Error('Server did not respond to /api/health within timeout.');
  }

  let token = null;
  let testUserId = null;
  let inspectionId = null;

  // 1. Health check
  console.log('\n1. Testing GET /api/health...');
  const health = await request('/api/health');
  if (health.status === 200 && health.data.status === 'healthy') {
    console.log('   ✅ Health check passed:', health.data.service);
  } else {
    throw new Error('Health check failed: ' + JSON.stringify(health));
  }

  // 2. User Registration
  console.log('\n2. Testing POST /api/auth/register...');
  const email = `inspector_${Date.now()}@visionintelligence.ai`;
  const registerRes = await request('/api/auth/register', {
    method: 'POST',
    body: {
      email,
      password: 'SecurePassword123!',
      fullName: 'Chief Inspector Sarah',
      role: 'inspector'
    }
  });

  if (registerRes.status === 201 && registerRes.data.token) {
    token = registerRes.data.token;
    testUserId = registerRes.data.user.id;
    console.log('   ✅ Registration passed. User ID:', testUserId, 'Role:', registerRes.data.user.role);
  } else {
    throw new Error('Registration failed: ' + JSON.stringify(registerRes));
  }

  // 3. User Login
  console.log('\n3. Testing POST /api/auth/login...');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password: 'SecurePassword123!'
    }
  });

  if (loginRes.status === 200 && loginRes.data.token) {
    token = loginRes.data.token;
    console.log('   ✅ Login passed. Token successfully refreshed.');
  } else {
    throw new Error('Login failed: ' + JSON.stringify(loginRes));
  }

  // 4. Authenticated Profile GET /api/auth/me
  console.log('\n4. Testing GET /api/auth/me (Protected Route)...');
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (meRes.status === 200 && meRes.data.email === email) {
    console.log('   ✅ Profile verification passed:', meRes.data.fullName);
  } else {
    throw new Error('Profile verification failed: ' + JSON.stringify(meRes));
  }

  // 5. Visual Inspection Ingestion & Gemini Analysis
  console.log('\n5. Testing POST /api/inspect (Multi-Modal Vision Pipeline)...');
  const inspectRes = await request('/api/inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      domain: 'Industrial Manufacturing: Weld Cracks & Seam Flaws',
      imageBase64: TEST_IMAGE_BASE64,
      mimeType: 'image/png',
      threshold: 75,
      operatorNotes: 'Automated test batch specimen #4410'
    }
  });

  if (inspectRes.status === 201 && inspectRes.data.inspection?.id) {
    inspectionId = inspectRes.data.inspection.id;
    const aiOutput = inspectRes.data.inspection.aiOutput;
    console.log('   ✅ Visual inspection passed!');
    console.log('      - Job ID:', inspectionId);
    console.log('      - Status:', inspectRes.data.inspection.status);
    console.log('      - Confidence:', inspectRes.data.inspection.confidenceScore + '%');
    console.log('      - Anomalies Found:', aiOutput?.anomaliesDetected?.length || 0);
    console.log('      - Inference Latency:', inspectRes.data.latencyMs + 'ms');
  } else {
    throw new Error('Inspection failed: ' + JSON.stringify(inspectRes));
  }

  // 6. Query Inspection History
  console.log('\n6. Testing GET /api/inspections...');
  const historyRes = await request('/api/inspections?page=1&limit=10', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (historyRes.status === 200 && Array.isArray(historyRes.data.inspections)) {
    console.log('   ✅ History retrieval passed. Record count:', historyRes.data.inspections.length);
  } else {
    throw new Error('History retrieval failed: ' + JSON.stringify(historyRes));
  }

  // 7. Get Inspection By ID
  console.log('\n7. Testing GET /api/inspections/:id...');
  const singleRes = await request(`/api/inspections/${inspectionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (singleRes.status === 200 && singleRes.data.id === inspectionId) {
    console.log('   ✅ Single inspection lookup passed.');
  } else {
    throw new Error('Single inspection lookup failed: ' + JSON.stringify(singleRes));
  }

  // 8. Patch / Override Inspection
  console.log('\n8. Testing PATCH /api/inspections/:id (Inspector Sign-Off)...');
  const patchRes = await request(`/api/inspections/${inspectionId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      status: 'failed',
      operator_notes: 'Confirmed weld fatigue defect upon secondary ultrasonic probe.'
    }
  });

  if (patchRes.status === 200 && patchRes.data.inspection.status === 'failed') {
    console.log('   ✅ Inspector status override passed:', patchRes.data.inspection.status);
  } else {
    throw new Error('Inspector status override failed: ' + JSON.stringify(patchRes));
  }

  // 9. Analytics Summary Aggregation
  console.log('\n9. Testing GET /api/analytics/summary...');
  const analyticsRes = await request('/api/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (analyticsRes.status === 200 && analyticsRes.data.totalInspections >= 1) {
    console.log('   ✅ Analytics aggregation passed:');
    console.log('      - Total Inspections:', analyticsRes.data.totalInspections);
    console.log('      - Pass Rate:', analyticsRes.data.passRate + '%');
    console.log('      - Fail Rate:', analyticsRes.data.failRate + '%');
    console.log('      - Mean Confidence:', analyticsRes.data.avgConfidence + '%');
  } else {
    throw new Error('Analytics aggregation failed: ' + JSON.stringify(analyticsRes));
  }

  console.log('\n🎉 ALL 9 TEST SUITES COMPLETED WITH 100% SUCCESS!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Error:', err.message);
  process.exit(1);
});
