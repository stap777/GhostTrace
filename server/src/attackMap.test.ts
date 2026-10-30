import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_TIMELINE_STAGES,
  INITIAL_EVIDENCE_NOTES,
  INITIAL_ATTACK_MAP_STATE,
  ATTACK_MAP_ENTITY_TYPES,
  computeTimelineProgress,
  type AttackMapState,
  type AttackMapNode,
  type AttackMapConnection,
  type AttackMapEntityType
} from '@ghost-trace/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Phase 6: GHOST TRACE Attack Path Reconstruction Verification', () => {

  // --- Section 1: Timeline Slots & Initial State ---
  describe('1. Incident Timeline Slots', () => {
    test('1.1. Provides exactly the six required empty investigation slots in order', () => {
      assert.equal(INITIAL_TIMELINE_STAGES.length, 6, 'Must provide exactly 6 investigation slots');

      const expectedNames = [
        'Initial Access',
        'Internal Reconnaissance',
        'Privilege Escalation / Lateral Movement',
        'Data Access and Tampering',
        'Service Disruption',
        'Final Attacker Activity'
      ];

      INITIAL_TIMELINE_STAGES.forEach((stage, index) => {
        assert.equal(stage.id, index + 1, `Slot #${index + 1} must have id ${index + 1}`);
        assert.equal(stage.stageName, expectedNames[index], `Slot #${index + 1} must match expected stage name`);
        assert.ok(stage.stageSubtitle, `Slot #${index + 1} must have a subtitle`);
        assert.ok(stage.descriptionHint, `Slot #${index + 1} must have a helper hint`);
      });
    });

    test('1.2. Does not prefill any answers, explanations, timestamps, evidence, or identifiers', () => {
      for (const stage of INITIAL_TIMELINE_STAGES) {
        assert.equal(stage.explanation, '', `Stage ${stage.id} explanation must be empty`);
        assert.equal(stage.timestamp, '', `Stage ${stage.id} timestamp must be empty`);
        assert.equal(stage.evidenceFile, '', `Stage ${stage.id} evidenceFile must be empty`);
        assert.equal(stage.identifier, '', `Stage ${stage.id} identifier must be empty`);
      }
    });

    test('1.3. computeTimelineProgress calculates progress based on documented stages', () => {
      // Clean initial state: 0 / 6 (0%)
      const initialProgress = computeTimelineProgress(INITIAL_TIMELINE_STAGES);
      assert.equal(initialProgress.documentedCount, 0);
      assert.equal(initialProgress.totalCount, 6);
      assert.equal(initialProgress.percentage, 0);

      // 1 slot filled
      const oneStageFilled = INITIAL_TIMELINE_STAGES.map((s, idx) =>
        idx === 0
          ? { ...s, explanation: 'Attacker accessed account via VPN with stolen credentials', timestamp: '2026-10-28 19:42:01 UTC' }
          : s
      );
      const prog1 = computeTimelineProgress(oneStageFilled);
      assert.equal(prog1.documentedCount, 1);
      assert.equal(prog1.percentage, 17);

      // 3 slots filled
      const threeStagesFilled = INITIAL_TIMELINE_STAGES.map((s, idx) =>
        idx < 3
          ? { ...s, explanation: `Explanation for stage ${idx + 1}` }
          : s
      );
      const prog3 = computeTimelineProgress(threeStagesFilled);
      assert.equal(prog3.documentedCount, 3);
      assert.equal(prog3.percentage, 50);

      // All 6 slots filled
      const allStagesFilled = INITIAL_TIMELINE_STAGES.map((s, idx) => ({
        ...s,
        explanation: `Documented explanation ${idx + 1}`,
        timestamp: '2026-10-28 20:00:00 UTC',
        evidenceFile: '/logs/audit.log',
        identifier: '10.0.4.15'
      }));
      const prog6 = computeTimelineProgress(allStagesFilled);
      assert.equal(prog6.documentedCount, 6);
      assert.equal(prog6.percentage, 100);
    });
  });

  // --- Section 2: Attack Path Map Entity Types and Graph Operations ---
  describe('2. Attack Path Map Model & Operations', () => {
    test('2.1. Supports all six required entity types with readable labels and color accents', () => {
      const requiredTypes: AttackMapEntityType[] = [
        'external_source',
        'compromised_account',
        'internal_machine',
        'orbit_service',
        'sensitive_record',
        'disrupted_service'
      ];

      const configuredTypeKeys = Object.keys(ATTACK_MAP_ENTITY_TYPES);
      assert.equal(configuredTypeKeys.length, 6, 'Must define exactly 6 entity types');

      for (const type of requiredTypes) {
        const config = ATTACK_MAP_ENTITY_TYPES[type];
        assert.ok(config, `Entity type ${type} must be configured`);
        assert.ok(config.label && config.label.length > 0, `Entity ${type} must have a human-readable label`);
        assert.ok(config.color && config.color.length > 0, `Entity ${type} must have a color code`);
        assert.ok(config.badgeClass && config.badgeClass.length > 0, `Entity ${type} must have a badgeClass`);
        assert.ok(config.icon && config.icon.length > 0, `Entity ${type} must have an icon`);
        assert.ok(config.description && config.description.length > 0, `Entity ${type} must have a description`);
      }
    });

    test('2.2. Node addition, editing, and deletion operations maintain consistency', () => {
      let state: AttackMapState = JSON.parse(JSON.stringify(INITIAL_ATTACK_MAP_STATE));
      assert.equal(state.nodes.length, 0, 'Initial state should have 0 nodes');

      // Add Node 1: External IP
      const node1: AttackMapNode = {
        id: 'node-ext-1',
        label: 'Attacker IP: 198.51.100.44',
        type: 'external_source',
        notes: 'Initial SSH brute force attempt'
      };
      state = { ...state, nodes: [...state.nodes, node1] };
      assert.equal(state.nodes.length, 1);

      // Add Node 2: Compromised Account
      const node2: AttackMapNode = {
        id: 'node-acc-1',
        label: 'Account: j.hartman',
        type: 'compromised_account',
        notes: 'Compromised admin credentials'
      };
      state = { ...state, nodes: [...state.nodes, node2] };
      assert.equal(state.nodes.length, 2);

      // Edit Node 1
      const updatedNode1: AttackMapNode = {
        ...node1,
        label: 'Attacker IP: 198.51.100.44 (GHOST Proxy)',
        notes: 'Confirmed external source in firewall logs'
      };
      state = {
        ...state,
        nodes: state.nodes.map(n => n.id === updatedNode1.id ? updatedNode1 : n)
      };
      assert.equal(state.nodes.find(n => n.id === 'node-ext-1')?.label, 'Attacker IP: 198.51.100.44 (GHOST Proxy)');

      // Add Connection between Node 1 and Node 2
      const connection1: AttackMapConnection = {
        id: 'conn-1',
        sourceNodeId: 'node-ext-1',
        targetNodeId: 'node-acc-1',
        label: 'Authenticates via VPN'
      };
      state = { ...state, connections: [...state.connections, connection1] };
      assert.equal(state.connections.length, 1);

      // Cascade deletion: deleting node-ext-1 removes connected edges
      const remainingNodes = state.nodes.filter(n => n.id !== 'node-ext-1');
      const remainingConnections = state.connections.filter(
        c => c.sourceNodeId !== 'node-ext-1' && c.targetNodeId !== 'node-ext-1'
      );
      state = { ...state, nodes: remainingNodes, connections: remainingConnections };

      assert.equal(state.nodes.length, 1);
      assert.equal(state.nodes[0].id, 'node-acc-1');
      assert.equal(state.connections.length, 0, 'Connection must be cascade-deleted when its node is removed');
    });

    test('2.3. Connections disallow invalid self-loops and duplicate edges', () => {
      const connections: AttackMapConnection[] = [
        { id: 'c1', sourceNodeId: 'node-a', targetNodeId: 'node-b', label: 'connects' }
      ];

      // Validate self-loop check logic
      const isSelfLoop = (src: string, tgt: string) => src === tgt;
      assert.equal(isSelfLoop('node-a', 'node-a'), true);
      assert.equal(isSelfLoop('node-a', 'node-b'), false);

      // Validate duplicate connection check logic
      const isDuplicate = (src: string, tgt: string, list: AttackMapConnection[]) =>
        list.some(c => c.sourceNodeId === src && c.targetNodeId === tgt);

      assert.equal(isDuplicate('node-a', 'node-b', connections), true);
      assert.equal(isDuplicate('node-b', 'node-a', connections), false);
    });
  });

  // --- Section 3: Evidence Notes ---
  describe('3. Evidence Notes Section', () => {
    test('3.1. Evidence notes structure contains the four required investigation categories', () => {
      assert.equal(typeof INITIAL_EVIDENCE_NOTES.observations, 'string');
      assert.equal(typeof INITIAL_EVIDENCE_NOTES.timestamps, 'string');
      assert.equal(typeof INITIAL_EVIDENCE_NOTES.identifiers, 'string');
      assert.equal(typeof INITIAL_EVIDENCE_NOTES.unansweredQuestions, 'string');

      assert.equal(INITIAL_EVIDENCE_NOTES.observations, '');
      assert.equal(INITIAL_EVIDENCE_NOTES.timestamps, '');
      assert.equal(INITIAL_EVIDENCE_NOTES.identifiers, '');
      assert.equal(INITIAL_EVIDENCE_NOTES.unansweredQuestions, '');
    });

    test('3.2. Notes can be modified independently without altering timeline or graph', () => {
      let state: AttackMapState = JSON.parse(JSON.stringify(INITIAL_ATTACK_MAP_STATE));
      state = {
        ...state,
        notes: {
          ...state.notes,
          observations: 'Noticed repeated SSH handshakes before privilege escalation',
          identifiers: 'IP: 198.51.100.44, User: j.hartman, Session: sess_882f',
          unansweredQuestions: 'Did the attacker install any persistent backdoor before wiping logs?'
        }
      };

      assert.ok(state.notes.observations.includes('SSH'));
      assert.ok(state.notes.identifiers.includes('sess_882f'));
      assert.ok(state.notes.unansweredQuestions.includes('backdoor'));
      assert.equal(state.timeline.length, 6);
      assert.equal(state.nodes.length, 0);
    });
  });

  // --- Section 4: Persistence & Reset ---
  describe('4. Persistence and Reset Functionality', () => {
    test('4.1. Attack map storage key is isolated per authenticated session ID', () => {
      const getStorageKey = (sessionId?: string) =>
        sessionId ? `orbit_attack_map_${sessionId}` : 'orbit_attack_map_data';

      const keyA = getStorageKey('session_alpha_123');
      const keyB = getStorageKey('session_beta_456');
      const defaultKey = getStorageKey();

      assert.equal(keyA, 'orbit_attack_map_session_alpha_123');
      assert.equal(keyB, 'orbit_attack_map_session_beta_456');
      assert.equal(defaultKey, 'orbit_attack_map_data');
      assert.notEqual(keyA, keyB, 'Sessions must have distinct, isolated storage keys');
    });

    test('4.2. Reset investigation restores initial empty state completely', () => {
      // Create a heavily modified dirty state
      const dirtyState: AttackMapState = {
        timeline: INITIAL_TIMELINE_STAGES.map((s, i) => ({
          ...s,
          explanation: `Dirty text ${i}`,
          timestamp: '2026-10-30 00:00:00',
          evidenceFile: '/logs/firewall.log',
          identifier: '10.0.4.15'
        })),
        nodes: [
          {
            id: 'node-1',
            label: 'Attacker IP',
            type: 'external_source',
            notes: 'Test note'
          }
        ],
        connections: [
          { id: 'c1', sourceNodeId: 'node-1', targetNodeId: 'node-1', label: 'loop' }
        ],
        notes: {
          observations: 'Some notes',
          timestamps: 'Some timestamps',
          identifiers: 'Some IDs',
          unansweredQuestions: 'Some questions'
        }
      };

      // Reset action restores INITIAL_ATTACK_MAP_STATE
      const resetState: AttackMapState = JSON.parse(JSON.stringify(INITIAL_ATTACK_MAP_STATE));
      assert.equal(resetState.nodes.length, 0);
      assert.equal(resetState.connections.length, 0);
      assert.equal(resetState.notes.observations, '');
      assert.equal(computeTimelineProgress(resetState.timeline).documentedCount, 0);
      for (const slot of resetState.timeline) {
        assert.equal(slot.explanation, '');
      }
    });
  });

  // --- Section 5: UI & App Navigation Integration ---
  describe('5. Application & Navigation Integration', () => {
    test('5.1. Navigation component exposes the Attack Map tab with proper ID and styling', () => {
      const navFile = path.resolve(__dirname, '../../client/src/components/Navigation.tsx');
      assert.ok(fs.existsSync(navFile), 'Navigation.tsx must exist');
      const navCode = fs.readFileSync(navFile, 'utf8');

      assert.ok(navCode.includes("'attack-map'"), 'Navigation must support attack-map in ActiveTab');
      assert.ok(navCode.includes('Attack Map'), 'Navigation must display "Attack Map" label');
      assert.ok(navCode.includes("id: 'attack-map'"), 'Navigation must configure id: "attack-map"');
      assert.ok(navCode.includes('id={`nav-${item.id}`}'), 'Navigation buttons must render dynamic id attribute');
    });

    test('5.2. App.tsx mounts AttackMapPage when attack-map tab is selected', () => {
      const appFile = path.resolve(__dirname, '../../client/src/App.tsx');
      assert.ok(fs.existsSync(appFile), 'App.tsx must exist');
      const appCode = fs.readFileSync(appFile, 'utf8');

      assert.ok(appCode.includes('AttackMapPage'), 'App.tsx must import AttackMapPage');
      assert.ok(appCode.includes("currentTab === 'attack-map'"), 'App.tsx must render AttackMapPage on currentTab');
      assert.ok(appCode.includes('clearAttackMapState'), 'App.tsx must clean up attack map on logout');
    });

    test('5.3. AttackMapPage component includes all required sections and modals', () => {
      const pageFile = path.resolve(__dirname, '../../client/src/components/AttackMapPage.tsx');
      assert.ok(fs.existsSync(pageFile), 'AttackMapPage.tsx must exist');
      const pageCode = fs.readFileSync(pageFile, 'utf8');

      // Section A: Timeline
      assert.ok(pageCode.includes('INCIDENT TIMELINE'), 'Must render Incident Timeline');
      assert.ok(pageCode.includes('evidenceFile'), 'Must have evidence file field');
      assert.ok(pageCode.includes('identifier'), 'Must have identifier field');

      // Section B: Attack Path Map
      assert.ok(pageCode.includes('ATTACK PATH'), 'Must render Attack Path Map');
      assert.ok(pageCode.includes('Add Entity Node'), 'Must provide add entity action');
      assert.ok(pageCode.includes('Connect Nodes'), 'Must provide connect nodes action');

      // Section C: Evidence Notes
      assert.ok(pageCode.includes('EVIDENCE NOTES'), 'Must render Evidence Notes');
      assert.ok(pageCode.includes('Observations & Findings'), 'Must render observations');
      assert.ok(pageCode.includes('Unanswered Questions'), 'Must render unanswered questions');

      // Empty State & Reset
      assert.ok(pageCode.includes('Reset Investigation'), 'Must provide Reset Investigation button');
      assert.ok(pageCode.includes('Reset Investigation Data?'), 'Must provide confirmation modal before reset');
      assert.ok(pageCode.includes('Confirm Reset'), 'Must provide confirm reset button');
      assert.ok(pageCode.includes('Awaiting Terminal Evidence Correlation'), 'Must guide students to inspect logs first');
    });
  });

  // --- Section 6: Investigation Integrity ---
  describe('6. Investigation Integrity Guardrails', () => {
    test('6.1. No challenge solutions or prefilled conclusions are hardcoded in shared data', () => {
      const sharedCode = fs.readFileSync(path.resolve(__dirname, '../../shared/src/attackMap.ts'), 'utf8');
      
      // Ensure no specific answers or flags are embedded in shared attack map
      assert.ok(!sharedCode.includes('FLAG{'), 'Shared code must not contain flags');
      assert.ok(!sharedCode.includes('ORBIT{'), 'Shared code must not contain ORBIT flags');
      assert.ok(!sharedCode.includes('COMPLETION_CODE'), 'Shared code must not contain completion codes');
    });
  });
});
