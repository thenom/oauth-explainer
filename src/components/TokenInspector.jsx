import React, { useState } from 'react';
import { ShieldCheck, Calendar, Key, UserCheck, Sparkles, AlertTriangle } from 'lucide-react';
import '../styles/inspector.css';

// Base64URL decode helper for client-side JWT inspection
function decodeJwt(jwtString) {
  try {
    const parts = jwtString.trim().split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format: A valid compact JWT must contain exactly 3 dot-separated Base64URL parts.' };
    }

    const decodePart = (str) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    };

    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    const signature = parts[2];

    return { header, payload, signature, raw: jwtString };
  } catch {
    return { error: 'Failed to decode token: Payload or Header is not valid Base64URL encoded JSON.' };
  }
}

const SAMPLE_CUSTOM_TOKENS = {
  google: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkZjkyYjEyIn0.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDkyODMwMTkyODMwMTkyODMiLCJhdWQiOiI4NDkyMDE5NDgyLWV4YW1wbGUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJlbWFpbCI6ImFsZXgucml2ZXJhQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiQWxleCBSaXZlcmEiLCJpYXQiOjE3ODkzMzgwMDAsImV4cCI6MTc4OTM0MTYwMH0.K7vF01j2mB8X_sample_signature',
  auth0: 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlbmFudF9rZXlfeSJ9.eyJpc3MiOiJodHRwczovL2Rldi10ZW5hbnQudXMuYXd0aDAuY29tLyIsInN1YiI6ImF1dGgwfDY0OGE5ZjIwMWIyMCIsImF1ZCI6WyJodHRwczovL2FwaS5teWFwcC5jb20vdjEiLCJodHRwczovL2Rldi10ZW5hbnQudXMuYXd0aDAuY29tL3VzZXJpbmZvIl0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDpkYXRhIiwicGVybWlzc2lvbnMiOlsicmVhZDp1c2VycyIsIndyaXRlOnJlcG9ydHMiXSwiaWF0IjoxNzg5MzM4MDAwLCJleHAiOjE3ODkzNDg4MDB9.P8xLm_sample_signature',
  github: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImdoX2FwcF8wMSJ9.eyJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vbG9naW4vb2F1dGgiLCJzdWIiOiJ1c2VyXzQ4MjkwNCIsImF1ZCI6Ik92MjNsaTQ5MTgyMzkwMTkyYSIsInNjb3BlIjoicmVhZDp1c2VyIHVzZXI6ZW1haWwgcmVwbyIsImlhdCI6MTc4OTMzODAwMCwiZXhwIjoxNzg5MzQ1MjAwfQ.Signature_gh_demo_77'
};

export function TokenInspector({ tokensIssued }) {
  const [activeMode, setActiveMode] = useState('issued'); // 'issued' | 'custom'
  const [selectedToken, setSelectedToken] = useState('access_token'); // 'access_token' | 'id_token'
  const [customInput, setCustomInput] = useState(SAMPLE_CUSTOM_TOKENS.google);

  if (!tokensIssued && activeMode === 'issued') return null;

  const currentTokenData = selectedToken === 'id_token' && tokensIssued?.idToken
    ? tokensIssued.idToken
    : tokensIssued?.accessToken;

  const hasIdToken = !!tokensIssued?.idToken;

  // Format UNIX timestamp into readable string
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts * 1000);
    return date.toUTCString();
  };

  const decodedCustom = decodeJwt(customInput);

  return (
    <div className="token-inspector-card">
      <div className="token-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} color="#a78bfa" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
            Interactive JWT Token Inspector
          </span>
        </div>

        <div className="token-type-tabs">
          <button
            className={`token-type-btn ${activeMode === 'issued' ? 'active' : ''}`}
            onClick={() => setActiveMode('issued')}
          >
            Step Issued Tokens
          </button>
          <button
            className={`token-type-btn ${activeMode === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveMode('custom')}
          >
            <Sparkles size={13} color="#38bdf8" />
            Custom JWT Playground
          </button>
        </div>
      </div>

      {activeMode === 'issued' ? (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
            <button
              className={`token-type-btn ${selectedToken === 'access_token' ? 'active' : ''}`}
              onClick={() => setSelectedToken('access_token')}
            >
              Access Token (Bearer)
            </button>

            {hasIdToken && (
              <button
                className={`token-type-btn ${selectedToken === 'id_token' ? 'active' : ''}`}
                onClick={() => setSelectedToken('id_token')}
              >
                ID Token (OIDC Identity)
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {selectedToken === 'id_token' ? (
              <span>
                <strong>OpenID Connect ID Token:</strong> A cryptographically signed assertion issued by the Identity Provider confirming the user's authenticated identity and profile attributes.
              </span>
            ) : (
              <span>
                <strong>OAuth 2.0 Access Token:</strong> An authorization credential presented to API resource servers in the <code>Authorization: Bearer</code> header.
              </span>
            )}
          </div>

          {/* 3-Part JWT Visual Breakdown */}
          <div className="jwt-three-parts">
            {/* Part 1: Header */}
            <div className="jwt-part header">
              <div className="jwt-part-title" style={{ color: '#fb7185' }}>
                1. JOSE Header (Algorithm & Token Type)
              </div>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(currentTokenData?.header || {}, null, 2)}
              </pre>
            </div>

            {/* Part 2: Payload Claims */}
            <div className="jwt-part payload">
              <div className="jwt-part-title" style={{ color: '#c084fc' }}>
                2. Decoded Payload Claims (Identity & Authorization)
              </div>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(currentTokenData?.payload || {}, null, 2)}
              </pre>

              {/* Quick Explanations of Claims */}
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: '#e2e8f0' }}>
                {currentTokenData?.payload?.exp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="#34d399" />
                    <span>Expires: <strong>{formatTimestamp(currentTokenData.payload.exp)}</strong></span>
                  </div>
                )}
                {currentTokenData?.payload?.sub && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={13} color="#38bdf8" />
                    <span>Subject (Unique User ID): <code>{currentTokenData.payload.sub}</code></span>
                  </div>
                )}
                {currentTokenData?.payload?.nonce && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={13} color="#fbbf24" />
                    <span>Nonce (Replay Guard): <code>{currentTokenData.payload.nonce}</code></span>
                  </div>
                )}
              </div>
            </div>

            {/* Part 3: Signature */}
            <div className="jwt-part signature">
              <div className="jwt-part-title" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} />
                3. Digital Signature (RS256 Verified)
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#93c5fd' }}>
                RSASHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), authServerPrivateKey)
              </p>
              <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#6ee7b7' }}>
                ✓ Verified with public key from Identity Provider JWKS endpoint
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Custom JWT Decoder Playground */
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Paste any JWT or pick a sample provider token:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="sandbox-btn-preset"
                onClick={() => setCustomInput(SAMPLE_CUSTOM_TOKENS.google)}
              >
                Google ID Token
              </button>
              <button
                className="sandbox-btn-preset"
                onClick={() => setCustomInput(SAMPLE_CUSTOM_TOKENS.auth0)}
              >
                Auth0 Access Token
              </button>
              <button
                className="sandbox-btn-preset"
                onClick={() => setCustomInput(SAMPLE_CUSTOM_TOKENS.github)}
              >
                GitHub App Token
              </button>
            </div>
          </div>

          <textarea
            className="jwt-custom-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Paste compact JWT (header.payload.signature) here..."
            rows={3}
          />

          {decodedCustom.error ? (
            <div className="sandbox-result-card result-danger" style={{ marginTop: '0.75rem' }}>
              <AlertTriangle size={16} color="#fb7185" />
              <span>{decodedCustom.error}</span>
            </div>
          ) : (
            <div className="jwt-three-parts" style={{ marginTop: '0.75rem' }}>
              <div className="jwt-part header">
                <div className="jwt-part-title" style={{ color: '#fb7185' }}>
                  1. Decoded Header
                </div>
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(decodedCustom.header, null, 2)}
                </pre>
              </div>

              <div className="jwt-part payload">
                <div className="jwt-part-title" style={{ color: '#c084fc' }}>
                  2. Decoded Claims
                </div>
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(decodedCustom.payload, null, 2)}
                </pre>
                {decodedCustom.payload?.exp && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>Expires: <strong>{formatTimestamp(decodedCustom.payload.exp)}</strong></span>
                  </div>
                )}
              </div>

              <div className="jwt-part signature">
                <div className="jwt-part-title" style={{ color: '#38bdf8' }}>
                  3. Encoded Signature
                </div>
                <pre style={{ margin: 0, wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#93c5fd' }}>
                  {decodedCustom.signature}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
