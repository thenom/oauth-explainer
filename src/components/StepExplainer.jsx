import React, { useState } from 'react';
import { 
  Info, 
  Terminal, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Layers,
  Sparkles,
  Car,
  EyeOff
} from 'lucide-react';
import '../styles/explainer.css';

// Plain English mapping for non-technical users
function getPlainEnglishStory(step) {
  const stepId = step?.id;

  switch (stepId) {
    case 1:
      return {
        concept: 'The Request & The Secret Lockbox (PKCE)',
        story: 'You click "Connect Account" in the app. The app creates a secret one-time lockbox (PKCE challenge) and sends your browser over to the official login provider.',
        valetAnalogy: 'Before handing over your car, you put a unique tamper-proof stamp on your claim ticket stub. Only someone with your original stamp will be able to claim the car keys later.',
        safetyNote: 'Your password is never entered here. The app is redirecting you directly to the official provider domain.'
      };
    case 2:
      return {
        concept: 'Logging in on the Official Service (Isolated from the App)',
        story: 'Your browser loads the provider\'s official login page (e.g. accounts.google.com). You log in directly with your credentials, two-factor authentication, or passkey.',
        valetAnalogy: 'You walk directly to the hotel front desk manager behind the security glass. The valet attendant remains outside and cannot hear or see your conversation.',
        safetyNote: 'The third-party application cannot see your password, keystrokes, or screen. All authentication happens strictly between you and the identity provider.'
      };
    case 3:
      return {
        concept: 'The Permission & Consent Prompt',
        story: 'The provider asks you: "Do you allow this application to read your photos and basic profile?" You review the requested permissions and click Allow.',
        valetAnalogy: 'The front desk manager asks you: "Do you authorize the valet to park your car in Lot B between 1 PM and 3 PM?" You give your explicit consent.',
        safetyNote: 'You are in total control. You can reject the request, and the app never gets any permissions you didn\'t explicitly approve.'
      };
    case 4:
      return {
        concept: 'The Claim Ticket (Authorization Code Hand-off)',
        story: 'The provider sends your browser back to the application carrying a temporary one-time claim ticket (the Authorization Code), valid for only 30–60 seconds.',
        valetAnalogy: 'The front desk gives you a temporary claim ticket. Even if someone peeks over your shoulder and copies the number, they cannot use it without your secret stamp from Step 1.',
        safetyNote: 'This is not your real token yet—it is just a short-lived temporary ticket that can only be redeemed once.'
      };
    case 5:
      return {
        concept: 'The Digital Valet Key (Access & ID Tokens Issued)',
        story: 'The application talks directly to the provider behind the scenes and trades the claim ticket for an Access Token (the valet key) and an ID Token (your verified badge).',
        valetAnalogy: 'The valet exchanges the ticket for the actual electronic valet keycard and your guest badge. The keycard only unlocks the engine, never the glove compartment or trunk.',
        safetyNote: 'Tokens are issued over direct, encrypted server connections (back-channel), so they are never leaked in your browser URL bar or history.'
      };
    case 6:
    default:
      return {
        concept: 'Opening the Vault Door (Accessing the Protected API)',
        story: 'The application presents the Access Token to the API vault. The vault checks that the keycard is valid, unexpired, and has permission to read your data.',
        valetAnalogy: 'The valet taps the electronic keycard on the parking gate. The sensor verifies the keycard and opens the gate.',
        safetyNote: 'If the app tries to do anything you didn\'t approve (like deleting files or reading emails), the vault rejects it immediately.'
      };
  }
}

export function StepExplainer({ step }) {
  const [isPlainEnglish, setIsPlainEnglish] = useState(false);

  if (!step) return null;

  const plainStory = getPlainEnglishStory(step);

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

          <button
            className={`btn-mode-toggle ${isPlainEnglish ? 'active' : ''}`}
            onClick={() => setIsPlainEnglish(prev => !prev)}
            title="Toggle between Technical Protocol Spec and Plain-English Everyday Story"
          >
            <Sparkles size={14} color={isPlainEnglish ? '#fbbf24' : '#38bdf8'} />
            {isPlainEnglish ? 'Technical Spec' : 'Plain English Story'}
          </button>
        </div>

        {/* Executive Summary */}
        <div className="step-summary-box">
          {step.summary}
        </div>

        {isPlainEnglish ? (
          /* Plain English / Everyday Analogy Mode */
          <div className="plain-english-panel">
            <div className="plain-story-card">
              <div className="plain-story-header">
                <Sparkles size={18} color="#38bdf8" />
                <h3 className="plain-story-title">{plainStory.concept}</h3>
              </div>
              <p className="plain-story-text">
                {plainStory.story}
              </p>
            </div>

            <div className="plain-analogy-box">
              <div className="plain-analogy-title">
                <Car size={18} color="#fbbf24" />
                <span>The Valet Key Analogy</span>
              </div>
              <p className="plain-analogy-text">
                {plainStory.valetAnalogy}
              </p>
            </div>

            <div className="plain-safety-box">
              <div className="plain-safety-title">
                <EyeOff size={18} color="#34d399" />
                <span>Why Your Password & Data Are Safe</span>
              </div>
              <p className="plain-safety-text">
                {plainStory.safetyNote}
              </p>
            </div>
          </div>
        ) : (
          /* Technical Mode */
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
