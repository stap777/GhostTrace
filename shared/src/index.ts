/**
 * Public DTOs and Shared Contracts for OPERATION: GHOST TRACE
 *
 * NOTE: Do NOT define secret flags, hashes, puzzle answers, or protected
 * evidence in this package. This package is exposed to both client and server.
 */

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
}
