import React, { useState, useEffect, useCallback } from 'react';
import { ALL_FLOWS, FLOWS_MAP, PROVIDER_PRESETS } from './data/flows/index.js';
import { adaptStepForPreset } from './data/flows/presetAdapter.js';
import { Header } from './components/Header.jsx';
import { FlowControls } from './components/FlowControls.jsx';
import { FlowDiagram } from './components/FlowDiagram.jsx';
import { StepExplainer } from './components/StepExplainer.jsx';
import { HttpInspector } from './components/HttpInspector.jsx';
import { ParameterSandbox } from './components/ParameterSandbox.jsx';
import { GlossaryModal } from './components/GlossaryModal.jsx';
import { FlowDecisionModal } from './components/FlowDecisionModal.jsx';
import { AlertTriangle, Building2 } from 'lucide-react';
import './App.css';

export function App() {
  const [selectedFlowId, setSelectedFlowId] = useState('auth_code_pkce');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedPresetId, setSelectedPresetId] = useState('generic');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const currentFlow = FLOWS_MAP[selectedFlowId] || ALL_FLOWS[0];
  const rawSteps = currentFlow.steps || [];
  const adaptedSteps = rawSteps.map(s => adaptStepForPreset(s, selectedPresetId));
  const adaptedFlow = { ...currentFlow, steps: adaptedSteps };
  const currentStep = adaptedSteps[currentStepIndex] || adaptedSteps[0];

  // Switch flow handler
  const handleSelectFlow = useCallback((flowId) => {
    setSelectedFlowId(flowId);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
  }, []);

  // Step navigation
  const handleStepChange = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < adaptedSteps.length) {
      setCurrentStepIndex(newIndex);
    }
  }, [adaptedSteps.length]);

  // Reset flow
  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying) return;

    const intervalTime = 4500 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex >= adaptedSteps.length - 1) {
          setIsAutoPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, playbackSpeed, adaptedSteps.length]);

  // Keyboard navigation (Left/Right arrows, Space for play/pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGlossaryOpen || isSandboxOpen || isDecisionModalOpen) return;

      if (e.key === 'ArrowRight') {
        handleStepChange(currentStepIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        handleStepChange(currentStepIndex - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, handleStepChange, isGlossaryOpen, isSandboxOpen, isDecisionModalOpen]);

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <Header
        flows={ALL_FLOWS}
        selectedFlowId={selectedFlowId}
        onSelectFlow={handleSelectFlow}
        onOpenDecisionWizard={() => setIsDecisionModalOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenSandbox={() => setIsSandboxOpen(true)}
        onReset={handleReset}
      />

      {/* Flow Overview Banner */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.75rem' }}>
          <div className="flow-hero-banner">
            <div className="flow-hero-left">
              <div className="flow-hero-badges">
                <span className={`badge ${currentFlow.isDeprecated ? 'badge-danger' : 'badge-emerald'}`}>
                  {currentFlow.badge}
                </span>
                <span className="flow-standard-rfc">
                  {currentFlow.standard}
                </span>
              </div>
              <p className="flow-hero-desc">
                {currentFlow.description}
              </p>
            </div>

            <div className="flow-hero-provider-picker">
              <Building2 size={16} color="#38bdf8" />
              <label htmlFor="provider-preset" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Provider Preset:
              </label>
              <select
                id="provider-preset"
                className="provider-select"
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
              >
                {PROVIDER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Bar and Playback Controls */}
      <FlowControls
        flow={adaptedFlow}
        currentStepIndex={currentStepIndex}
        onStepChange={handleStepChange}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying(prev => !prev)}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
      />

      {/* Main Interactive Stage */}
      <main className="main-content">
        {currentFlow.isDeprecated && (
          <div className="deprecated-warning-banner">
            <AlertTriangle size={24} color="#f43f5e" />
            <div>
              <strong>Security Warning:</strong> The Implicit Flow is officially deprecated and omitted from OAuth 2.1 due to browser URL token leakage vulnerabilities. Use <strong>Authorization Code Flow with PKCE</strong> for all browser-based applications.
            </div>
          </div>
        )}

        {/* 1. Multi-Actor Process Flow Diagram with Animated Traveling Packet */}
        <FlowDiagram
          flow={adaptedFlow}
          currentStepIndex={currentStepIndex}
        />

        {/* 2. In-Depth "What Happens At This Step" Explainer */}
        <StepExplainer
          step={currentStep}
        />

        {/* 3. Live Protocol & HTTP Inspector */}
        <HttpInspector
          step={currentStep}
        />
      </main>

      {/* Attack & Tamper Sandbox Modal */}
      <ParameterSandbox
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />

      {/* Flow Decision Wizard Modal */}
      <FlowDecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSelectFlow={handleSelectFlow}
      />

      {/* RFC Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div>
          OAuth 2.0 & OpenID Connect Interactive Learning Studio • Built to RFC 6749, RFC 7636, RFC 8628 & OIDC Core 1.0 specifications.
        </div>
        <div style={{ fontSize: '0.75rem' }}>
          Keyboard shortcuts: <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '3px' }}>←</kbd> Prev Step • <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '3px' }}>→</kbd> Next Step • <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '3px' }}>Space</kbd> Play / Pause
        </div>
      </footer>
    </div>
  );
}

export default App;
