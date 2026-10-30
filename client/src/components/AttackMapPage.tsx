import React, { useState, useEffect, useMemo } from 'react';
import {
  type AttackMapState,
  type TimelineStageSlot,
  type AttackMapNode,
  type AttackMapConnection,
  type AttackMapEntityType,
  type EvidenceNotes,
  ATTACK_MAP_ENTITY_TYPES,
  INITIAL_ATTACK_MAP_STATE,
  computeTimelineProgress
} from '@ghost-trace/shared';
import {
  loadAttackMapState,
  saveAttackMapState,
  clearAttackMapState
} from '../data/attackMapStorage';

interface AttackMapPageProps {
  sessionId?: string;
}

type ActiveSectionView = 'all' | 'timeline' | 'graph' | 'notes';

export const AttackMapPage: React.FC<AttackMapPageProps> = ({ sessionId }) => {
  // Load persisted state from sessionStorage
  const [state, setState] = useState<AttackMapState>(() => loadAttackMapState(sessionId));
  const [activeSection, setActiveSection] = useState<ActiveSectionView>('all');
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Node creation / editing modal state
  const [showAddNodeModal, setShowAddNodeModal] = useState<boolean>(false);
  const [nodeType, setNodeType] = useState<AttackMapEntityType>('external_source');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [nodeNotes, setNodeNotes] = useState<string>('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Connection creation modal state
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [sourceNodeId, setSourceNodeId] = useState<string>('');
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [connectionLabel, setConnectionLabel] = useState<string>('');

  // Persist state whenever state changes
  useEffect(() => {
    saveAttackMapState(state, sessionId);
  }, [state, sessionId]);

  // Compute progress across the 6 timeline slots
  const progress = useMemo(() => computeTimelineProgress(state.timeline), [state.timeline]);

  // Timeline handlers
  const handleTimelineChange = (
    stageId: number,
    field: keyof Omit<TimelineStageSlot, 'id' | 'stageName' | 'stageSubtitle' | 'descriptionHint'>,
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      timeline: prev.timeline.map((slot) =>
        slot.id === stageId ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleClearStage = (stageId: number) => {
    setState((prev) => ({
      ...prev,
      timeline: prev.timeline.map((slot) =>
        slot.id === stageId
          ? {
              ...slot,
              explanation: '',
              timestamp: '',
              evidenceFile: '',
              identifier: ''
            }
          : slot
      )
    }));
  };

  // Node handlers
  const handleOpenAddNode = () => {
    setEditingNodeId(null);
    setNodeType('external_source');
    setNodeLabel('');
    setNodeNotes('');
    setShowAddNodeModal(true);
  };

  const handleOpenEditNode = (node: AttackMapNode) => {
    setEditingNodeId(node.id);
    setNodeType(node.type);
    setNodeLabel(node.label);
    setNodeNotes(node.notes || '');
    setShowAddNodeModal(true);
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeLabel.trim()) return;

    if (editingNodeId) {
      // Edit existing node
      setState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === editingNodeId
            ? { ...n, type: nodeType, label: nodeLabel.trim(), notes: nodeNotes.trim() }
            : n
        )
      }));
    } else {
      // Create new node
      const newNode: AttackMapNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: nodeType,
        label: nodeLabel.trim(),
        notes: nodeNotes.trim()
      };
      setState((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }));
    }

    setShowAddNodeModal(false);
    setNodeLabel('');
    setNodeNotes('');
    setEditingNodeId(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      // Also remove all connections linked to this node
      connections: prev.connections.filter(
        (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      )
    }));
  };

  // Connection handlers
  const handleOpenConnect = () => {
    if (state.nodes.length < 2) return;
    setSourceNodeId(state.nodes[0].id);
    setTargetNodeId(state.nodes[1].id);
    setConnectionLabel('');
    setShowConnectModal(true);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) return;

    const newConnection: AttackMapConnection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceNodeId,
      targetNodeId,
      label: connectionLabel.trim() || 'connects to'
    };

    setState((prev) => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));

    setShowConnectModal(false);
    setConnectionLabel('');
  };

  const handleDeleteConnection = (connId: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connId)
    }));
  };

  // Notes handlers
  const handleNotesChange = (field: keyof EvidenceNotes, value: string) => {
    setState((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [field]: value
      }
    }));
  };

  // Reset handler
  const handleConfirmReset = () => {
    clearAttackMapState(sessionId);
    setState(INITIAL_ATTACK_MAP_STATE);
    setShowResetModal(false);
  };

  // Compute node positions for SVG visualization
  // Arrange nodes by entity type column or staggered flow
  const nodePositions = useMemo(() => {

    const colX: Record<AttackMapEntityType, number> = {
      external_source: 80,
      compromised_account: 260,
      internal_machine: 450,
      sensitive_record: 640,
      orbit_service: 830,
      disrupted_service: 1020
    };

    const counts: Record<AttackMapEntityType, number> = {
      external_source: 0,
      compromised_account: 0,
      internal_machine: 0,
      sensitive_record: 0,
      orbit_service: 0,
      disrupted_service: 0
    };

    const map = new Map<string, { x: number; y: number }>();

    for (const node of state.nodes) {
      const type = node.type in colX ? node.type : 'external_source';
      const x = colX[type];
      const y = 80 + counts[type] * 110;
      counts[type] += 1;
      map.set(node.id, { x, y });
    }

    return map;
  }, [state.nodes]);

  const maxSvgHeight = useMemo(() => {
    let maxY = 350;
    nodePositions.forEach((pos) => {
      if (pos.y + 120 > maxY) maxY = pos.y + 120;
    });
    return maxY;
  }, [nodePositions]);

  return (
    <div className="attack-map-workspace" aria-label="Incident Reconstruction Workspace">
      {/* Top Banner / Header */}
      <header className="attack-map-header">
        <div className="attack-map-header-main">
          <div className="attack-map-title-row">
            <span className="attack-map-badge mono">INCIDENT RECONSTRUCTION</span>
            <h1 className="attack-map-title">ATTACK PATH MAP & TIMELINE</h1>
          </div>
          <p className="attack-map-subtitle">
            Correlate evidence from terminal forensic logs to document the 6 incident stages, map attacker entities, and reconstruct the complete attack narrative.
          </p>
        </div>

        {/* Progress & Reset Controls */}
        <div className="attack-map-header-actions">
          <div className="timeline-progress-widget">
            <div className="progress-label-row mono">
              <span>Timeline Progress</span>
              <span className="progress-count">
                {progress.documentedCount} / {progress.totalCount} Documented ({progress.percentage}%)
              </span>
            </div>
            <div className="progress-bar-track" role="progressbar" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="progress-bar-fill"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => setShowResetModal(true)}
            title="Reset all timeline entries, nodes, and notes"
          >
            Reset Investigation
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="attack-map-nav-bar">
        <button
          type="button"
          className={`attack-nav-tab ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
        >
          View All Sections
        </button>
        <button
          type="button"
          className={`attack-nav-tab ${activeSection === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSection('timeline')}
        >
          1. Incident Timeline ({progress.documentedCount}/6)
        </button>
        <button
          type="button"
          className={`attack-nav-tab ${activeSection === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveSection('graph')}
        >
          2. Attack Path Map ({state.nodes.length} Nodes, {state.connections.length} Edges)
        </button>
        <button
          type="button"
          className={`attack-nav-tab ${activeSection === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveSection('notes')}
        >
          3. Evidence Notes
        </button>
      </div>

      {/* Empty State Banner (displayed when nothing documented yet) */}
      {progress.documentedCount === 0 && state.nodes.length === 0 && (
        <section className="attack-map-empty-state-banner" role="region" aria-label="Investigation Guidance">
          <div className="empty-state-icon" aria-hidden="true">🔎</div>
          <div className="empty-state-text">
            <h2 className="empty-state-title">Awaiting Terminal Evidence Correlation</h2>
            <p className="empty-state-desc">
              Your investigation workspace is ready. Use the <strong>Terminal</strong> to inspect available forensic logs (run <code className="inline-code">orbit logs</code>, <code className="inline-code">orbit read /logs/auth.log</code>, <code className="inline-code">orbit read /logs/firewall.log</code>) to uncover timestamps, attacker IPs, hijacked accounts, and affected services. Document each finding below to reconstruct the attack sequence.
            </p>
          </div>
        </section>
      )}

      {/* SECTION A: INCIDENT TIMELINE */}
      {(activeSection === 'all' || activeSection === 'timeline') && (
        <section className="attack-section" aria-labelledby="timeline-heading">
          <div className="section-header">
            <div>
              <span className="section-eyebrow mono">SECTION A</span>
              <h2 id="timeline-heading" className="section-title">CHRONOLOGICAL INCIDENT TIMELINE</h2>
              <p className="section-desc">
                Document each of the six incident stages in chronological sequence based on log evidence.
              </p>
            </div>
            <span className="section-count-badge mono">
              {progress.documentedCount} of 6 stages documented
            </span>
          </div>

          <div className="timeline-stages-list">
            {state.timeline.map((slot) => {
              const isDocumented =
                slot.explanation.trim() !== '' ||
                slot.timestamp.trim() !== '' ||
                slot.evidenceFile.trim() !== '' ||
                slot.identifier.trim() !== '';

              return (
                <div
                  key={slot.id}
                  className={`timeline-slot-card ${isDocumented ? 'is-documented' : ''}`}
                >
                  <div className="slot-card-header">
                    <div className="slot-number-badge mono">
                      {slot.id}
                    </div>
                    <div className="slot-title-group">
                      <div className="slot-stage-meta mono">
                        <span>{slot.stageSubtitle}</span>
                        {isDocumented ? (
                          <span className="status-pill badge-operational">Documented</span>
                        ) : (
                          <span className="status-pill badge-impaired">Awaiting Evidence</span>
                        )}
                      </div>
                      <h3 className="slot-title">{slot.stageName}</h3>
                      <p className="slot-hint">{slot.descriptionHint}</p>
                    </div>

                    {isDocumented && (
                      <button
                        type="button"
                        className="btn-clear-slot"
                        onClick={() => handleClearStage(slot.id)}
                        title="Clear fields for this stage"
                      >
                        Clear Slot
                      </button>
                    )}
                  </div>

                  <div className="slot-card-body">
                    {/* Explanation */}
                    <div className="form-group">
                      <label htmlFor={`slot-exp-${slot.id}`} className="field-label">
                        Observed Incident Activity & Explanation
                      </label>
                      <textarea
                        id={`slot-exp-${slot.id}`}
                        className="field-textarea"
                        rows={3}
                        value={slot.explanation}
                        onChange={(e) => handleTimelineChange(slot.id, 'explanation', e.target.value)}
                        placeholder="Explain what the attacker did during this stage and how it was identified in the logs..."
                      />
                    </div>

                    {/* Metadata 3-column row */}
                    <div className="slot-meta-grid">
                      <div className="form-group">
                        <label htmlFor={`slot-time-${slot.id}`} className="field-label">
                          Correlated Timestamp
                        </label>
                        <input
                          id={`slot-time-${slot.id}`}
                          type="text"
                          className="field-input mono"
                          value={slot.timestamp}
                          onChange={(e) => handleTimelineChange(slot.id, 'timestamp', e.target.value)}
                          placeholder="e.g. 2026-10-29 20:21:04"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`slot-evidence-${slot.id}`} className="field-label">
                          Evidence File / Log Path
                        </label>
                        <input
                          id={`slot-evidence-${slot.id}`}
                          type="text"
                          className="field-input mono"
                          value={slot.evidenceFile}
                          onChange={(e) => handleTimelineChange(slot.id, 'evidenceFile', e.target.value)}
                          placeholder="e.g. /logs/auth.log"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`slot-id-${slot.id}`} className="field-label">
                          IP / Session ID / Account
                        </label>
                        <input
                          id={`slot-id-${slot.id}`}
                          type="text"
                          className="field-input mono"
                          value={slot.identifier}
                          onChange={(e) => handleTimelineChange(slot.id, 'identifier', e.target.value)}
                          placeholder="e.g. 198.51.100.44 / SESS-AUTH-9104"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION B: ATTACK PATH MAP */}
      {(activeSection === 'all' || activeSection === 'graph') && (
        <section className="attack-section" aria-labelledby="graph-heading">
          <div className="section-header">
            <div>
              <span className="section-eyebrow mono">SECTION B</span>
              <h2 id="graph-heading" className="section-title">ATTACK PATH ENTITY MAP</h2>
              <p className="section-desc">
                Connect external origins, compromised accounts, internal pivot machines, and affected ORBIT services.
              </p>
            </div>
            <div className="graph-toolbar-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenAddNode}
              >
                + Add Entity Node
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={state.nodes.length < 2}
                onClick={handleOpenConnect}
                title={state.nodes.length < 2 ? 'Add at least 2 nodes to create connections' : 'Connect two nodes'}
              >
                + Connect Nodes
              </button>
            </div>
          </div>

          {/* Visual SVG Diagram Canvas */}
          <div className="diagram-canvas-container" aria-label="Visual attack path diagram">
            {state.nodes.length === 0 ? (
              <div className="diagram-empty-state">
                <span className="diagram-empty-icon" aria-hidden="true">🕸️</span>
                <p className="diagram-empty-title">No Entities Mapped Yet</p>
                <p className="diagram-empty-desc">
                  Add external sources, accounts, internal pivot machines, and disrupted services discovered in your forensic analysis.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleOpenAddNode}
                >
                  + Add First Entity Node
                </button>
              </div>
            ) : (
              <div className="svg-wrapper" style={{ minHeight: `${maxSvgHeight}px` }}>
                <svg
                  className="diagram-svg"
                  width="1160"
                  height={maxSvgHeight}
                  viewBox={`0 0 1160 ${maxSvgHeight}`}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                    </marker>
                  </defs>

                  {/* Draw connection lines */}
                  {state.connections.map((conn) => {
                    const sourcePos = nodePositions.get(conn.sourceNodeId);
                    const targetPos = nodePositions.get(conn.targetNodeId);
                    if (!sourcePos || !targetPos) return null;

                    const sx = sourcePos.x + 85;
                    const sy = sourcePos.y + 35;
                    const tx = targetPos.x + 85;
                    const ty = targetPos.y + 35;

                    // Compute midpoint for label
                    const mx = (sx + tx) / 2;
                    const my = (sy + ty) / 2 - 12;

                    return (
                      <g key={conn.id} className="svg-connection-group">
                        <line
                          x1={sx}
                          y1={sy}
                          x2={tx}
                          y2={ty}
                          className="svg-line"
                          markerEnd="url(#arrowhead)"
                        />
                        {conn.label && (
                          <g transform={`translate(${mx}, ${my})`}>
                            <rect
                              x="-50"
                              y="-10"
                              width="100"
                              height="20"
                              rx="4"
                              className="svg-label-bg"
                            />
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              className="svg-label-text mono"
                            >
                              {conn.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Render HTML Node Cards on top of SVG */}
                {state.nodes.map((node) => {
                  const pos = nodePositions.get(node.id) || { x: 50, y: 50 };
                  const entityConfig = ATTACK_MAP_ENTITY_TYPES[node.type];

                  return (
                    <div
                      key={node.id}
                      className="diagram-node-card"
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        borderLeftColor: entityConfig.color
                      }}
                    >
                      <div className="node-card-top">
                        <span
                          className={`node-type-pill ${entityConfig.badgeClass} mono`}
                          style={{ borderColor: entityConfig.color }}
                        >
                          {entityConfig.icon} {entityConfig.label}
                        </span>
                        <div className="node-card-actions">
                          <button
                            type="button"
                            className="btn-icon-tiny"
                            onClick={() => handleOpenEditNode(node)}
                            title="Edit Node"
                            aria-label={`Edit ${node.label}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="btn-icon-tiny btn-icon-delete"
                            onClick={() => handleDeleteNode(node.id)}
                            title="Delete Node"
                            aria-label={`Delete ${node.label}`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="node-label mono" title={node.label}>
                        {node.label}
                      </div>

                      {node.notes && (
                        <div className="node-notes" title={node.notes}>
                          {node.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Node & Connection Management Tables */}
          {state.nodes.length > 0 && (
            <div className="graph-tables-grid">
              {/* Nodes Table */}
              <div className="graph-table-panel">
                <div className="panel-title-row">
                  <h3 className="panel-title">Active Graph Nodes ({state.nodes.length})</h3>
                  <button type="button" className="btn-secondary-sm" onClick={handleOpenAddNode}>
                    + Add
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>Entity Type</th>
                        <th>Identifier / Label</th>
                        <th>Notes</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.nodes.map((n) => (
                        <tr key={n.id}>
                          <td>
                            <span className={`node-type-pill ${ATTACK_MAP_ENTITY_TYPES[n.type].badgeClass} mono`}>
                              {ATTACK_MAP_ENTITY_TYPES[n.type].label}
                            </span>
                          </td>
                          <td className="mono font-semibold">{n.label}</td>
                          <td className="text-muted">{n.notes || '—'}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn-delete-link"
                              onClick={() => handleDeleteNode(n.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Connections Table */}
              <div className="graph-table-panel">
                <div className="panel-title-row">
                  <h3 className="panel-title">Active Connections ({state.connections.length})</h3>
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    disabled={state.nodes.length < 2}
                    onClick={handleOpenConnect}
                  >
                    + Connect
                  </button>
                </div>
                {state.connections.length === 0 ? (
                  <p className="empty-subtext">No connections added yet. Click &quot;+ Connect Nodes&quot; to link entities.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Origin</th>
                          <th>Action / Transition</th>
                          <th>Destination</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.connections.map((c) => {
                          const src = state.nodes.find((n) => n.id === c.sourceNodeId);
                          const dst = state.nodes.find((n) => n.id === c.targetNodeId);
                          return (
                            <tr key={c.id}>
                              <td className="mono font-semibold">{src ? src.label : c.sourceNodeId}</td>
                              <td>
                                <span className="connection-pill mono">{c.label}</span>
                              </td>
                              <td className="mono font-semibold">{dst ? dst.label : c.targetNodeId}</td>
                              <td className="text-right">
                                <button
                                  type="button"
                                  className="btn-delete-link"
                                  onClick={() => handleDeleteConnection(c.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION C: EVIDENCE NOTES */}
      {(activeSection === 'all' || activeSection === 'notes') && (
        <section className="attack-section" aria-labelledby="notes-heading">
          <div className="section-header">
            <div>
              <span className="section-eyebrow mono">SECTION C</span>
              <h2 id="notes-heading" className="section-title">EVIDENCE NOTES & WORKING HYPOTHESES</h2>
              <p className="section-desc">
                Record anomalies, correlate timestamps, track IP addresses, and document open questions.
              </p>
            </div>
          </div>

          <div className="evidence-notes-grid">
            <div className="note-card">
              <label htmlFor="notes-observations" className="note-card-label">
                <span className="note-icon">📌</span> Important Observations & Findings
              </label>
              <textarea
                id="notes-observations"
                className="note-textarea"
                rows={5}
                value={state.notes.observations}
                onChange={(e) => handleNotesChange('observations', e.target.value)}
                placeholder="Log entries that caught your attention, inconsistent service states, or suspicious activity sequences..."
              />
            </div>

            <div className="note-card">
              <label htmlFor="notes-timestamps" className="note-card-label">
                <span className="note-icon">⏱️</span> Suspicious Timestamps & Event Windows
              </label>
              <textarea
                id="notes-timestamps"
                className="note-textarea mono"
                rows={5}
                value={state.notes.timestamps}
                onChange={(e) => handleNotesChange('timestamps', e.target.value)}
                placeholder="List key timestamps (e.g. 20:18:30 SSH ingress, 20:58:33 DB crash, 21:04:12 SIGKILL, 21:14:08 GHOST message)..."
              />
            </div>

            <div className="note-card">
              <label htmlFor="notes-identifiers" className="note-card-label">
                <span className="note-icon">🏷️</span> IP Addresses, Session IDs & Accounts
              </label>
              <textarea
                id="notes-identifiers"
                className="note-textarea mono"
                rows={5}
                value={state.notes.identifiers}
                onChange={(e) => handleNotesChange('identifiers', e.target.value)}
                placeholder="Record identified IPs (e.g. 198.51.100.44, 10.0.40.15), usernames (m.turner, orbit-svc), and session IDs (SESS-AUTH-9104)..."
              />
            </div>

            <div className="note-card">
              <label htmlFor="notes-questions" className="note-card-label">
                <span className="note-icon">❓</span> Unanswered Questions & Next Steps
              </label>
              <textarea
                id="notes-questions"
                className="note-textarea"
                rows={5}
                value={state.notes.unansweredQuestions}
                onChange={(e) => handleNotesChange('unansweredQuestions', e.target.value)}
                placeholder="What remains unproven? Which logs need deeper review? What is the team's working theory on GHOST's motive?"
              />
            </div>
          </div>
        </section>
      )}

      {/* ADD / EDIT NODE MODAL */}
      {showAddNodeModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-node-title">
          <div className="modal-panel">
            <div className="modal-header">
              <h3 id="add-node-title" className="modal-title">
                {editingNodeId ? 'Edit Attack Map Entity' : 'Add Entity Node'}
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowAddNodeModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNode}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="node-type-select" className="field-label">Entity Category</label>
                  <select
                    id="node-type-select"
                    className="field-select"
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as AttackMapEntityType)}
                  >
                    {Object.values(ATTACK_MAP_ENTITY_TYPES).map((cfg) => (
                      <option key={cfg.type} value={cfg.type}>
                        {cfg.icon} {cfg.label} — {cfg.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="node-label-input" className="field-label">
                    Entity Label / Identifier *
                  </label>
                  <input
                    id="node-label-input"
                    type="text"
                    required
                    className="field-input mono"
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                    placeholder="e.g. 198.51.100.44, m.turner, 10.0.40.15, students.db, portal-gateway"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="node-notes-input" className="field-label">
                    Context / Notes (Optional)
                  </label>
                  <input
                    id="node-notes-input"
                    type="text"
                    className="field-input"
                    value={nodeNotes}
                    onChange={(e) => setNodeNotes(e.target.value)}
                    placeholder="e.g. Remote attacker IP, compromised via SSH, target DB table"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddNodeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNodeId ? 'Save Changes' : 'Add Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONNECT NODES MODAL */}
      {showConnectModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="connect-nodes-title">
          <div className="modal-panel">
            <div className="modal-header">
              <h3 id="connect-nodes-title" className="modal-title">
                Connect Attack Map Entities
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowConnectModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConnection}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="source-node-select" className="field-label">Source Entity (From)</label>
                  <select
                    id="source-node-select"
                    className="field-select mono"
                    value={sourceNodeId}
                    onChange={(e) => setSourceNodeId(e.target.value)}
                  >
                    {state.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {ATTACK_MAP_ENTITY_TYPES[n.type].icon} {n.label} ({ATTACK_MAP_ENTITY_TYPES[n.type].label})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="target-node-select" className="field-label">Target Entity (To)</label>
                  <select
                    id="target-node-select"
                    className="field-select mono"
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                  >
                    {state.nodes.map((n) => (
                      <option key={n.id} value={n.id} disabled={n.id === sourceNodeId}>
                        {ATTACK_MAP_ENTITY_TYPES[n.type].icon} {n.label} ({ATTACK_MAP_ENTITY_TYPES[n.type].label})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="connection-label-input" className="field-label">
                    Action / Transition Label
                  </label>
                  <input
                    id="connection-label-input"
                    type="text"
                    className="field-input mono"
                    value={connectionLabel}
                    onChange={(e) => setConnectionLabel(e.target.value)}
                    placeholder="e.g. SSH Ingress, Port Scan, SESS-DB-4011, SIGKILL, Crash"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
          <div className="modal-panel modal-panel-danger">
            <div className="modal-header">
              <h3 id="reset-modal-title" className="modal-title modal-title-danger">
                Reset Investigation Data?
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowResetModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="reset-warning-text">
                This action will clear all <strong>6 incident timeline slots</strong>, <strong>attack path nodes and connections</strong>, and <strong>evidence notes</strong> from your team session.
              </p>
              <p className="reset-warning-subtext">
                Your forensic logs and service dashboard states will remain intact. This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmReset}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
