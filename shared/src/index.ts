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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  authenticatedUser?: string;
  sessionId?: string;
  sessionRef?: string;
}

export interface SessionValidateResponse {
  valid: boolean;
  authenticatedUser?: string;
  sessionRef?: string;
  message?: string;
}

export type ServiceStatus =
  | 'Operational'
  | 'Degraded'
  | 'Unstable'
  | 'Restricted'
  | 'Compromised'
  | 'Offline';

export type ServiceSeverity = 'healthy' | 'impaired' | 'failed';

export interface ServiceCardData {
  id: string;
  name: string;
  status: ServiceStatus;
  severity: ServiceSeverity;
  description: string;
  impactSummary: string;
  lastUpdated: string;
  evidenceStageLabel: string;
  evidenceDescription: string;
}

export interface SystemSummary {
  healthPercentage: number;
  operationalCount: number;
  impairedCount: number;
  failedCount: number;
  totalCount: number;
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  service: string;
  event: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface GhostMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  timestamp: string;
  body: string;
}

export const INITIAL_SERVICES: ServiceCardData[] = [
  {
    id: 'student-portal',
    name: 'Student Portal',
    status: 'Offline',
    severity: 'failed',
    description: 'Primary student course registration, grading gateway, and campus single sign-on interface.',
    impactSummary: 'All inbound web listeners non-responsive. SSL reverse proxy reporting connection timeouts.',
    lastUpdated: '21:04:12',
    evidenceStageLabel: 'INVESTIGATION STAGE LOCKED',
    evidenceDescription: 'Forensic memory capture and packet traces for this node are locked pending authorization. Investigation stage not yet active.'
  },
  {
    id: 'academic-records',
    name: 'Academic Records',
    status: 'Compromised',
    severity: 'failed',
    description: 'Central database containing transcript records, degree audit certifications, and institutional holds.',
    impactSummary: 'Unauthorized privilege escalation detected in audit trail. Cryptographic checksum integrity mismatch.',
    lastUpdated: '20:58:33',
    evidenceStageLabel: 'INVESTIGATION STAGE LOCKED',
    evidenceDescription: 'Database query logs and compromised access records are sealed pending Stage 2 authorization.'
  },
  {
    id: 'campus-mail',
    name: 'Campus Mail',
    status: 'Degraded',
    severity: 'impaired',
    description: 'Campus-wide SMTP message routing, webmail endpoints, and directory synchronization services.',
    impactSummary: 'Outbound relay queue backing up. External sender reputation throttling actively engaged.',
    lastUpdated: '21:11:45',
    evidenceStageLabel: 'INVESTIGATION STAGE LOCKED',
    evidenceDescription: 'Mail server header dumps and quarantine logs are restricted. Proceed through investigation stages to unlock.'
  },
  {
    id: 'campus-network',
    name: 'Campus Network',
    status: 'Unstable',
    severity: 'impaired',
    description: 'Core backbone routing switches, perimeter firewall gateways, and dormitory access controllers.',
    impactSummary: 'Intermittent packet drops observed across VLAN 40. High latency reported on gateway interfaces.',
    lastUpdated: '21:08:19',
    evidenceStageLabel: 'INVESTIGATION STAGE LOCKED',
    evidenceDescription: 'Switch telemetry logs and packet captures remain locked until Stage 1 completion.'
  },
  {
    id: 'backup-recovery',
    name: 'Backup & Recovery',
    status: 'Restricted',
    severity: 'impaired',
    description: 'Disaster recovery snapshot repositories, off-site replication storage, and archive indexers.',
    impactSummary: 'Automated backup schedules halted by administrative interlock. Read-only protection enforced.',
    lastUpdated: '20:45:00',
    evidenceStageLabel: 'INVESTIGATION STAGE LOCKED',
    evidenceDescription: 'Disaster recovery manifests and cold archive blocks are inaccessible until recovery stage authorization.'
  }
];

export function computeSystemSummary(services: ServiceCardData[]): SystemSummary {
  const totalCount = services.length;
  const operationalCount = services.filter((s) => s.severity === 'healthy').length;
  const impairedCount = services.filter((s) => s.severity === 'impaired').length;
  const failedCount = services.filter((s) => s.severity === 'failed').length;

  // Derive health % consistently: healthy = 100%, impaired = 40%, failed = 0%
  const healthPercentage = totalCount === 0
    ? 0
    : Math.round(((operationalCount * 100) + (impairedCount * 40)) / totalCount);

  return {
    healthPercentage,
    operationalCount,
    impairedCount,
    failedCount,
    totalCount
  };
}

export const RECENT_ACTIVITY_ITEMS: RecentActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '21:14:08',
    service: 'Campus Security',
    event: 'Anomalous internal message injected into IT Admin distribution list by external alias GHOST.',
    severity: 'critical'
  },
  {
    id: 'act-2',
    timestamp: '21:11:45',
    service: 'Campus Mail',
    event: 'SMTP relay threshold reached; throttling engaged to prevent mail queue overflow.',
    severity: 'warning'
  },
  {
    id: 'act-3',
    timestamp: '21:08:19',
    service: 'Campus Network',
    event: 'Core switch VLAN 40 experiencing 22% packet loss; routing table divergence detected.',
    severity: 'warning'
  },
  {
    id: 'act-4',
    timestamp: '21:04:12',
    service: 'Student Portal',
    event: 'Gateway service health check timeout. Web application daemon terminated abnormally.',
    severity: 'critical'
  },
  {
    id: 'act-5',
    timestamp: '20:58:33',
    service: 'Academic Records',
    event: 'Cryptographic hash mismatch reported by database integrity agent on student credential store.',
    severity: 'critical'
  },
  {
    id: 'act-6',
    timestamp: '20:45:00',
    service: 'Backup & Recovery',
    event: 'System administrator lockdown triggered; snapshot modification permissions suspended.',
    severity: 'warning'
  }
];

export const GHOST_MESSAGE: GhostMessage = {
  id: 'msg-ghost-01',
  from: 'GHOST',
  to: 'Admin Group',
  subject: "Well, look who's here.",
  timestamp: '21:14:08',
  body: `So the credentials survived. And someone was clever enough to find them.

Congratulations. You made it through the front door.

Welcome to ORBIT. You'll notice a few things aren't working quite as they should. I'd fix them myself, but I've already done enough work around here.

The logs might tell you a story. Whether you understand it is another question.

Have fun exploring.

GHOST`
};

export * from './terminal.js';
export * from './attackMap.js';

