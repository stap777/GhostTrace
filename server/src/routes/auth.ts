import { Router, Request, Response } from 'express';
import type { LoginRequest, LoginResponse, SessionValidateResponse } from '@ghost-trace/shared';
import { loginRateLimiter, recordFailedLogin, resetFailedLogin } from '../middleware/rateLimiter.js';
import { createSession, validateSession, destroySession } from '../services/sessionStore.js';

export const authRouter = Router();

function extractSessionId(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers['x-session-id'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  if (req.body && typeof req.body === 'object' && typeof req.body.sessionId === 'string') {
    return req.body.sessionId.trim();
  }
  return null;
}

authRouter.post('/login', loginRateLimiter, (req: Request, res: Response) => {
  const body = req.body as Partial<LoginRequest> | undefined;

  // Validate request structure
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const errorResponse: LoginResponse = {
      success: false,
      message: 'Invalid request format. JSON object required.'
    };
    res.status(400).json(errorResponse);
    return;
  }

  const { username, password } = body;

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.trim().length === 0 ||
    password.length === 0
  ) {
    const errorResponse: LoginResponse = {
      success: false,
      message: 'Username and password are required.'
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Sanity check length to prevent abuse payloads
  if (username.length > 100 || password.length > 200) {
    const errorResponse: LoginResponse = {
      success: false,
      message: 'Input exceeds maximum allowed length.'
    };
    res.status(400).json(errorResponse);
    return;
  }

  const expectedUsername = process.env.ORBIT_USERNAME;
  const expectedPassword = process.env.ORBIT_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    console.error('[GhostTrace Auth] ERROR: Server environment missing ORBIT_USERNAME or ORBIT_PASSWORD');
    const errorResponse: LoginResponse = {
      success: false,
      message: 'Authentication service configuration error.'
    };
    res.status(500).json(errorResponse);
    return;
  }

  // Exact comparison - strictly case sensitive, no partial matches
  const isUsernameMatch = username === expectedUsername;
  const isPasswordMatch = password === expectedPassword;

  if (!isUsernameMatch || !isPasswordMatch) {
    recordFailedLogin(req);
    // Generic failure message — never disclose which component was incorrect
    const failureResponse: LoginResponse = {
      success: false,
      message: 'Invalid username or password.'
    };
    res.status(401).json(failureResponse);
    return;
  }

  // Successful authentication -> create new temporary session attempt
  resetFailedLogin(req);
  const { sessionId, sessionRef } = createSession(expectedUsername);

  const successResponse: LoginResponse = {
    success: true,
    message: 'Authentication successful. Access granted.',
    authenticatedUser: expectedUsername,
    sessionId,
    sessionRef
  };
  res.status(200).json(successResponse);
});

authRouter.get('/session', (req: Request, res: Response) => {
  const sessionId = extractSessionId(req);
  if (!sessionId) {
    const unauthResponse: SessionValidateResponse = {
      valid: false,
      message: 'No active session token provided.'
    };
    res.status(401).json(unauthResponse);
    return;
  }

  const session = validateSession(sessionId);
  if (!session) {
    const expiredResponse: SessionValidateResponse = {
      valid: false,
      message: 'Session has expired or is invalid.'
    };
    res.status(401).json(expiredResponse);
    return;
  }

  const validResponse: SessionValidateResponse = {
    valid: true,
    authenticatedUser: session.username,
    sessionRef: session.sessionRef
  };
  res.status(200).json(validResponse);
});

authRouter.post('/logout', (req: Request, res: Response) => {
  const sessionId = extractSessionId(req);
  if (sessionId) {
    destroySession(sessionId);
  }

  res.status(200).json({
    success: true,
    message: 'Session successfully terminated.'
  });
});
