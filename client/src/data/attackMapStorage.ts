import {
  type AttackMapState,
  INITIAL_ATTACK_MAP_STATE
} from '@ghost-trace/shared';

const STORAGE_KEY_PREFIX = 'orbit_attack_map_';
const FALLBACK_KEY = 'orbit_attack_map_data';

export function getStorageKey(sessionId?: string): string {
  if (sessionId && sessionId.trim()) {
    return `${STORAGE_KEY_PREFIX}${sessionId.trim()}`;
  }
  return FALLBACK_KEY;
}

export function loadAttackMapState(sessionId?: string): AttackMapState {
  try {
    const key = getStorageKey(sessionId);
    const raw = sessionStorage.getItem(key) || sessionStorage.getItem(FALLBACK_KEY);
    if (!raw) {
      return INITIAL_ATTACK_MAP_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<AttackMapState>;
    return {
      timeline: Array.isArray(parsed.timeline) && parsed.timeline.length === 6
        ? parsed.timeline
        : INITIAL_ATTACK_MAP_STATE.timeline,
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      notes: parsed.notes ? { ...INITIAL_ATTACK_MAP_STATE.notes, ...parsed.notes } : INITIAL_ATTACK_MAP_STATE.notes
    };
  } catch {
    return INITIAL_ATTACK_MAP_STATE;
  }
}

export function saveAttackMapState(state: AttackMapState, sessionId?: string): void {
  try {
    const key = getStorageKey(sessionId);
    const serialized = JSON.stringify(state);
    sessionStorage.setItem(key, serialized);
    // Also update fallback key to support tab switches
    sessionStorage.setItem(FALLBACK_KEY, serialized);
  } catch {
    // Storage quota or disabled storage handled silently
  }
}

export function clearAttackMapState(sessionId?: string): void {
  try {
    const key = getStorageKey(sessionId);
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(FALLBACK_KEY);
  } catch {
    // Ignore storage deletion errors
  }
}
