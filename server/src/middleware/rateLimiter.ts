import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute window

const failedAttempts = new Map<string, AttemptRecord>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (record) {
    if (now > record.resetAt) {
      failedAttempts.delete(ip);
    } else if (record.count >= MAX_FAILED_ATTEMPTS) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Access temporarily restricted. Try again in ${waitSeconds}s.`
      });
      return;
    }
  }

  next();
}

export function recordFailedLogin(req: Request): void {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (!record || now > record.resetAt) {
    failedAttempts.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
  } else {
    record.count += 1;
  }
}

export function resetFailedLogin(req: Request): void {
  const ip = getClientIp(req);
  failedAttempts.delete(ip);
}

// Helper for testing
export function clearAllRateLimits(): void {
  failedAttempts.clear();
}
