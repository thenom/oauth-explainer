import React, { useState } from 'react';
import { X, ShieldAlert, Play, CheckCircle2, AlertTriangle, Bug } from 'lucide-react';
import '../styles/modals.css';

export function ParameterSandbox({ isOpen, onClose }) {
  const [activeSimulation, setActiveSimulation] = useState(null);

  if (!isOpen) return null;

  const simulations = [
    {
      id: 'csrf_tamper',
      title: 'Simulate CSRF Attack (State Parameter Tampering)',
      threat: 'Cross-Site Request Forgery',
      rfcRef: 'RFC 6749 §10.12',
      desc: 'An attacker attempts to complete an authorization flow using a victim\'s browser session by injecting a stolen or forged authorization code.',
      tamperAction: 'Modify returned ?state= parameter so it no longer matches the client\'s sessionStorage value.',
      payloadBefore: 'Stored Session State: "xyz_9847129482"\nCallback Received: ?state=xyz_9847129482',
      payloadAfter: 'Stored Session State: "xyz_9847129482"\nTampered Callback: ?state=ATTACKER_INJECTED_CSRF_771',
      response: {
        safe: false,
        status: 'Blocked by Client Application',
        message: 'Security Violation: State parameter mismatch! Expected "xyz_9847129482" but received "ATTACKER_INJECTED_CSRF_771". Flow aborted immediately. No token exchange performed.'
      }
    },
    {
      id: 'pkce_tamper',
      title: 'Simulate Code Interception (PKCE Challenge Mismatch)',
      threat: 'Authorization Code Interception (RFC 7636)',
      rfcRef: 'RFC 7636 §4.6',
      desc: 'A malicious application installed on the user\'s mobile OS intercepts the custom URI scheme callback and steals the authorization code.',
      tamperAction: 'Attacker attempts to exchange the stolen code without possessing the original code_verifier secret.',
      payloadBefore: 'Client Verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"\nSHA256 Hash matches stored Challenge: "E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c"',
      payloadAfter: 'Attacker Verifier: "attacker_guess_9999"\nServer computes: SHA256("attacker_guess_9999") = "41f8... != E9Mel..."',
      response: {
        safe: false,
        status: 'HTTP 400 Bad Request',
        message: '{"error": "invalid_grant", "error_description": "PKCE verification failed: Computed challenge does not match registered challenge. Code invalidated."}'
      }
    },
    {
      id: 'redirect_tamper',
      title: 'Simulate Redirect URI Hijacking (Open Redirector)',
      threat: 'Credential & Code Exfiltration',
      rfcRef: 'RFC 6749 §10.6',
      desc: 'An attacker modifies the redirect_uri in Step 1 to point to an attacker-controlled server (e.g. https://evil.com/leak).',
      tamperAction: 'Change redirect_uri parameter to an unregistered domain.',
      payloadBefore: 'GET /authorize?client_id=my-web-app&redirect_uri=https://myapp.com/callback',
      payloadAfter: 'GET /authorize?client_id=my-web-app&redirect_uri=https://evil-attacker.com/leak',
      response: {
        safe: false,
        status: 'HTTP 400 Bad Request (Blocked by Auth Server)',
        message: '{"error": "invalid_redirect_uri", "error_description": "The redirect_uri provided does not match any registered callback URIs for client_id my-web-app."}'
      }
    },
    {
      id: 'token_replay',
      title: 'Simulate Token Replay Attack (OIDC Nonce Guard)',
      threat: 'ID Token Injection / Replay Attack',
      rfcRef: 'OIDC Core §3.1.3.7',
      desc: 'An attacker intercepts an ID Token and attempts to inject it into a separate browser session to authenticate as the victim.',
      tamperAction: 'Inject ID Token containing a different nonce than what this client session initialized.',
      payloadBefore: 'Client Session Nonce: "nonce_abc123"\nID Token Claim: "nonce": "nonce_abc123"',
      payloadAfter: 'Client Session Nonce: "nonce_abc123"\nInjected ID Token Claim: "nonce": "nonce_REPLAYED_stolen_token"',
      response: {
        safe: false,
        status: 'Rejected by Client OpenID Validator',
        message: 'OIDC Validation Failed: Nonce claim "nonce_REPLAYED_stolen_token" does not match session nonce "nonce_abc123". ID Token discarded.'
      }
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Bug size={22} color="#fda4af" />
            <h2 className="modal-title">Security & Attack Simulation Sandbox</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Experience how modern OAuth 2.0 and OIDC defense mechanisms (such as <strong>PKCE</strong>, the <strong>state</strong> parameter, and strict <strong>redirect_uri</strong> matching) defend against real-world web vulnerabilities.
          </p>

          <div className="simulation-list">
            {simulations.map((sim) => {
              const isSelected = activeSimulation?.id === sim.id;

              return (
                <div key={sim.id} className="simulation-card">
                  <div className="simulation-card-top">
                    <div className="sim-title">
                      <ShieldAlert size={17} color="#fda4af" />
                      {sim.title}
                    </div>
                    <button
                      className="sim-btn-run"
                      onClick={() => setActiveSimulation(isSelected ? null : sim)}
                    >
                      <Play size={13} />
                      {isSelected ? 'Reset Attack' : 'Simulate Attack'}
                    </button>
                  </div>

                  <p className="sim-desc">{sim.desc}</p>
                  
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    <strong>Tamper Action:</strong> {sim.tamperAction}
                  </div>

                  {isSelected && (
                    <div style={{ display: 'flex', flexdirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
                      <div className="code-block-card">
                        <div className="code-block-title" style={{ color: '#fda4af' }}>
                          Tampered Payload Comparison
                        </div>
                        <pre className="code-pre" style={{ color: '#fca5a5' }}>
                          {sim.payloadAfter}
                        </pre>
                      </div>

                      <div className="sim-result-box">
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                          🛡️ Defensive Response: {sim.response.status}
                        </div>
                        <div>{sim.response.message}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
