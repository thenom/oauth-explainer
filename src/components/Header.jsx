import React from 'react';
import { Shield, BookOpen, AlertOctagon, RotateCcw, Sparkles } from 'lucide-react';
import '../styles/header.css';

export function Header({
  flows,
  selectedFlowId,
  onSelectFlow,
  presets,
  selectedPresetId,
  onSelectPreset,
  onOpenGlossary,
  onOpenSandbox,
  onReset
}) {
  const currentFlow = flows.find(f => f.id === selectedFlowId) || flows[0];

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="logo-badge">
          <Shield size={26} />
        </div>
        <div>
          <div className="brand-title">
            OAuth 2.0 & OIDC Studio
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Visual Explainer</span>
          </div>
          <div className="brand-subtitle">
            Interactive Step-by-Step Protocol & Security Simulator
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="flow-picker-container" title="Select OAuth 2.0 Grant Type or Flow">
          <label htmlFor="flow-select" style={{ display: 'none' }}>OAuth Flow</label>
          <Sparkles size={16} color="#38bdf8" />
          <select
            id="flow-select"
            className="flow-select"
            value={selectedFlowId}
            onChange={(e) => onSelectFlow(e.target.value)}
          >
            {flows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.name} {flow.badge ? `(${flow.badge})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-header btn-tamper"
          onClick={onOpenSandbox}
          title="Simulate attacks, tampering, and parameter edge cases"
        >
          <AlertOctagon size={15} />
          Attack & Tamper Sandbox
        </button>

        <button
          className="btn-header"
          onClick={onOpenGlossary}
          title="Open RFC Glossary and Terminology Dictionary"
        >
          <BookOpen size={15} />
          RFC Glossary
        </button>

        <button
          className="btn-header"
          onClick={onReset}
          title="Reset flow to Step 1"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </header>
  );
}
