import { spawn } from 'node:child_process';
import http from 'node:http';

const TEST_PORT = 3456;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${TEST_PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        timeout: options.timeout || 12000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data,
              json: () => JSON.parse(data),
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data,
              json: () => null,
            });
          }
        });
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error(`Request to ${path} timed out`));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log(`Starting production server test on port ${TEST_PORT}...`);
  const server = spawn('node', ['dist/server.cjs'], {
    env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (d) => process.stdout.write(`[Server] ${d}`));
  server.stderr.on('data', (d) => process.stderr.write(`[Server Err] ${d}`));

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await request('/api/health');
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!ready) {
    server.kill();
    throw new Error('Server failed to start within timeout');
  }

  console.log('Production server started successfully. Running test suite...\n');

  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`✅ [PASS] ${name}`);
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Health check
  await test('GET /api/health returns 200 and JSON status', async () => {
    const res = await request('/api/health');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const data = res.json();
    if (data.status !== 'ok') throw new Error(`Status not ok: ${JSON.stringify(data)}`);
  });

  // 2. Database Status
  await test('GET /api/db/status returns database connection info and entity counts', async () => {
    const res = await request('/api/db/status');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const data = res.json();
    if (typeof data.counts?.rooms !== 'number') throw new Error('Missing room counts');
  });

  // 3. Static frontend index.html served
  await test('GET / serves production index.html with PWA tags', async () => {
    const res = await request('/');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    if (!res.body.includes('Grand Horizon') && !res.body.includes('Hotel Management System')) {
      throw new Error('Index.html did not contain title');
    }
    if (!res.body.includes('apple-touch-icon') || !res.body.includes('manifest')) {
      throw new Error('PWA tags missing from index.html');
    }
  });

  // 4. Manifest served
  await test('GET /manifest.webmanifest serves valid PWA manifest', async () => {
    const res = await request('/manifest.webmanifest');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const manifest = res.json();
    if (!manifest.name || manifest.display !== 'standalone') {
      throw new Error(`Invalid manifest: ${res.body}`);
    }
  });

  // 5. Service Worker served
  await test('GET /sw.js serves service worker code', async () => {
    const res = await request('/sw.js');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    if (!res.body.includes('workbox') && !res.body.includes('self')) {
      throw new Error('sw.js content unexpected');
    }
  });

  // 6. Security Headers
  await test('Response contains production security headers', async () => {
    const res = await request('/api/health');
    if (res.headers['x-content-type-options'] !== 'nosniff') {
      throw new Error('Missing x-content-type-options');
    }
    if (res.headers['x-frame-options'] !== 'SAMEORIGIN') {
      throw new Error('Missing x-frame-options');
    }
  });

  // 7. Rooms CRUD API
  await test('GET /api/rooms returns room inventory', async () => {
    const res = await request('/api/rooms');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const rooms = res.json();
    if (!Array.isArray(rooms) || rooms.length === 0) throw new Error('No rooms returned');
  });

  // 8. Bookings CRUD API
  await test('GET /api/bookings returns booking records', async () => {
    const res = await request('/api/bookings');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const bookings = res.json();
    if (!Array.isArray(bookings)) throw new Error('No bookings array');
  });

  // 9. Guests CRM API
  await test('GET /api/guests returns guest directory', async () => {
    const res = await request('/api/guests');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const guests = res.json();
    if (!Array.isArray(guests)) throw new Error('No guests array');
  });

  // 10. Staff Tasks API
  await test('GET /api/tasks returns housekeeping and maintenance tasks', async () => {
    const res = await request('/api/tasks');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const tasks = res.json();
    if (!Array.isArray(tasks)) throw new Error('No tasks array');
  });

  // 11. Payments API
  await test('GET /api/payments returns financial transactions', async () => {
    const res = await request('/api/payments');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const payments = res.json();
    if (!Array.isArray(payments)) throw new Error('No payments array');
  });

  // 12. AI Briefing Endpoint (resilient under quota limit/offline)
  await test('POST /api/ai/briefing returns executive briefing', async () => {
    const res = await request('/api/ai/briefing', {
      method: 'POST',
      body: { hotelState: { occupancyRate: '85%', todayRevenue: 15400 } },
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const briefing = res.json();
    if (!briefing.summary || typeof briefing.summary !== 'string') {
      throw new Error('Briefing summary missing');
    }
  });

  // 13. AI Chat Endpoint (resilient under quota limit/offline)
  await test('POST /api/ai/chat returns helpful operational response', async () => {
    const res = await request('/api/ai/chat', {
      method: 'POST',
      body: { message: 'Give me a brief on current hotel occupancy' },
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const chat = res.json();
    if (!chat.reply || typeof chat.reply !== 'string') {
      throw new Error('Chat reply missing');
    }
  });

  // 14. AI Task Prioritization Endpoint
  await test('POST /api/ai/prioritize-tasks returns prioritized work orders', async () => {
    const res = await request('/api/ai/prioritize-tasks', {
      method: 'POST',
      body: {
        tasks: [
          { id: 't1', title: 'Clean room 304', priority: 'High', category: 'Housekeeping', roomNumber: '304' },
          { id: 't2', title: 'Inspect HVAC in 202', priority: 'Urgent', category: 'Maintenance' },
        ],
        rooms: [],
        checkInsToday: 4,
      },
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const parsed = res.json();
    if (!Array.isArray(parsed.tasks)) throw new Error('Tasks array missing');
  });

  // 15. AI Executive Report Generator
  await test('POST /api/ai/generate-report generates operational analytics report', async () => {
    const res = await request('/api/ai/generate-report', {
      method: 'POST',
      body: {
        reportType: 'executive-daily',
        timeframe: 'today',
        hotelContext: { occupancyRate: 88, todayRevenue: 18200 },
      },
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const report = res.json();
    if (!report.title || !report.summary) throw new Error('Report structure invalid');
  });

  console.log('\nShutting down test server...');
  server.kill();

  const failed = results.filter((r) => !r.passed);
  console.log(`\n========================================`);
  console.log(`Test Summary: ${results.length - failed.length}/${results.length} PASSED`);
  console.log(`========================================\n`);

  if (failed.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
