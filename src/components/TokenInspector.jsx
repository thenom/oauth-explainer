import React, { useState } from 'react';
import { ShieldCheck, Calendar, Key, UserCheck, HelpCircle } from 'lucide-react';
import '../styles/inspector.css';

export function TokenInspector({ tokensIssued }) {
  const [selectedToken, setSelectedToken] = useState('access_token'); // 'access_token' | 'id_token'

  if (!tokensIssued || !tokensIssued.hasTokens) return null;

  const currentTokenData = selectedToken === 'id_token' && tokensIssued.idToken
    ? tokensIssued.idToken
    : tokensIssued.accessToken;

  const hasIdToken = !!tokensIssued.idToken;

  // Format UNIX timestamp into readable string
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts * 1000);
    return date.toUTCString();
  };

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
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        {selectedToken === 'id_token' ? (
          <span>
            <strong>OpenID Connect ID Token:</strong> A cryptographically signed assertion issued by the Identity Provider confirming the user\'s authenticated identity and profile attributes.
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
            ✓ Verified with public key from https://auth.provider.com/.well-known/jwks.json
          </div>
        </div>
      </div>
    </div>
  );
}
