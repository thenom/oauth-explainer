import React, { useState } from 'react';
import { X, HelpCircle, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import '../styles/modals.css';

export function FlowDecisionModal({ isOpen, onClose, onSelectFlow }) {
  const [appType, setAppType] = useState('spa');
  const [hasSecret, setHasSecret] = useState('no');
  const [needIdentity, setNeedIdentity] = useState('both');

  if (!isOpen) return null;

  // Determine recommendation based on inputs
  let recommendation = {
    flowId: 'auth_code_pkce',
    name: 'Authorization Code Flow with PKCE',
    rfc: 'RFC 7636 + RFC 6749 (OAuth 2.1 Standard)',
    badge: 'Gold Standard',
    badgeType: 'badge-emerald',
    rationale: 'Public clients (such as browser SPAs and mobile applications) cannot securely maintain a client secret. PKCE (Proof Key for Code Exchange) cryptographically binds the authorization code to the client instance using SHA-256 challenges, completely neutralizing code interception attacks.',
    oidcNote: needIdentity === 'both' ? 'Include `scope=openid` to receive an OIDC ID Token alongside your Access Token for verified user authentication.' : null,
    warning: null
  };

  if (appType === 'm2m') {
    recommendation = {
      flowId: 'client_credentials',
      name: 'Client Credentials Flow',
      rfc: 'RFC 6749 §4.4',
      badge: 'Machine-to-Machine',
      badgeType: 'badge-purple',
      rationale: 'When background daemons, scheduled cron jobs, or microservices communicate directly without any human end-user in the loop, the client authenticates directly with its own credentials (client_id + client_secret) to request an access token.',
      oidcNote: 'Client Credentials grant does not issue ID tokens or refresh tokens; credentials can be reused to request new tokens on demand.',
      warning: null
    };
  } else if (appType === 'device') {
    recommendation = {
      flowId: 'device_flow',
      name: 'Device Authorization Grant',
      rfc: 'RFC 8628',
      badge: 'IoT & CLI',
      badgeType: 'badge-cyan',
      rationale: 'Designed for devices that either lack a web browser or have restricted input capabilities (e.g., Apple TV, smart displays, or headless CLI tools). The user authenticates on a secondary device (e.g., their smartphone or laptop) by entering a user code.',
      oidcNote: null,
      warning: null
    };
  } else if (appType === 'confidential' && hasSecret === 'yes') {
    recommendation = {
      flowId: 'auth_code_secret',
      name: 'Authorization Code Flow (Confidential Server-Side)',
      rfc: 'RFC 6749 §4.1',
      badge: 'Server-to-Server',
      badgeType: 'badge-blue',
      rationale: 'Traditional web applications running on secure servers (Node, Python, Go, Java) can safely store client secrets in environment variables. The server authenticates itself directly to the token endpoint using HTTP Basic Auth or client_secret_post.',
      oidcNote: needIdentity === 'both' ? 'Add `scope=openid profile email` to receive an ID Token identifying the authenticated user session.' : null,
      warning: null
    };
  } else if (appType === 'spa' && hasSecret === 'yes') {
    recommendation = {
      flowId: 'auth_code_pkce',
      name: 'Authorization Code Flow with PKCE',
      rfc: 'RFC 7636 + OAuth 2.0 Security BCP',
      badge: 'Gold Standard',
      badgeType: 'badge-emerald',
      rationale: 'Warning: Browsers cannot keep client secrets safe! Anyone using DevTools or inspecting JavaScript bundles can extract a client secret. You MUST treat SPAs as public clients and use PKCE without embedding secrets.',
      oidcNote: null,
      warning: 'Never store client secrets in Single Page Applications or front-end code bundles!'
    };
  }

  const handleLaunch = () => {
    onSelectFlow(recommendation.flowId);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card decision-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <HelpCircle size={22} color="#38bdf8" />
            <h2 className="modal-title">Flow Decision Wizard: Which Flow Should I Use?</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Answer three quick questions about your architecture, and the wizard will determine the RFC-compliant flow and security requirements for your application.
          </p>

          <div className="wizard-questions-grid">
            {/* Question 1 */}
            <div className="wizard-question-box">
              <label className="wizard-q-label">
                1. What type of client application are you building?
              </label>
              <div className="wizard-options-list">
                <button
                  className={`wizard-opt-btn ${appType === 'spa' ? 'selected' : ''}`}
                  onClick={() => setAppType('spa')}
                >
                  <div>
                    <strong>Single Page App (SPA)</strong>
                    <div className="wizard-opt-sub">React, Vue, Angular, Svelte executing in user's browser</div>
                  </div>
                  {appType === 'spa' && <CheckCircle2 size={16} color="#38bdf8" />}
                </button>

                <button
                  className={`wizard-opt-btn ${appType === 'confidential' ? 'selected' : ''}`}
                  onClick={() => setAppType('confidential')}
                >
                  <div>
                    <strong>Traditional Server Web App</strong>
                    <div className="wizard-opt-sub">Node.js, Next.js, Django, Go, Java running on backend</div>
                  </div>
                  {appType === 'confidential' && <CheckCircle2 size={16} color="#38bdf8" />}
                </button>

                <button
                  className={`wizard-opt-btn ${appType === 'native' ? 'selected' : ''}`}
                  onClick={() => setAppType('native')}
                >
                  <div>
                    <strong>Native Mobile or Desktop App</strong>
                    <div className="wizard-opt-sub">iOS (Swift), Android (Kotlin), Electron, Tauri</div>
                  </div>
                  {appType === 'native' && <CheckCircle2 size={16} color="#38bdf8" />}
                </button>

                <button
                  className={`wizard-opt-btn ${appType === 'm2m' ? 'selected' : ''}`}
                  onClick={() => setAppType('m2m')}
                >
                  <div>
                    <strong>Backend Daemon / Microservice (M2M)</strong>
                    <div className="wizard-opt-sub">Automated service-to-service without end-user interaction</div>
                  </div>
                  {appType === 'm2m' && <CheckCircle2 size={16} color="#38bdf8" />}
                </button>

                <button
                  className={`wizard-opt-btn ${appType === 'device' ? 'selected' : ''}`}
                  onClick={() => setAppType('device')}
                >
                  <div>
                    <strong>Input-Constrained Device / CLI</strong>
                    <div className="wizard-opt-sub">Smart TV, Apple TV, Terminal CLI, or IoT appliance</div>
                  </div>
                  {appType === 'device' && <CheckCircle2 size={16} color="#38bdf8" />}
                </button>
              </div>
            </div>

            {/* Question 2 & 3 Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="wizard-question-box">
                <label className="wizard-q-label">
                  2. Can your client safely protect a client_secret?
                </label>
                <div className="wizard-options-list">
                  <button
                    className={`wizard-opt-btn ${hasSecret === 'no' ? 'selected' : ''}`}
                    onClick={() => setHasSecret('no')}
                  >
                    <div>
                      <strong>No (Public Client)</strong>
                      <div className="wizard-opt-sub">Code is inspectable via DevTools, network, or decompilation</div>
                    </div>
                    {hasSecret === 'no' && <CheckCircle2 size={16} color="#38bdf8" />}
                  </button>

                  <button
                    className={`wizard-opt-btn ${hasSecret === 'yes' ? 'selected' : ''}`}
                    onClick={() => setHasSecret('yes')}
                  >
                    <div>
                      <strong>Yes (Confidential Client)</strong>
                      <div className="wizard-opt-sub">Secret stored in secure server environment variables</div>
                    </div>
                    {hasSecret === 'yes' && <CheckCircle2 size={16} color="#38bdf8" />}
                  </button>
                </div>
              </div>

              <div className="wizard-question-box">
                <label className="wizard-q-label">
                  3. What is your primary objective?
                </label>
                <div className="wizard-options-list">
                  <button
                    className={`wizard-opt-btn ${needIdentity === 'both' ? 'selected' : ''}`}
                    onClick={() => setNeedIdentity('both')}
                  >
                    <div>
                      <strong>User Identity & Login (OpenID Connect)</strong>
                      <div className="wizard-opt-sub">Sign in users, receive ID token + profile, plus API access</div>
                    </div>
                    {needIdentity === 'both' && <CheckCircle2 size={16} color="#38bdf8" />}
                  </button>

                  <button
                    className={`wizard-opt-btn ${needIdentity === 'api' ? 'selected' : ''}`}
                    onClick={() => setNeedIdentity('api')}
                  >
                    <div>
                      <strong>Delegated API Access Only (OAuth 2.0)</strong>
                      <div className="wizard-opt-sub">Request access token to call protected resource servers</div>
                    </div>
                    {needIdentity === 'api' && <CheckCircle2 size={16} color="#38bdf8" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="wizard-result-box">
            <div className="wizard-result-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended RFC Standard Flow
                </span>
              </div>
              <span className={`badge ${recommendation.badgeType}`}>
                {recommendation.badge}
              </span>
            </div>

            <h3 className="wizard-result-title">
              {recommendation.name}
            </h3>

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Standard Reference: <strong>{recommendation.rfc}</strong>
            </div>

            <p style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#cbd5e1', margin: '0.5rem 0' }}>
              {recommendation.rationale}
            </p>

            {recommendation.oidcNote && (
              <div className="wizard-oidc-tip">
                <ShieldCheck size={16} color="#34d399" />
                <span>{recommendation.oidcNote}</span>
              </div>
            )}

            {recommendation.warning && (
              <div className="wizard-warning-box">
                <AlertTriangle size={16} color="#fb7185" />
                <span>{recommendation.warning}</span>
              </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={handleLaunch}>
                Load this Flow in Studio
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
