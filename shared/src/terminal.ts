/**
 * ORBIT Campus Simulated Terminal & Virtual Filesystem Engine
 *
 * CRITICAL SAFETY NOTICE:
 * This module operates strictly on predefined, in-memory virtual data structures.
 * It NEVER executes real shell commands, NEVER spawns child processes, and NEVER
 * touches the host operating system or host filesystem.
 */

export type FileIntegrityState = 'healthy' | 'corrupted' | 'missing' | 'inaccessible';

export interface VirtualFileRecord {
  path: string;
  name: string;
  isDirectory: boolean;
  sizeBytes: number;
  owner: string;
  permissions: string;
  createdAt: string;
  modifiedAt: string;
  integrity: FileIntegrityState;
  changeDescription?: string;
  diagnosticNote?: string;
  content?: string;
  isReadable: boolean;
}

export interface TerminalOutputLine {
  id: string;
  type: 'command' | 'output' | 'warning' | 'error' | 'system' | 'table';
  text: string;
}

/**
 * Predefined Virtual Filesystem Dataset.
 * Fictional campus IT infrastructure artifacts reflecting the incident narrative.
 */
export const VIRTUAL_FILES: VirtualFileRecord[] = [
  // Root directories
  {
    path: '/',
    name: '/',
    isDirectory: true,
    sizeBytes: 4096,
    owner: 'root',
    permissions: 'drwxr-xr-x',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 21:14:08',
    integrity: 'healthy',
    isReadable: false
  },
  {
    path: '/logs',
    name: 'logs',
    isDirectory: true,
    sizeBytes: 4096,
    owner: 'root',
    permissions: 'drwxr-xr-x',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 21:14:08',
    integrity: 'healthy',
    isReadable: false
  },
  {
    path: '/records',
    name: 'records',
    isDirectory: true,
    sizeBytes: 4096,
    owner: 'db-admin',
    permissions: 'drwxr-x---',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 20:58:33',
    integrity: 'healthy',
    isReadable: false
  },
  {
    path: '/services',
    name: 'services',
    isDirectory: true,
    sizeBytes: 4096,
    owner: 'www-data',
    permissions: 'drwxr-xr-x',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 21:04:12',
    integrity: 'healthy',
    isReadable: false
  },
  {
    path: '/backups',
    name: 'backups',
    isDirectory: true,
    sizeBytes: 4096,
    owner: 'sec-admin',
    permissions: 'drwx------',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 20:45:00',
    integrity: 'healthy',
    isReadable: false
  },
  {
    path: '/etc',
    name: 'etc',
    isDirectory: true,
    sizeBytes: 4096,
    owner: 'root',
    permissions: 'drwxr-xr-x',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 21:02:40',
    integrity: 'healthy',
    isReadable: false
  },

  // Files in /logs
  {
    path: '/logs/auth.log',
    name: 'auth.log',
    isDirectory: false,
    sizeBytes: 3420,
    owner: 'root',
    permissions: '-rw-r--r--',
    createdAt: '2026-10-29 00:00:01',
    modifiedAt: '2026-10-29 21:14:08',
    integrity: 'healthy',
    changeDescription: 'GHOST transmission recorded; session terminated.',
    isReadable: true,
    content: `# Log: /logs/auth.log
# Description: Authentication events, PAM session states, and SSH/gateway login audits.
# System: ORBIT Campus Identity & Access Controller (id-gw-01)

2026-10-29 20:12:05 id-gw-01 auth-daemon[102]: Listener active on port 22/tcp and 443/tcp
2026-10-29 20:14:22 id-gw-01 pam_unix(cron:session): session opened for user root by (uid=0)
2026-10-29 20:14:23 id-gw-01 pam_unix(cron:session): session closed for user root
2026-10-29 20:18:40 id-gw-01 sshd[2891]: Connection from 198.51.100.44 port 51240 on 10.0.0.5 port 2222
2026-10-29 20:19:12 id-gw-01 sshd[2891]: Failed password for invalid user admin from 198.51.100.44 port 51240 ssh2
2026-10-29 20:19:35 id-gw-01 sshd[2894]: Failed password for invalid user root from 198.51.100.44 port 51241 ssh2
2026-10-29 20:21:04 id-gw-01 sshd[2902]: Accepted password for m.turner from 198.51.100.44 port 51242 ssh2 [SESS-AUTH-9104]
2026-10-29 20:22:15 id-gw-01 pam_unix(sshd:session): session opened for user m.turner by (uid=1004) [SESS-AUTH-9104]
2026-10-29 20:24:50 id-gw-01 sudo[2950]: m.turner : 1 incorrect password attempt for privilege escalation ; TTY=pts/2 ; PWD=/home/m.turner
2026-10-29 20:30:11 id-gw-01 auth-daemon[102]: Keep-alive verified for session SESS-AUTH-9104 (m.turner)
2026-10-29 20:38:22 id-gw-01 su[3105]: Successful su for orbit-svc by m.turner [token cached in /var/tmp/.orbit-token]
2026-10-29 20:44:52 id-gw-01 pam_unix(sshd:session): session opened for user sec-admin by (uid=0) on tty1
2026-10-29 20:45:00 id-gw-01 sec-admin: Executing emergency quarantine: lock --target /backups
2026-10-29 21:14:08 id-gw-01 dispatch-agent[501]: Internal transmission dispatched to Admin Group from alias: GHOST [signature verified]
2026-10-29 21:14:09 id-gw-01 pam_unix(sshd:session): session closed for user m.turner [SESS-AUTH-9104]`
  },
  {
    path: '/logs/firewall.log',
    name: 'firewall.log',
    isDirectory: false,
    sizeBytes: 2450,
    owner: 'net-daemon',
    permissions: '-rw-r--r--',
    createdAt: '2026-10-29 08:00:00',
    modifiedAt: '2026-10-29 21:08:19',
    integrity: 'healthy',
    changeDescription: 'VLAN 40 packet degradation and perimeter interface latency logged.',
    isReadable: true,
    content: `# Log: /logs/firewall.log
# Description: Perimeter packet filtering, boundary gateway ingress/egress, and VLAN state changes.
# System: ORBIT Core Firewall Controller (fw-edge-01)

2026-10-29 20:10:00 fw-edge-01 kernel: [3120.10] Periodic rule synchronization with secondary node fw-edge-02: OK
2026-10-29 20:15:30 fw-edge-01 net-filter[402]: PERMIT INGRESS TCP 10.0.10.45:49152 -> 10.0.0.5:443 (staff webmail SSO)
2026-10-29 20:18:30 fw-edge-01 net-filter[410]: PERMIT INGRESS TCP 198.51.100.44:51240 -> 10.0.0.5:2222 [RULE-EXT-SSH]
2026-10-29 20:25:14 fw-edge-01 net-filter[415]: Port scan detected from pivot host 10.0.40.15 scanning 10.0.30.0/24 (ports 80, 443, 3306, 5432)
2026-10-29 20:32:01 fw-edge-01 net-filter[420]: Ingress packet burst on VLAN 40: 10.0.40.15 -> 10.0.30.50:5432 (PostgreSQL port)
2026-10-29 20:42:10 fw-edge-01 sec-admin: Policy update applied: isolation rule ISOL-BACKUP-99 enforced for 10.0.99.0/24
2026-10-29 20:55:10 fw-edge-01 net-filter[489]: Connection flood threshold approached on SQL listener 10.0.30.50:5432 from 10.0.40.15
2026-10-29 21:02:40 fw-edge-01 boundary-ctrl[512]: Warning: Configuration update rejected: invalid checksum on /etc/vlan_config.json
2026-10-29 21:08:19 fw-edge-01 net-filter[899]: Dropping anomalous ingress on VLAN 40 (gateway router 04) - 22% packet loss threshold reached
2026-10-29 21:12:00 fw-edge-01 net-filter[910]: Outbound rate limit triggered on SMTP egress port 25 -> external MX relays`
  },
  {
    path: '/logs/audit.log',
    name: 'audit.log',
    isDirectory: false,
    sizeBytes: 3100,
    owner: 'root',
    permissions: '-rw-r--r--',
    createdAt: '2026-10-29 00:00:01',
    modifiedAt: '2026-10-29 21:04:10',
    integrity: 'healthy',
    changeDescription: 'SIGKILL termination of portal gateway recorded by audit daemon.',
    isReadable: true,
    content: `# Log: /logs/audit.log
# Description: Filesystem integrity monitor, database audit trails, and sensitive record access events.
# System: ORBIT Institutional Audit Subsystem (auditd / db-audit)

2026-10-29 20:15:22 auditd[190]: Integrity check verified for /etc/passwd and /etc/shadow: HASH_OK
2026-10-29 20:26:05 auditd[205]: Directory traversal on /records initiated by UID 1004 (m.turner) [SESS-AUTH-9104]
2026-10-29 20:28:44 auditd[212]: Read access granted: /records/schema_definition.sql by UID 1004 (m.turner)
2026-10-29 20:39:10 auditd[240]: Process spawn: /bin/psql executed by orbit-svc (parent pid 3105)
2026-10-29 20:41:18 db-audit[302]: Elevated database session SESS-DB-4011 established using credentials orbit-svc from 10.0.40.15
2026-10-29 20:52:00 db-audit[315]: Query executed on student_directory: SELECT * FROM student_directory WHERE enrollment_status='ACTIVE'
2026-10-29 20:57:45 auditd[338]: Unauthorized write attempt on /records/students.db table headers by SESS-DB-4011
2026-10-29 20:58:33 db-audit[341]: CRITICAL: Cryptographic SHA256 checksum mismatch on block 0x48F2 in /records/students.db
2026-10-29 21:00:15 auditd[350]: Read access: /services/manifest.txt accessed by orbit-svc
2026-10-29 21:02:40 auditd[365]: File permission alteration: /etc/vlan_config.json changed to 0600 by root
2026-10-29 21:04:10 auditd[370]: Process signal SIGKILL (9) issued to target PID in /services/portal-gateway.pid by orbit-svc`
  },
  {
    path: '/logs/service.log',
    name: 'service.log',
    isDirectory: false,
    sizeBytes: 2890,
    owner: 'root',
    permissions: '-rw-r--r--',
    createdAt: '2026-10-29 00:00:01',
    modifiedAt: '2026-10-29 21:14:08',
    integrity: 'healthy',
    changeDescription: 'Broadcast message injection logged; admin alert dispatched.',
    isReadable: true,
    content: `# Log: /logs/service.log
# Description: Daemon runtime lifecycle, systemd unit status, health checks, and process supervisors.
# System: ORBIT Campus Service Manager (systemd / supervisor)

2026-10-29 20:00:01 systemd[1]: Starting Daily log rotation timer logrotate.timer - SUCCESS
2026-10-29 20:20:00 portal-gateway[401]: Inbound healthcheck HTTP/1.1 200 OK - roundtrip latency 12ms
2026-10-29 20:35:12 academic-db[510]: Connection pool capacity warning: 85% allocated (inbound clients from 10.0.40.15)
2026-10-29 20:45:00 backup-agent[602]: Administrative lock acknowledged: snapshot replication suspended. Status: RESTRICTED
2026-10-29 20:58:33 academic-db[510]: Database worker thread 0x04 crashed: invalid page checksum. Status: COMPROMISED
2026-10-29 21:03:50 portal-gateway[401]: Upstream connection to academic-db timed out; HTTP 503 returned to clients
2026-10-29 21:04:12 systemd[1]: portal-gateway.service: Main process 401 terminated by signal SIGKILL
2026-10-29 21:04:12 systemd[1]: portal-gateway.service: Unit entered failed state. Process tracking PID file unlinked. Status: OFFLINE
2026-10-29 21:08:19 net-switch[812]: Routing table oscillation on VLAN 40; packet loss threshold exceeded. Status: UNSTABLE
2026-10-29 21:11:45 postfix/smtpd[4410]: Outbound mail queue threshold exceeded (890 msgs); throttling engaged. Status: DEGRADED
2026-10-29 21:14:08 broadcast-srv[990]: Unauthenticated message injected into distribution list: msg-ghost-01 (GHOST)`
  },
  {
    path: '/logs/mail_queue.log',
    name: 'mail_queue.log',
    isDirectory: false,
    sizeBytes: 1850,
    owner: 'postfix',
    permissions: '-rw-r--r--',
    createdAt: '2026-10-29 18:00:00',
    modifiedAt: '2026-10-29 21:11:45',
    integrity: 'healthy',
    changeDescription: 'Postfix message queue threshold logged; outbound relay throttling.',
    isReadable: true,
    content: `# Log: /logs/mail_queue.log
# Description: SMTP mail transfer agent relay queue, queue volume monitoring, and delivery throttling.
# System: ORBIT Campus Mail Transfer Agent (postfix / smtp-relay)

2026-10-29 20:30:00 smtp-relay: Queue status clean: 0 queued, 14 messages delivered in last 10m
2026-10-29 20:50:15 smtp-relay: Outbound notification to faculty mailing list processed (48 recipients) - STATUS OK
2026-10-29 21:09:00 smtp-relay: Normal delivery rate: 42 msgs/min
2026-10-29 21:10:30 smtp-relay: Outbound queue spike: 890 messages pending delivery from sender alias ghost@orbit.local
2026-10-29 21:11:15 smtp-relay: Remote SMTP host rejected connections: 421 Rate limit exceeded
2026-10-29 21:11:45 smtp-relay: Outbound relay queue backing up; external sender throttling actively engaged - STATUS DEGRADED
2026-10-29 21:14:08 smtp-relay: Internal priority transmission msg-ghost-01 delivered to destination Admin Group
2026-10-29 21:14:08 smtp-relay: Subject: "Well, look who's here." - Origin: GHOST [token verified]`
  },

  // Files in /records
  {
    path: '/records/students.db',
    name: 'students.db',
    isDirectory: false,
    sizeBytes: 41943040,
    owner: 'db-admin',
    permissions: '-rw-rw----',
    createdAt: '2026-08-15 10:00:00',
    modifiedAt: '2026-10-29 20:58:33',
    integrity: 'corrupted',
    diagnosticNote: 'Cryptographic SHA256 checksum mismatch on block 0x48F2; table headers damaged.',
    changeDescription: 'Unauthorized table schema rebuild initiated by unauthenticated session.',
    isReadable: false
  },
  {
    path: '/records/schema_definition.sql',
    name: 'schema_definition.sql',
    isDirectory: false,
    sizeBytes: 8192,
    owner: 'db-admin',
    permissions: '-rw-r--r--',
    createdAt: '2026-08-15 10:00:00',
    modifiedAt: '2026-10-15 14:20:00',
    integrity: 'healthy',
    isReadable: true,
    content: `-- ORBIT CAMPUS ACADEMIC RECORDS SCHEMA DUMP
CREATE TABLE student_directory (
    student_id VARCHAR(16) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    enrollment_status VARCHAR(32) DEFAULT 'ACTIVE',
    checksum_digest BYTEA
);
-- End of public schema declaration`
  },

  // Files in /services
  {
    path: '/services/portal-gateway.pid',
    name: 'portal-gateway.pid',
    isDirectory: false,
    sizeBytes: 0,
    owner: 'www-data',
    permissions: '-rw-r--r--',
    createdAt: '2026-10-29 06:00:00',
    modifiedAt: '2026-10-29 21:04:12',
    integrity: 'missing',
    diagnosticNote: 'Process ID tracking file absent; gateway service terminated without clean shutdown.',
    changeDescription: 'Daemon process terminated; PID lock file unlinked.',
    isReadable: false
  },
  {
    path: '/services/manifest.txt',
    name: 'manifest.txt',
    isDirectory: false,
    sizeBytes: 512,
    owner: 'sysadmin',
    permissions: '-rw-r--r--',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 21:00:00',
    integrity: 'healthy',
    isReadable: true,
    content: `ORBIT CAMPUS CORE SERVICES MANIFEST
- Student Portal (Web/SSO Gateway)
- Academic Records (PostgreSQL Cluster)
- Campus Mail (Postfix / Microsoft Exchange Relay)
- Campus Network (Core VLAN & Firewall Controllers)
- Backup & Recovery (Offsite Immutable Storage)`
  },

  // Files in /backups
  {
    path: '/backups/snapshot_daily.tar.enc',
    name: 'snapshot_daily.tar.enc',
    isDirectory: false,
    sizeBytes: 5368709120,
    owner: 'sec-admin',
    permissions: '-r--------',
    createdAt: '2026-10-29 04:00:00',
    modifiedAt: '2026-10-29 20:45:00',
    integrity: 'inaccessible',
    diagnosticNote: 'Filesystem permissions restricted; immutable administrative lock applied.',
    changeDescription: 'Offsite replication daemon locked into read-only quarantine state.',
    isReadable: false
  },

  // Files in /etc
  {
    path: '/etc/vlan_config.json',
    name: 'vlan_config.json',
    isDirectory: false,
    sizeBytes: 2048,
    owner: 'root',
    permissions: '-rw-------',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 21:02:40',
    integrity: 'inaccessible',
    diagnosticNote: 'Permission denied; boundary firewall controller credentials revoked.',
    changeDescription: 'Switch routing tables altered; management socket locked.',
    isReadable: false
  },
  {
    path: '/etc/motd',
    name: 'motd',
    isDirectory: false,
    sizeBytes: 240,
    owner: 'root',
    permissions: '-rw-r--r--',
    createdAt: '2026-09-01 00:00:00',
    modifiedAt: '2026-10-29 18:00:00',
    integrity: 'healthy',
    isReadable: true,
    content: `====================================================================
ORBIT CAMPUS ADMINISTRATIVE SUBSYSTEM · SECURE DIAGNOSTIC CONSOLE
Authorized IT Administration Personnel Only. All activities recorded.
====================================================================`
  }
];

/**
 * Normalizes a virtual path safely and rejects path traversal.
 */
export function normalizeVirtualPath(inputPath?: string): string | null {
  if (!inputPath || typeof inputPath !== 'string') {
    return '/';
  }

  const trimmed = inputPath.trim().replace(/\\/g, '/');
  if (trimmed === '' || trimmed === '/') {
    return '/';
  }

  // Reject Windows drive letters
  if (/^[a-zA-Z]:/.test(trimmed)) {
    return null;
  }

  // Resolve dot segments safely without escaping virtual root
  const segments = trimmed.split('/').filter(Boolean);
  const stack: string[] = [];

  for (const seg of segments) {
    if (seg === '.') {
      continue;
    }
    if (seg === '..') {
      if (stack.length === 0) {
        // Traversal above virtual root forbidden
        return null;
      }
      stack.pop();
    } else {
      stack.push(seg);
    }
  }

  return '/' + stack.join('/');
}

/**
 * Resolve a record from the virtual filesystem.
 */
export function getVirtualFile(path: string): VirtualFileRecord | null {
  const normalized = normalizeVirtualPath(path);
  if (!normalized) return null;
  return VIRTUAL_FILES.find((f) => f.path === normalized) || null;
}

/**
 * List entries inside a virtual directory.
 * Note: Missing files are excluded from active directory listing.
 */
export function getVirtualDirectoryEntries(dirPath: string): { success: boolean; entries?: VirtualFileRecord[]; error?: string } {
  const normalized = normalizeVirtualPath(dirPath);
  if (!normalized) {
    return { success: false, error: `Invalid virtual path specification: ${dirPath}` };
  }

  const dirRecord = VIRTUAL_FILES.find((f) => f.path === normalized);
  if (!dirRecord) {
    return { success: false, error: `Directory not found in virtual filesystem: ${dirPath}` };
  }

  if (!dirRecord.isDirectory) {
    return { success: false, error: `Path is not a directory: ${dirPath}` };
  }

  const prefix = normalized === '/' ? '/' : normalized + '/';
  const entries = VIRTUAL_FILES.filter((f) => {
    if (f.path === normalized) return false;
    if (!f.path.startsWith(prefix)) return false;

    // Filter to immediate children only
    const relative = f.path.substring(prefix.length);
    if (relative.includes('/')) return false;

    // Do not show missing files in standard directory listing
    if (f.integrity === 'missing') return false;

    return true;
  });

  return { success: true, entries };
}

/**
 * Query damaged virtual files grouped into CORRUPTED, MISSING, INACCESSIBLE.
 */
export function getBrokenFiles(): {
  corrupted: VirtualFileRecord[];
  missing: VirtualFileRecord[];
  inaccessible: VirtualFileRecord[];
} {
  return {
    corrupted: VIRTUAL_FILES.filter((f) => f.integrity === 'corrupted'),
    missing: VIRTUAL_FILES.filter((f) => f.integrity === 'missing'),
    inaccessible: VIRTUAL_FILES.filter((f) => f.integrity === 'inaccessible')
  };
}

/**
 * Query virtual files sorted newest-first by modification timestamp.
 */
export function getModifiedFiles(): VirtualFileRecord[] {
  return VIRTUAL_FILES.filter((f) => !f.isDirectory && f.changeDescription).sort((a, b) =>
    b.modifiedAt.localeCompare(a.modifiedAt)
  );
}

/**
 * Uptime values for the 5 services (deterministic and consistent with existing dashboard).
 */
export interface ServiceUptimeRecord {
  name: string;
  status: string;
  uptime: string;
  lastActive: string;
}

export const ORBIT_SERVICES_TELEMETRY: ServiceUptimeRecord[] = [
  {
    name: 'Student Portal',
    status: 'OFFLINE',
    uptime: '0d 00h 00m',
    lastActive: '21:04:12 (Halted)'
  },
  {
    name: 'Academic Records',
    status: 'COMPROMISED',
    uptime: '14d 06h 22m',
    lastActive: '20:58:33 (Audit Alert)'
  },
  {
    name: 'Campus Mail',
    status: 'DEGRADED',
    uptime: '4d 18h 11m',
    lastActive: '21:11:45 (Throttling)'
  },
  {
    name: 'Campus Network',
    status: 'UNSTABLE',
    uptime: '92d 11h 04m',
    lastActive: '21:08:19 (Packet Drops)'
  },
  {
    name: 'Backup & Recovery',
    status: 'RESTRICTED',
    uptime: '180d 02h 50m',
    lastActive: '20:45:00 (Quarantine)'
  }
];

export interface CommandExecutionResult {
  lines: string[];
  clear?: boolean;
}

export const SUPPORTED_COMMANDS = [
  'orbit help',
  'orbit services',
  'orbit logs',
  'orbit broken',
  'orbit modified',
  'orbit files',
  'orbit inspect',
  'orbit read',
  'clear'
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }
  return dp[m][n];
}

/**
 * String distance helper to suggest close matches on typos.
 */
export function findClosestCommand(input: string): string | null {
  const lower = input.toLowerCase().trim();
  let bestCmd: string | null = null;
  let minDistance = Infinity;

  for (const cmd of SUPPORTED_COMMANDS) {
    if (cmd === lower) return null;
    const dist = levenshtein(lower, cmd);
    if (dist < minDistance && dist <= 4) {
      minDistance = dist;
      bestCmd = cmd;
    }
  }

  // Check if subcommand matches (e.g. 'orbit servicess' -> 'orbit services')
  if (lower.startsWith('orbit ')) {
    const sub = lower.slice(6).trim();
    for (const cmd of SUPPORTED_COMMANDS) {
      if (cmd.startsWith('orbit ')) {
        const cmdSub = cmd.slice(6);
        const subDist = levenshtein(sub, cmdSub);
        if (subDist < minDistance && subDist <= 3) {
          minDistance = subDist;
          bestCmd = cmd;
        }
      }
    }
  }

  return bestCmd;
}

/**
 * Pure dispatcher executing simulated terminal commands.
 * Zero OS execution, zero child processes.
 */
export function executeOrbitCommand(rawInput: string): CommandExecutionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { lines: [] };
  }

  // Handle 'clear' command
  if (trimmed.toLowerCase() === 'clear') {
    return { lines: [], clear: true };
  }

  // Disallow shell operators, pipes, redirection, chaining
  if (/[;&|><`$()]/.test(trimmed)) {
    return {
      lines: [
        `Unknown command: ${trimmed}`,
        'Error: Shell syntax, operators, pipes, and chaining are not permitted.',
        'This environment is a restricted diagnostic terminal. Enter single commands only.'
      ]
    };
  }

  const parts = trimmed.split(/\s+/);
  const rootCommand = parts[0].toLowerCase();
  const subCommand = parts[1] ? parts[1].toLowerCase() : '';
  const argument = parts[2] ? parts.slice(2).join(' ') : '';

  // Intercept standard shell commands and guide users safely
  const standardShellCommands = ['ls', 'cd', 'cat', 'pwd', 'rm', 'mkdir', 'sudo', 'sh', 'bash', 'ps', 'top', 'whoami', 'ping'];
  if (standardShellCommands.includes(rootCommand)) {
    return {
      lines: [
        `Unknown command: ${trimmed}`,
        `Command '${rootCommand}' is not supported in the ORBIT Diagnostic Terminal.`,
        "All diagnostic capabilities are accessed via the 'orbit' command suite.",
        "Type 'orbit help' for a list of available diagnostic tools."
      ]
    };
  }

  if (rootCommand !== 'orbit') {
    const suggestion = findClosestCommand(trimmed);
    const lines = [`Unknown command: ${trimmed}`];
    if (suggestion) {
      lines.push(`Did you mean: ${suggestion}?`);
    }
    lines.push("Type 'orbit help' for a list of valid commands.");
    return { lines };
  }

  // Subcommand dispatch
  switch (subCommand) {
    case 'help': {
      return {
        lines: [
          'ORBIT CAMPUS DIAGNOSTIC TERMINAL — SYSTEM COMMAND MANUAL',
          '========================================================================',
          'Command                  Description & Usage Example',
          '------------------------------------------------------------------------',
          'orbit help               Display this command manual and diagnostic syntax.',
          'orbit services           Display operational status, simulated uptime, and timestamps.',
          'orbit logs [path]        List available forensic logs or read a specific log.',
          'orbit broken             List virtual files grouped by damage category.',
          'orbit modified           Chronological report of recently modified virtual files.',
          'orbit files [path]       List entries within virtual directory (e.g. orbit files /logs).',
          'orbit inspect <path>     Inspect metadata and integrity status of a virtual file.',
          'orbit read <path>        Read text content of an approved readable virtual file.',
          'clear                    Clear the visible terminal transcript.',
          '========================================================================',
          'Note: All commands operate exclusively within the fictional ORBIT simulation.'
        ]
      };
    }

    case 'services': {
      const header = 'SERVICE              STATUS        UPTIME        LAST ACTIVE';
      const divider = '-----------------------------------------------------------------';
      const rows = ORBIT_SERVICES_TELEMETRY.map((s) => {
        const nameCol = s.name.padEnd(20);
        const statusCol = s.status.padEnd(14);
        const uptimeCol = s.uptime.padEnd(14);
        return `${nameCol} ${statusCol} ${uptimeCol} ${s.lastActive}`;
      });

      return {
        lines: [
          'ORBIT CAMPUS CORE SERVICES TELEMETRY REPORT',
          header,
          divider,
          ...rows,
          divider,
          'Notice: Telemetry indicates synchronized subsystem degradation.'
        ]
      };
    }

    case 'logs': {
      const targetPath = argument || parts[2];
      // If a specific log path was provided (e.g. orbit logs /logs/auth.log or orbit logs auth.log), read that file directly
      if (targetPath) {
        let resolvedPath = targetPath;
        if (!resolvedPath.startsWith('/logs/') && !resolvedPath.startsWith('/')) {
          resolvedPath = `/logs/${resolvedPath}`;
        }
        const file = getVirtualFile(resolvedPath);
        if (file && file.isReadable && file.content) {
          return {
            lines: [
              `--- START OF FILE: ${file.path} ---`,
              ...file.content.split('\n'),
              `--- END OF FILE: ${file.path} ---`
            ]
          };
        }
      }

      // Default: list all available logs with one-line descriptions
      const logFiles = VIRTUAL_FILES.filter((f) => f.path.startsWith('/logs/') && !f.isDirectory);
      const lines: string[] = [
        'ORBIT CAMPUS FORENSIC & SYSTEM LOG REPOSITORY',
        '========================================================================',
        'LOG PATH              STATUS    MODIFIED             DESCRIPTION',
        '------------------------------------------------------------------------'
      ];

      for (const log of logFiles) {
        const pathCol = log.path.padEnd(21);
        const statusCol = (log.isReadable ? 'READABLE' : log.integrity.toUpperCase()).padEnd(9);
        const modCol = log.modifiedAt.padEnd(20);
        let desc = 'System diagnostic log.';
        if (log.name === 'auth.log') {
          desc = 'Authentication events, SSH sessions, PAM privilege audits.';
        } else if (log.name === 'firewall.log') {
          desc = 'Perimeter packet filter, boundary gateway, and VLAN routing.';
        } else if (log.name === 'audit.log') {
          desc = 'Filesystem integrity, database queries, and record access.';
        } else if (log.name === 'service.log') {
          desc = 'Daemon lifecycle, health checks, and process supervisor logs.';
        } else if (log.name === 'mail_queue.log') {
          desc = 'SMTP MTA queue volume, rate limits, and delivery throttling.';
        }
        lines.push(`${pathCol} ${statusCol} ${modCol} ${desc}`);
      }

      lines.push('========================================================================');
      lines.push("Usage: orbit read <path> (e.g. orbit read /logs/auth.log)");
      return { lines };
    }

    case 'broken': {
      const { corrupted, missing, inaccessible } = getBrokenFiles();

      const lines: string[] = [
        'ORBIT VIRTUAL FILESYSTEM DAMAGE REPORT',
        '========================================================================'
      ];

      lines.push('1. CORRUPTED FILES:');
      if (corrupted.length === 0) {
        lines.push('  No corrupted files found.');
      } else {
        corrupted.forEach((f) => {
          lines.push(`  * ${f.path}`);
          lines.push(`    Status: Checksum mismatch | Diagnostic: ${f.diagnosticNote || 'Integrity failed'}`);
        });
      }

      lines.push('');
      lines.push('2. MISSING FILES:');
      if (missing.length === 0) {
        lines.push('  No missing files found.');
      } else {
        missing.forEach((f) => {
          lines.push(`  * ${f.path}`);
          lines.push(`    Status: File absent | Diagnostic: ${f.diagnosticNote || 'Node missing'}`);
        });
      }

      lines.push('');
      lines.push('3. INACCESSIBLE FILES:');
      if (inaccessible.length === 0) {
        lines.push('  No inaccessible files found.');
      } else {
        inaccessible.forEach((f) => {
          lines.push(`  * ${f.path}`);
          lines.push(`    Status: Permission denied | Diagnostic: ${f.diagnosticNote || 'Access restricted'}`);
        });
      }

      lines.push('========================================================================');
      lines.push('Use "orbit inspect <path>" for detailed metadata on any specific node.');

      return { lines };
    }

    case 'modified': {
      const modifiedFiles = getModifiedFiles();
      const lines: string[] = [
        'ORBIT VIRTUAL AUDIT LOG: RECENTLY MODIFIED FILES (NEWEST FIRST)',
        '========================================================================',
        'TIMESTAMP           FILE PATH                           OBSERVED CHANGE',
        '------------------------------------------------------------------------'
      ];

      for (const f of modifiedFiles) {
        const timeCol = f.modifiedAt.padEnd(19);
        const pathCol = f.path.padEnd(35);
        lines.push(`${timeCol} ${pathCol} ${f.changeDescription || 'File altered'}`);
      }

      lines.push('========================================================================');
      return { lines };
    }

    case 'files': {
      const targetPath = argument || parts[2] || '/';
      const res = getVirtualDirectoryEntries(targetPath);

      if (!res.success || !res.entries) {
        return {
          lines: [
            `Error: ${res.error}`,
            "Use 'orbit files /' to view root virtual directories."
          ]
        };
      }

      const normalized = normalizeVirtualPath(targetPath) || '/';
      const lines: string[] = [
        `VIRTUAL DIRECTORY LISTING: ${normalized}`,
        '------------------------------------------------------------------------',
        'PERMS       OWNER      SIZE (B)   MODIFIED            NAME',
        '------------------------------------------------------------------------'
      ];

      for (const item of res.entries) {
        const perms = item.permissions.padEnd(11);
        const owner = item.owner.padEnd(10);
        const size = String(item.sizeBytes).padStart(10);
        const mod = item.modifiedAt.padEnd(19);
        const name = item.isDirectory
          ? (normalized === '/' ? `${item.path}/` : `${item.name}/`)
          : item.name;
        lines.push(`${perms} ${owner} ${size}  ${mod}  ${name}`);
      }

      lines.push('------------------------------------------------------------------------');
      lines.push(`Total entries: ${res.entries.length}`);
      return { lines };
    }

    case 'inspect': {
      const targetPath = argument || parts[2];
      if (!targetPath) {
        return {
          lines: [
            'Error: Missing path argument for inspect.',
            'Usage: orbit inspect <path>',
            'Example: orbit inspect /logs/auth.log'
          ]
        };
      }

      const file = getVirtualFile(targetPath);
      if (!file) {
        return {
          lines: [
            `Error: File not found in virtual filesystem: ${targetPath}`,
            "Use 'orbit files' to browse available directories and paths."
          ]
        };
      }

      const lines: string[] = [
        'VIRTUAL NODE METADATA INSPECTION',
        '========================================================================',
        `File:          ${file.path}`,
        `File Path:     ${file.path}`,
        `Type:          ${file.isDirectory ? 'Directory' : 'Regular File'}`,
        `Size:          ${file.sizeBytes} bytes`,
        `Owner:         ${file.owner}`,
        `Permissions:   ${file.permissions}`,
        `Created:       ${file.createdAt}`,
        `Last Modified: ${file.modifiedAt}`,
        `Integrity:     ${file.integrity.toUpperCase()}`
      ];

      if (file.integrity === 'corrupted') {
        lines.push(`Integrity Note: ${file.diagnosticNote || 'Integrity check failed'}`);
      } else if (file.integrity === 'missing') {
        lines.push(`Integrity Note: ${file.diagnosticNote || 'File is missing from virtual storage'}`);
      } else if (file.integrity === 'inaccessible') {
        lines.push(`Access Note:    ${file.diagnosticNote || 'Permission denied'}`);
      } else {
        lines.push('Status:        Normal (Verified)');
      }

      lines.push('========================================================================');
      return { lines };
    }

    case 'read': {
      const targetPath = argument || parts[2];
      if (!targetPath) {
        return {
          lines: [
            'Error: Missing path argument for read.',
            'Usage: orbit read <path>',
            'Example: orbit read /logs/auth.log'
          ]
        };
      }

      let file = getVirtualFile(targetPath);
      if (!file && !targetPath.startsWith('/') && !targetPath.includes('..')) {
        file = getVirtualFile(`/logs/${targetPath}`);
      }
      if (!file) {
        return {
          lines: [`Error: File not found in virtual filesystem: ${targetPath}`]
        };
      }

      if (file.isDirectory) {
        return {
          lines: [
            `Error: Cannot read directory as a text file: ${targetPath}`,
            `Use 'orbit files ${targetPath}' to list its contents.`
          ]
        };
      }

      if (file.integrity === 'missing') {
        return {
          lines: [
            `Error: File is missing from virtual storage: ${targetPath}`,
            `Diagnostic: ${file.diagnosticNote || 'File absent'}`
          ]
        };
      }

      if (file.integrity === 'corrupted') {
        return {
          lines: [
            `Error: File is corrupted and cannot be read as text: ${targetPath}`,
            `Diagnostic: ${file.diagnosticNote || 'Checksum mismatch'}`
          ]
        };
      }

      if (file.integrity === 'inaccessible') {
        return {
          lines: [
            `Error: Access denied. File permissions restrict reading: ${targetPath}`,
            `Diagnostic: ${file.diagnosticNote || 'Permission denied'}`
          ]
        };
      }

      if (!file.isReadable || typeof file.content !== 'string') {
        return {
          lines: [`Error: File is not an approved readable text file: ${targetPath}`]
        };
      }

      return {
        lines: [
          `--- START OF FILE: ${file.path} ---`,
          ...file.content.split('\n'),
          `--- END OF FILE: ${file.path} ---`
        ]
      };
    }

    default: {
      const fullUnknown = trimmed;
      const suggestion = findClosestCommand(fullUnknown);
      const lines = [`Unknown command: ${fullUnknown}`];
      if (suggestion) {
        lines.push(`Did you mean: ${suggestion}?`);
      }
      lines.push("Type 'orbit help' for a list of valid commands.");
      return { lines };
    }
  }
}
