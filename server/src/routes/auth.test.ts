import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../app.js';
import { clearAllRateLimits } from '../middleware/rateLimiter.js';
import { clearAllSessions } from '../services/sessionStore.js';

describe('Authentication & Session API', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    // Ensure test environment credentials
    process.env.ORBIT_USERNAME = 'ghost';
    process.env.ORBIT_PASSWORD = 'Orbit@914!';

    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  beforeEach(() => {
    clearAllRateLimits();
    clearAllSessions();
  });

  test('1. Valid credentials (ghost / Orbit@914!) succeed with 200 and issue session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ghost',
        password: 'Orbit@914!'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.authenticatedUser, 'ghost');
    assert.ok(data.sessionId, 'Should return a sessionId');
    assert.match(data.sessionRef, /^ORBIT-SEC-\d{4}$/, 'Should return an ORBIT-SEC-XXXX reference');
    assert.match(data.message, /access granted/i);
  });

  test('2. Incorrect password fails with 401 and generic message', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ghost',
        password: 'WrongPassword123'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.message, 'Invalid username or password.');
    assert.equal(data.sessionId, undefined);
  });

  test('3. Incorrect username fails with 401 and generic message', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Orbit@914!'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.message, 'Invalid username or password.');
  });

  test('4. Case variation in username fails with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Ghost',
        password: 'Orbit@914!'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('5. Case variation in password fails with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ghost',
        password: 'orbit@914!'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('6. Empty username fails safely with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: '',
        password: 'Orbit@914!'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('7. Empty password fails safely with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ghost',
        password: ''
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('8. Malformed body (missing fields) fails safely with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('9. Malformed types (numbers instead of strings) fail safely with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 12345, password: true })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('10. Repeated failures trigger rate limiter with 429', async () => {
    // Attempt 5 incorrect logins to trip the rate limit threshold
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ghost', password: 'wrong' })
      });
      assert.equal(res.status, 401);
    }

    // 6th attempt should be blocked with 429
    const blockedRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ghost', password: 'Orbit@914!' })
    });

    assert.equal(blockedRes.status, 429);
    const blockedData = await blockedRes.json();
    assert.equal(blockedData.success, false);
    assert.match(blockedData.message, /too many failed login attempts/i);
  });

  test('11. Session validation (GET /api/auth/session) succeeds with valid token', async () => {
    // Login to get a session
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ghost', password: 'Orbit@914!' })
    });
    const loginData = await loginRes.json();

    // Validate with Bearer header
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${loginData.sessionId}` }
    });
    assert.equal(sessionRes.status, 200);
    const sessionData = await sessionRes.json();
    assert.equal(sessionData.valid, true);
    assert.equal(sessionData.authenticatedUser, 'ghost');
    assert.equal(sessionData.sessionRef, loginData.sessionRef);

    // Also validate with x-session-id header
    const customHeaderRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'x-session-id': loginData.sessionId }
    });
    assert.equal(customHeaderRes.status, 200);
    const customHeaderData = await customHeaderRes.json();
    assert.equal(customHeaderData.valid, true);
  });

  test('12. Session validation fails with 401 when token is missing or invalid', async () => {
    const noTokenRes = await fetch(`${baseUrl}/api/auth/session`);
    assert.equal(noTokenRes.status, 401);

    const badTokenRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Authorization': 'Bearer non-existent-token' }
    });
    assert.equal(badTokenRes.status, 401);
    const badData = await badTokenRes.json();
    assert.equal(badData.valid, false);
  });

  test('13. Logout (POST /api/auth/logout) terminates active session', async () => {
    // Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ghost', password: 'Orbit@914!' })
    });
    const loginData = await loginRes.json();

    // Verify session works
    const check1 = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${loginData.sessionId}` }
    });
    assert.equal(check1.status, 200);

    // Call logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${loginData.sessionId}` }
    });
    assert.equal(logoutRes.status, 200);

    // Verify session is now invalidated
    const check2 = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${loginData.sessionId}` }
    });
    assert.equal(check2.status, 401);
  });

  test('14. New login after logout creates fresh session reference', async () => {
    const login1 = await (await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ghost', password: 'Orbit@914!' })
    })).json();

    await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${login1.sessionId}` }
    });

    const login2 = await (await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ghost', password: 'Orbit@914!' })
    })).json();

    assert.notEqual(login1.sessionId, login2.sessionId, 'Session IDs must be distinct across logins');
  });
});
