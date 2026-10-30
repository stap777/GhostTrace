import crypto from 'node:crypto';

export interface ActiveSession {
  username: string;
  sessionRef: string;
  createdAt: number;
}

const sessions = new Map<string, ActiveSession>();

/**
 * Creates a new server-side authenticated challenge attempt.
 * No database required; stored in memory.
 */
export function createSession(username: string): { sessionId: string; sessionRef: string } {
  const sessionId = crypto.randomUUID();
  // Unique deterministic-format attempt reference shown in footer, e.g. ORBIT-SEC-8421
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const sessionRef = `ORBIT-SEC-${randCode}`;

  sessions.set(sessionId, {
    username,
    sessionRef,
    createdAt: Date.now()
  });

  return { sessionId, sessionRef };
}

/**
 * Validates whether a given session token is active and valid.
 */
export function validateSession(sessionId: string): ActiveSession | null {
  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }
  return sessions.get(sessionId) || null;
}

/**
 * Destroys/invalidates a session upon logout.
 */
export function destroySession(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  return sessions.delete(sessionId);
}

/**
 * Reset all sessions (used for test isolation).
 */
export function clearAllSessions(): void {
  sessions.clear();
}
