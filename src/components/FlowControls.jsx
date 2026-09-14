import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Globe, Lock } from 'lucide-react';
import '../styles/controls.css';

export function FlowControls({
  flow,
  currentStepIndex,
  onStepChange,
  isAutoPlaying,
  onToggleAutoPlay,
  playbackSpeed,
  onChangeSpeed
}) {
  const steps = flow.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="flow-controls-bar">
      {/* Step Stepper Pills */}
      <div className="timeline-track-container">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              className={`step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepChange(idx)}
              title={step.title}
            >
              <span className="step-pill-number">
                {idx + 1}
              </span>
              <span>{step.shortTitle || step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Control Buttons and Channel Indicator */}
      <div className="controls-sub-bar">
        <div className="playback-buttons">
          <button
            className="btn-ctrl"
            disabled={isFirstStep}
            onClick={() => onStepChange(currentStepIndex - 1)}
            title="Go to previous step"
          >
            <ChevronLeft size={16} />
            Previous Step
          </button>

          <button
            className={`btn-ctrl btn-primary ${isLastStep ? '' : ''}`}
            disabled={isLastStep}
            onClick={() => onStepChange(currentStepIndex + 1)}
            title={isLastStep ? 'Flow Completed' : 'Proceed to next step'}
          >
            {isLastStep ? 'Completed' : 'Next Step'}
            <ChevronRight size={16} />
          </button>

          <button
            className={`btn-ctrl btn-autoplay ${isAutoPlaying ? 'active' : ''}`}
            onClick={onToggleAutoPlay}
            title={isAutoPlaying ? 'Pause automatic flow playback' : 'Automatically play through steps'}
          >
            {isAutoPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isAutoPlaying ? 'Pause' : 'Auto Play'}
          </button>

          <div className="speed-selector" title="Playback speed">
            <button
              className={`speed-btn ${playbackSpeed === 0.5 ? 'active' : ''}`}
              onClick={() => onChangeSpeed(0.5)}
            >
              0.5x
            </button>
            <button
              className={`speed-btn ${playbackSpeed === 1 ? 'active' : ''}`}
              onClick={() => onChangeSpeed(1)}
            >
              1x
            </button>
            <button
              className={`speed-btn ${playbackSpeed === 2 ? 'active' : ''}`}
              onClick={() => onChangeSpeed(2)}
            >
              2x
            </button>
          </div>
        </div>

        <div className="flow-meta-badge">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>•</span>
          {currentStep?.channel === 'front-channel' ? (
            <span className="channel-indicator front-channel" title="Front-channel: travels through the user browser / URL bar">
              <Globe size={13} />
              Front-Channel (Browser / URL)
            </span>
          ) : (
            <span className="channel-indicator back-channel" title="Back-channel: secure direct HTTPS connection between servers">
              <Lock size={13} />
              Back-Channel (Direct HTTPS)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
