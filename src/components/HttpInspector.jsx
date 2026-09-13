import React, { useState } from 'react';
import { 
  Code, 
  Send, 
  CornerDownRight, 
  Terminal, 
  Copy, 
  Check, 
  KeyRound,
  FileCode
} from 'lucide-react';
import { TokenInspector } from './TokenInspector.jsx';
import '../styles/inspector.css';

export function HttpInspector({ step }) {
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'response' | 'curl' | 'tokens'
  const [copied, setCopied] = useState(false);

  if (!step) return null;

  const req = step.httpRequest;
  const res = step.httpResponse;
  const hasTokens = !!step.tokensIssued?.hasTokens;

  // Generate cURL command from httpRequest
  const generateCurl = () => {
    if (!req) return '# No direct HTTP request for this step';
    let cmd = `curl -X ${req.method} "${req.url}"`;
    if (req.headers) {
      Object.entries(req.headers).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
    }
    if (req.body) {
      cmd += ` \\\n  --data "${req.body}"`;
    }
    return cmd;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusClass = res ? `s-${res.status}` : '';

  return (
    <div className="inspector-container">
      <div className="inspector-header">
        <div className="inspector-tabs">
          <button
            className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            <Send size={14} />
            HTTP Request
          </button>

          <button
            className={`tab-btn ${activeTab === 'response' ? 'active' : ''}`}
            onClick={() => setActiveTab('response')}
          >
            <CornerDownRight size={14} />
            HTTP Response {res ? `(${res.status})` : ''}
          </button>

          <button
            className={`tab-btn ${activeTab === 'curl' ? 'active' : ''}`}
            onClick={() => setActiveTab('curl')}
          >
            <Terminal size={14} />
            cURL Snippet
          </button>

          {hasTokens && (
            <button
              className={`tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
              onClick={() => setActiveTab('tokens')}
              style={{ color: '#c4b5fd', borderColor: 'rgba(167,139,250,0.3)' }}
            >
              <KeyRound size={14} color="#a78bfa" />
              Decoded Tokens (JWT)
            </button>
          )}
        </div>

        <div>
          {activeTab === 'curl' && (
            <button
              className="btn-copy"
              onClick={() => handleCopy(generateCurl())}
            >
              {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy cURL'}
            </button>
          )}

          {activeTab === 'request' && req?.url && (
            <button
              className="btn-copy"
              onClick={() => handleCopy(req.url)}
            >
              {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          )}

          {activeTab === 'response' && res?.body && (
            <button
              className="btn-copy"
              onClick={() => handleCopy(res.body)}
            >
              {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Body'}
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: HTTP Request */}
      {activeTab === 'request' && req && (
        <div className="http-panel">
          <div className="http-request-line">
            <span className={`http-method ${req.method}`}>{req.method}</span>
            <span className="http-url">{req.url}</span>
          </div>

          {req.headers && Object.keys(req.headers).length > 0 && (
            <div className="code-block-card">
              <div className="code-block-title">Request Headers</div>
              <pre className="code-pre">
                {Object.entries(req.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')}
              </pre>
            </div>
          )}

          {req.body && (
            <div className="code-block-card">
              <div className="code-block-title">Request Body</div>
              <pre className="code-pre">{req.body}</pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: HTTP Response */}
      {activeTab === 'response' && res && (
        <div className="http-panel">
          <div className="http-request-line">
            <span className={`http-status ${statusClass}`}>
              HTTP/1.1 {res.status} {res.statusText}
            </span>
          </div>

          {res.headers && Object.keys(res.headers).length > 0 && (
            <div className="code-block-card">
              <div className="code-block-title">Response Headers</div>
              <pre className="code-pre">
                {Object.entries(res.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')}
              </pre>
            </div>
          )}

          {res.body && (
            <div className="code-block-card">
              <div className="code-block-title">Response Body</div>
              <pre className="code-pre">{res.body}</pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: cURL */}
      {activeTab === 'curl' && (
        <div className="code-block-card">
          <div className="code-block-title">Terminal Equivalent (cURL)</div>
          <pre className="code-pre curl-pre">{generateCurl()}</pre>
        </div>
      )}

      {/* Tab 4: Tokens (JWT Inspector) */}
      {activeTab === 'tokens' && hasTokens && (
        <TokenInspector tokensIssued={step.tokensIssued} />
      )}
    </div>
  );
}
