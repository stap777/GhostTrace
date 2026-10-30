/**
 * Shared types, models, and initial state for OPERATION: GHOST TRACE - Attack Path Reconstruction
 * 
 * NOTE: Contains NO secret flags, hidden answers, or answer keys.
 * Operates purely as a user-authored investigation workspace.
 */

export type AttackMapEntityType =
  | 'external_source'
  | 'compromised_account'
  | 'internal_machine'
  | 'orbit_service'
  | 'sensitive_record'
  | 'disrupted_service';

export interface AttackMapEntityConfig {
  type: AttackMapEntityType;
  label: string;
  badgeClass: string;
  color: string;
  icon: string;
  description: string;
}

export const ATTACK_MAP_ENTITY_TYPES: Record<AttackMapEntityType, AttackMapEntityConfig> = {
  external_source: {
    type: 'external_source',
    label: 'External Source',
    badgeClass: 'entity-badge-external',
    color: '#ef4444',
    icon: '🌐',
    description: 'External IP address, internet gateway, or remote origin.'
  },
  compromised_account: {
    type: 'compromised_account',
    label: 'Compromised Account',
    badgeClass: 'entity-badge-account',
    color: '#f59e0b',
    icon: '👤',
    description: 'Stolen credential, compromised username, or hijacked session.'
  },
  internal_machine: {
    type: 'internal_machine',
    label: 'Internal Machine',
    badgeClass: 'entity-badge-machine',
    color: '#38bdf8',
    icon: '🖥️',
    description: 'Internal workstation, pivot host, or campus subnet node.'
  },
  orbit_service: {
    type: 'orbit_service',
    label: 'ORBIT Service',
    badgeClass: 'entity-badge-service',
    color: '#a855f7',
    icon: '⚙️',
    description: 'Internal campus daemon, database listener, or gateway service.'
  },
  sensitive_record: {
    type: 'sensitive_record',
    label: 'Sensitive Record',
    badgeClass: 'entity-badge-record',
    color: '#10b981',
    icon: '📁',
    description: 'Database table, config file, credential token, or daily backup.'
  },
  disrupted_service: {
    type: 'disrupted_service',
    label: 'Disrupted Service',
    badgeClass: 'entity-badge-disrupted',
    color: '#f43f5e',
    icon: '⚠️',
    description: 'Impacted or failed subsystem (Offline, Compromised, Unstable).'
  }
};

export interface TimelineStageSlot {
  id: number;
  stageName: string;
  stageSubtitle: string;
  descriptionHint: string;
  explanation: string;
  timestamp: string;
  evidenceFile: string;
  identifier: string;
}

export const INITIAL_TIMELINE_STAGES: TimelineStageSlot[] = [
  {
    id: 1,
    stageName: 'Initial Access',
    stageSubtitle: 'Stage 1: Perimeter Breach',
    descriptionHint: 'How did the attacker first gain ingress or access to an internal account or network boundary?',
    explanation: '',
    timestamp: '',
    evidenceFile: '',
    identifier: ''
  },
  {
    id: 2,
    stageName: 'Internal Reconnaissance',
    stageSubtitle: 'Stage 2: Network Probing',
    descriptionHint: 'What scanning, directory traversal, or service probing did the attacker conduct from within?',
    explanation: '',
    timestamp: '',
    evidenceFile: '',
    identifier: ''
  },
  {
    id: 3,
    stageName: 'Privilege Escalation / Lateral Movement',
    stageSubtitle: 'Stage 3: Privilege Pivot',
    descriptionHint: 'How did the attacker pivot between hosts, escalate privileges, or switch credentials?',
    explanation: '',
    timestamp: '',
    evidenceFile: '',
    identifier: ''
  },
  {
    id: 4,
    stageName: 'Data Access and Tampering',
    stageSubtitle: 'Stage 4: Target Manipulation',
    descriptionHint: 'Which records, database tables, or files were accessed, queried, or corrupted?',
    explanation: '',
    timestamp: '',
    evidenceFile: '',
    identifier: ''
  },
  {
    id: 5,
    stageName: 'Service Disruption',
    stageSubtitle: 'Stage 5: Subsystem Impact',
    descriptionHint: 'Which campus services or network segments were terminated, throttled, or destabilized?',
    explanation: '',
    timestamp: '',
    evidenceFile: '',
    identifier: ''
  },
  {
    id: 6,
    stageName: 'Final Attacker Activity',
    stageSubtitle: 'Stage 6: Incident Conclusion',
    descriptionHint: 'What final message, signature, or outbound broadcast concluded the incident?',
    explanation: '',
    timestamp: '',
    evidenceFile: '',
    identifier: ''
  }
];

export interface AttackMapNode {
  id: string;
  type: AttackMapEntityType;
  label: string;
  notes?: string;
  x?: number;
  y?: number;
}

export interface AttackMapConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
}

export interface EvidenceNotes {
  observations: string;
  timestamps: string;
  identifiers: string;
  unansweredQuestions: string;
}

export const INITIAL_EVIDENCE_NOTES: EvidenceNotes = {
  observations: '',
  timestamps: '',
  identifiers: '',
  unansweredQuestions: ''
};

export interface AttackMapState {
  timeline: TimelineStageSlot[];
  nodes: AttackMapNode[];
  connections: AttackMapConnection[];
  notes: EvidenceNotes;
}

export const INITIAL_ATTACK_MAP_STATE: AttackMapState = {
  timeline: INITIAL_TIMELINE_STAGES,
  nodes: [],
  connections: [],
  notes: INITIAL_EVIDENCE_NOTES
};

export function computeTimelineProgress(stages: TimelineStageSlot[]): {
  documentedCount: number;
  totalCount: number;
  percentage: number;
} {
  const totalCount = stages.length;
  const documentedCount = stages.filter(
    (s) =>
      s.explanation.trim() !== '' ||
      s.timestamp.trim() !== '' ||
      s.evidenceFile.trim() !== '' ||
      s.identifier.trim() !== ''
  ).length;

  const percentage = totalCount > 0 ? Math.round((documentedCount / totalCount) * 100) : 0;
  return { documentedCount, totalCount, percentage };
}
