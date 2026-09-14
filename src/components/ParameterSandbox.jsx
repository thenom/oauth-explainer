import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Play, CheckCircle2, AlertTriangle, Bug, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import '../styles/modals.css';

async function sha256Base64Url(str) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode.apply(null, hashArray));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    // fallback hash representation
    return 'computed_sha256_hash_fallback';
  }
}

export function ParameterSandbox({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('pkce'); // 'pkce' | 'csrf' | 'redirect' | 'nonce'

  // PKCE State
  const initialVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const expectedChallenge = 'E9Melhoa2OwvFrGMTJguCH5rtG6479nvNxxohttN61c';
  const [pkceVerifier, setPkceVerifier] = useState(initialVerifier);
  const [computedChallenge, setComputedChallenge] = useState(expectedChallenge);
  const [pkceResult, setPkceResult] = useState(null);

  // CSRF State
  const initialSessionState = 'xyz_secure_state_84920';
  const sessionState = initialSessionState;
  const [callbackState, setCallbackState] = useState(initialSessionState);
  const [csrfResult, setCsrfResult] = useState(null);

  // Redirect URI State
  const registeredUri = 'https://myapp.com/callback';
  const [redirectInput, setRedirectInput] = useState(registeredUri);
  const [redirectResult, setRedirectResult] = useState(null);

  // Nonce State
  const sessionNonce = 'nonce_session_771920';
  const [tokenNonce, setTokenNonce] = useState(sessionNonce);
  const [nonceResult, setNonceResult] = useState(null);

  // Recompute PKCE challenge when verifier changes
  useEffect(() => {
    let isMounted = true;
    sha256Base64Url(pkceVerifier).then(hash => {
      if (isMounted) setComputedChallenge(hash);
    });
    return () => { isMounted = false; };
  }, [pkceVerifier]);

  if (!isOpen) return null;

  // Run PKCE verification simulation
  const handleVerifyPkce = () => {
    const isMatch = computedChallenge === expectedChallenge;
    if (isMatch) {
      setPkceResult({
        safe: true,
        status: 'HTTP 200 OK — Tokens Issued',
        message: 'Valid Grant: Base64URL(SHA256(code_verifier)) strictly matches stored code_challenge. Authorization code exchanged for tokens.'
      });
    } else {
      setPkceResult({
        safe: false,
        status: 'HTTP 400 Bad Request — Code Interception Blocked',
        message: `invalid_grant: The code_verifier provided generates challenge "${computedChallenge}", which does NOT match the registered code_challenge "${expectedChallenge}". The stolen code was invalidated!`
      });
    }
  };

  // Run CSRF verification simulation
  const handleVerifyCsrf = () => {
    const isMatch = sessionState.trim() === callbackState.trim();
    if (isMatch) {
      setCsrfResult({
        safe: true,
        status: 'State Verified — Safe to Proceed',
        message: `State parameter matches client session storage ("${sessionState}"). Request originated from this browser instance.`
      });
    } else {
      setCsrfResult({
        safe: false,
        status: 'CSRF Attack Detected — Flow Aborted',
        message: `Security Exception: Returned state "${callbackState}" does not match session state "${sessionState}". Attack blocked before any token exchange occurred!`
      });
    }
  };

  // Run Redirect URI verification simulation
  const handleVerifyRedirect = () => {
    const cleanInput = redirectInput.trim();
    const isExactMatch = cleanInput === registeredUri;
    if (isExactMatch) {
      setRedirectResult({
        safe: true,
        status: 'Valid Registered Redirect URI',
        message: `Strict URI match verified: "${cleanInput}" is in the Authorization Server's pre-registered whitelist.`
      });
    } else {
      setRedirectResult({
        safe: false,
        status: 'HTTP 400 Bad Request — Unregistered Callback URI',
        message: `invalid_redirect_uri: "${cleanInput}" does NOT match any registered URIs for client_id. RFC 6749 mandates strict string matching to prevent open redirector credential exfiltration.`
      });
    }
  };

  // Run Nonce verification simulation
  const handleVerifyNonce = () => {
    const isMatch = sessionNonce.trim() === tokenNonce.trim();
    if (isMatch) {
      setNonceResult({
        safe: true,
        status: 'OIDC Nonce Claim Validated',
        message: `The "nonce" claim in the ID Token payload matches session nonce "${sessionNonce}". Token originates from the current user session.`
      });
    } else {
      setNonceResult({
        safe: false,
        status: 'Token Replay Rejected by OIDC Client',
        message: `OIDC Security Error: The ID Token nonce claim ("${tokenNonce}") does not match session nonce ("${sessionNonce}"). Injected or replayed token discarded.`
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card sandbox-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Bug size={22} color="#fda4af" />
            <h2 className="modal-title">Live Security & Attack Simulation Sandbox</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Test protocol defenses against real-world attack vectors. Modify parameters, inject malicious payloads, and observe how cryptographic guarantees and validation rules neutralize attacks.
          </p>

          {/* Sandbox Scenario Tabs */}
          <div className="sandbox-tab-bar">
            <button
              className={`sandbox-tab-btn ${activeTab === 'pkce' ? 'active' : ''}`}
              onClick={() => setActiveTab('pkce')}
            >
              <KeyRound size={14} />
              PKCE Code Interception
            </button>

            <button
              className={`sandbox-tab-btn ${activeTab === 'csrf' ? 'active' : ''}`}
              onClick={() => setActiveTab('csrf')}
            >
              <ShieldAlert size={14} />
              CSRF (State Tampering)
            </button>

            <button
              className={`sandbox-tab-btn ${activeTab === 'redirect' ? 'active' : ''}`}
              onClick={() => setActiveTab('redirect')}
            >
              <AlertTriangle size={14} />
              Open Redirector Hijack
            </button>

            <button
              className={`sandbox-tab-btn ${activeTab === 'nonce' ? 'active' : ''}`}
              onClick={() => setActiveTab('nonce')}
            >
              <ShieldCheck size={14} />
              OIDC Token Replay
            </button>
          </div>

          {/* Tab 1: PKCE Simulator */}
          {activeTab === 'pkce' && (
            <div className="sandbox-experiment-panel">
              <div className="sandbox-scenario-header">
                <div>
                  <h3 className="sandbox-scenario-title">
                    Scenario: Malicious App Intercepts Authorization Code (RFC 7636)
                  </h3>
                  <p className="sandbox-scenario-desc">
                    An attacker's app on a mobile device registers the same custom URI scheme as your app and steals the authorization code from the OS. In traditional OAuth 2.0 without PKCE, the attacker could exchange this code for tokens. With PKCE, the Authorization Server requires the original unhashed <code>code_verifier</code>.
                  </p>
                </div>
              </div>

              <div className="sandbox-inputs-grid">
                <div className="sandbox-field-box">
                  <label className="sandbox-label">
                    Stored <code>code_challenge</code> on Auth Server (Step 1):
                  </label>
                  <input
                    type="text"
                    className="sandbox-input disabled"
                    value={expectedChallenge}
                    readOnly
                  />
                  <span className="sandbox-hint">Derived from Base64URL(SHA-256(legitimate_verifier))</span>
                </div>

                <div className="sandbox-field-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="sandbox-label">
                      <code>code_verifier</code> Sent by Token Requester (Step 4):
                    </label>
                    <button
                      className="sandbox-btn-preset"
                      onClick={() => setPkceVerifier('malicious_interceptor_guess_771')}
                    >
                      Inject Attacker Guess
                    </button>
                  </div>
                  <input
                    type="text"
                    className="sandbox-input"
                    value={pkceVerifier}
                    onChange={(e) => {
                      setPkceVerifier(e.target.value);
                      setPkceResult(null);
                    }}
                  />
                  <span className="sandbox-hint">Edit this value to simulate an attacker trying to guess the verifier</span>
                </div>

                <div className="sandbox-field-box">
                  <label className="sandbox-label">
                    Live Server SHA-256 Hash Computation:
                  </label>
                  <div className="sandbox-computed-hash">
                    Base64URL(SHA256): <strong>{computedChallenge}</strong>
                  </div>
                </div>
              </div>

              <div className="sandbox-action-row">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setPkceVerifier(initialVerifier);
                    setPkceResult(null);
                  }}
                >
                  <RefreshCw size={13} />
                  Restore Legitimate Verifier
                </button>
                <button className="btn-primary" onClick={handleVerifyPkce}>
                  <Play size={14} />
                  Simulate Token Endpoint Verification
                </button>
              </div>

              {pkceResult && (
                <div className={`sandbox-result-card ${pkceResult.safe ? 'result-safe' : 'result-danger'}`}>
                  <div className="result-header">
                    {pkceResult.safe ? <CheckCircle2 size={18} color="#34d399" /> : <ShieldAlert size={18} color="#fda4af" />}
                    <strong>{pkceResult.status}</strong>
                  </div>
                  <p className="result-body">{pkceResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: CSRF State Simulator */}
          {activeTab === 'csrf' && (
            <div className="sandbox-experiment-panel">
              <div className="sandbox-scenario-header">
                <div>
                  <h3 className="sandbox-scenario-title">
                    Scenario: Cross-Site Request Forgery (State Tampering)
                  </h3>
                  <p className="sandbox-scenario-desc">
                    An attacker tricks a victim into visiting an attacker page that submits an authorization callback containing the attacker's authorization code. If the client does not verify that the returned <code>state</code> matches the victim's session, the victim's account is tied to the attacker's resources.
                  </p>
                </div>
              </div>

              <div className="sandbox-inputs-grid">
                <div className="sandbox-field-box">
                  <label className="sandbox-label">Client Session Storage <code>state</code> (Step 1):</label>
                  <input
                    type="text"
                    className="sandbox-input disabled"
                    value={sessionState}
                    readOnly
                  />
                  <span className="sandbox-hint">Cryptographically random state token generated at start of flow</span>
                </div>

                <div className="sandbox-field-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="sandbox-label">Callback URL <code>?state=</code> (Step 3):</label>
                    <button
                      className="sandbox-btn-preset"
                      onClick={() => setCallbackState('attacker_csrf_injection_999')}
                    >
                      Inject Tampered State
                    </button>
                  </div>
                  <input
                    type="text"
                    className="sandbox-input"
                    value={callbackState}
                    onChange={(e) => {
                      setCallbackState(e.target.value);
                      setCsrfResult(null);
                    }}
                  />
                  <span className="sandbox-hint">Modify or tamper with this returned query parameter</span>
                </div>
              </div>

              <div className="sandbox-action-row">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setCallbackState(sessionState);
                    setCsrfResult(null);
                  }}
                >
                  <RefreshCw size={13} />
                  Restore Matching State
                </button>
                <button className="btn-primary" onClick={handleVerifyCsrf}>
                  <Play size={14} />
                  Simulate Client Callback Validation
                </button>
              </div>

              {csrfResult && (
                <div className={`sandbox-result-card ${csrfResult.safe ? 'result-safe' : 'result-danger'}`}>
                  <div className="result-header">
                    {csrfResult.safe ? <CheckCircle2 size={18} color="#34d399" /> : <ShieldAlert size={18} color="#fda4af" />}
                    <strong>{csrfResult.status}</strong>
                  </div>
                  <p className="result-body">{csrfResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Redirect URI Tampering */}
          {activeTab === 'redirect' && (
            <div className="sandbox-experiment-panel">
              <div className="sandbox-scenario-header">
                <div>
                  <h3 className="sandbox-scenario-title">
                    Scenario: Open Redirector & Callback Tampering
                  </h3>
                  <p className="sandbox-scenario-desc">
                    An attacker modifies the <code>redirect_uri</code> parameter in the initial authorization link to point to an attacker-controlled endpoint (e.g. <code>https://evil-attacker.com/steal</code>) to intercept the authorization code.
                  </p>
                </div>
              </div>

              <div className="sandbox-inputs-grid">
                <div className="sandbox-field-box">
                  <label className="sandbox-label">Pre-Registered Callback Whitelist on IdP:</label>
                  <input
                    type="text"
                    className="sandbox-input disabled"
                    value={registeredUri}
                    readOnly
                  />
                </div>

                <div className="sandbox-field-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="sandbox-label">Requested <code>redirect_uri</code> Parameter:</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="sandbox-btn-preset"
                        onClick={() => setRedirectInput('https://evil-hacker.com/callback')}
                      >
                        Evil Domain
                      </button>
                      <button
                        className="sandbox-btn-preset"
                        onClick={() => setRedirectInput('http://myapp.com/callback')}
                      >
                        Insecure HTTP
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="sandbox-input"
                    value={redirectInput}
                    onChange={(e) => {
                      setRedirectInput(e.target.value);
                      setRedirectResult(null);
                    }}
                  />
                  <span className="sandbox-hint">RFC 6749 requires exact string comparison</span>
                </div>
              </div>

              <div className="sandbox-action-row">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setRedirectInput(registeredUri);
                    setRedirectResult(null);
                  }}
                >
                  <RefreshCw size={13} />
                  Restore Registered URI
                </button>
                <button className="btn-primary" onClick={handleVerifyRedirect}>
                  <Play size={14} />
                  Simulate Auth Server Whitelist Check
                </button>
              </div>

              {redirectResult && (
                <div className={`sandbox-result-card ${redirectResult.safe ? 'result-safe' : 'result-danger'}`}>
                  <div className="result-header">
                    {redirectResult.safe ? <CheckCircle2 size={18} color="#34d399" /> : <ShieldAlert size={18} color="#fda4af" />}
                    <strong>{redirectResult.status}</strong>
                  </div>
                  <p className="result-body">{redirectResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: OIDC Nonce Simulator */}
          {activeTab === 'nonce' && (
            <div className="sandbox-experiment-panel">
              <div className="sandbox-scenario-header">
                <div>
                  <h3 className="sandbox-scenario-title">
                    Scenario: Token Replay & Injection Defense (OIDC Nonce)
                  </h3>
                  <p className="sandbox-scenario-desc">
                    An attacker intercepts an ID Token belonging to another user from a previous session or application and attempts to inject it into the victim's session to authenticate as them. The OIDC <code>nonce</code> claim binds the token to the specific authentication request.
                  </p>
                </div>
              </div>

              <div className="sandbox-inputs-grid">
                <div className="sandbox-field-box">
                  <label className="sandbox-label">Client Session Nonce (Step 1):</label>
                  <input
                    type="text"
                    className="sandbox-input disabled"
                    value={sessionNonce}
                    readOnly
                  />
                </div>

                <div className="sandbox-field-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="sandbox-label">ID Token Claim: <code>"nonce"</code></label>
                    <button
                      className="sandbox-btn-preset"
                      onClick={() => setTokenNonce('replayed_stolen_token_nonce_481')}
                    >
                      Inject Stolen Token Nonce
                    </button>
                  </div>
                  <input
                    type="text"
                    className="sandbox-input"
                    value={tokenNonce}
                    onChange={(e) => {
                      setTokenNonce(e.target.value);
                      setNonceResult(null);
                    }}
                  />
                </div>
              </div>

              <div className="sandbox-action-row">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setTokenNonce(sessionNonce);
                    setNonceResult(null);
                  }}
                >
                  <RefreshCw size={13} />
                  Restore Matching Nonce
                </button>
                <button className="btn-primary" onClick={handleVerifyNonce}>
                  <Play size={14} />
                  Simulate OIDC Nonce Verification
                </button>
              </div>

              {nonceResult && (
                <div className={`sandbox-result-card ${nonceResult.safe ? 'result-safe' : 'result-danger'}`}>
                  <div className="result-header">
                    {nonceResult.safe ? <CheckCircle2 size={18} color="#34d399" /> : <ShieldAlert size={18} color="#fda4af" />}
                    <strong>{nonceResult.status}</strong>
                  </div>
                  <p className="result-body">{nonceResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
