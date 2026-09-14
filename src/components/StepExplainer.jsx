import React from 'react';
import { 
  Info, 
  Terminal, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Layers
} from 'lucide-react';
import '../styles/explainer.css';

export function StepExplainer({ step }) {
  if (!step) return null;

  const getSecurityIcon = (type) => {
    switch (type) {
      case 'danger': return <ShieldAlert size={18} color="#fda4af" />;
      case 'warning': return <ShieldAlert size={18} color="#fbbf24" />;
      case 'success': return <ShieldCheck size={18} color="#34d399" />;
      default: return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div className="explainer-container">
      <div className="step-card">
        {/* Step Header */}
        <div className="step-header">
          <div className="step-title-group">
            <span className="step-number-tag">
              Protocol Step {step.id}
            </span>
            <h2 className="step-main-title">{step.title}</h2>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="step-summary-box">
          {step.summary}
        </div>

        {/* What Happens At This Step */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">
            <Layers size={17} color="#38bdf8" />
            What Goes On At This Step (Sequence of Events)
          </h3>
          <ul className="what-happens-list">
            {step.whatHappens?.map((item, idx) => (
              <li key={idx} className="what-happens-item">
                <span className="item-bullet">{idx + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Under The Hood Mechanics */}
        {step.underTheHood && (
          <div>
            <h3 className="section-title">
              <Terminal size={17} color="#a78bfa" />
              Under the Hood (Protocol Mechanics)
            </h3>
            <div className="under-the-hood-card">
              <pre className="under-the-hood-text">{step.underTheHood}</pre>
            </div>
          </div>
        )}

        {/* Security Spotlight */}
        {step.securitySpotlight && (
          <div className={`security-spotlight type-${step.securitySpotlight.type || 'info'}`}>
            <div className="spotlight-header">
              {getSecurityIcon(step.securitySpotlight.type)}
              <span>{step.securitySpotlight.title}</span>
            </div>
            <p className="spotlight-desc">
              {step.securitySpotlight.text}
            </p>
          </div>
        )}

        {/* Parameters Breakdown */}
        {step.parameters && step.parameters.length > 0 && (
          <div className="params-section">
            <h3 className="section-title">
              <Key size={17} color="#34d399" />
              Key Parameters Involved in this Message
            </h3>
            <div className="params-grid">
              {step.parameters.map((param, idx) => (
                <div key={idx} className="param-card">
                  <div className="param-top-row">
                    <span className="param-name">{param.name}</span>
                    {param.required && (
                      <span className="param-req-badge">Required</span>
                    )}
                  </div>
                  <div className="param-value-box">
                    {param.value}
                  </div>
                  <p className="param-desc">{param.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
