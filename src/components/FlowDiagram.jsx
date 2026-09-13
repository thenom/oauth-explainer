import React, { useMemo } from 'react';
import { 
  User, 
  Laptop, 
  ShieldCheck, 
  Server, 
  Tv, 
  Smartphone, 
  Database, 
  AlertTriangle,
  ArrowRight,
  Send,
  Radio,
  Lock,
  Globe
} from 'lucide-react';
import '../styles/diagram.css';

const ICON_MAP = {
  User: User,
  Laptop: Laptop,
  ShieldCheck: ShieldCheck,
  Server: Server,
  Tv: Tv,
  Smartphone: Smartphone,
  Database: Database,
  AlertTriangle: AlertTriangle
};

export function FlowDiagram({ flow, currentStepIndex }) {
  const currentStep = flow.steps[currentStepIndex] || flow.steps[0];
  const actors = flow.actors || [];

  const senderActor = actors.find(a => a.id === currentStep.sender) || actors[0];
  const receiverActor = actors.find(a => a.id === currentStep.receiver) || actors[1];

  const senderIndex = actors.findIndex(a => a.id === currentStep.sender);
  const receiverIndex = actors.findIndex(a => a.id === currentStep.receiver);

  // Calculate coordinates for SVG packet animation
  // Each actor occupies a slot in the 4-column grid (or N-column grid)
  const actorCount = actors.length;
  const startPercent = ((senderIndex + 0.5) / actorCount) * 100;
  const endPercent = ((receiverIndex + 0.5) / actorCount) * 100;

  return (
    <div className="diagram-container">
      <div className="diagram-header">
        <div className="diagram-title-wrap">
          <Radio size={18} color="#38bdf8" />
          <h2 className="diagram-title">Interactive Multi-Actor Process Flow</h2>
          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
            {flow.name}
          </span>
        </div>

        <div className="channel-tag-banner">
          {currentStep.channel === 'front-channel' ? (
            <span className="badge badge-amber">
              <Globe size={12} />
              Front-Channel (Visible in Browser URL)
            </span>
          ) : (
            <span className="badge badge-emerald">
              <Lock size={12} />
              Back-Channel (Encrypted Server-to-Server)
            </span>
          )}
        </div>
      </div>

      {/* Actors Grid */}
      <div 
        className="actors-grid"
        style={{ gridTemplateColumns: `repeat(${actors.length}, 1fr)` }}
      >
        {actors.map((actor) => {
          const isSender = actor.id === currentStep.sender;
          const isReceiver = actor.id === currentStep.receiver;
          const isIdle = !isSender && !isReceiver;
          const IconComponent = ICON_MAP[actor.icon] || Server;

          let statusText = 'Listening';
          if (isSender) statusText = 'Transmitting';
          if (isReceiver) statusText = 'Receiving / Processing';

          return (
            <div
              key={actor.id}
              className={`actor-card ${isSender ? 'is-sender' : ''} ${isReceiver ? 'is-receiver' : ''} ${isIdle ? 'is-idle' : ''}`}
              style={{
                '--actor-color': actor.color,
                '--actor-color-bg': `${actor.color}20`
              }}
            >
              <div className="actor-icon-box">
                <IconComponent size={26} />
              </div>
              <div>
                <div className="actor-name">{actor.name}</div>
                <div className="actor-role">{actor.role}</div>
              </div>

              <div className="actor-status-badge">
                {statusText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Highway with Traveling Packet */}
      <div className="packet-highway">
        <div className="highway-info-row">
          <div className="route-descriptor">
            <span style={{ color: senderActor?.color || '#38bdf8' }}>{senderActor?.name}</span>
            <ArrowRight size={14} className="route-arrow" />
            <span style={{ color: receiverActor?.color || '#a78bfa' }}>{receiverActor?.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
              Action: {currentStep.shortTitle || currentStep.title}
            </span>
            <span className={`badge ${currentStep.httpRequest?.method === 'POST' ? 'badge-emerald' : 'badge-cyan'}`}>
              {currentStep.httpRequest?.method || 'REDIRECT'}
            </span>
          </div>
        </div>

        {/* SVG Track & Animated Traveling Packet */}
        <div className="track-svg-container">
          <svg className="packet-svg" viewBox="0 0 1000 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={senderActor?.color || '#38bdf8'} stopOpacity="0.8" />
                <stop offset="100%" stopColor={receiverActor?.color || '#a78bfa'} stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Baseline dashed path across actors */}
            <line x1="50" y1="30" x2="950" y2="30" className="track-line" />

            {/* Active connection path from sender to receiver */}
            <line
              x1={`${(startPercent / 100) * 1000}`}
              y1="30"
              x2={`${(endPercent / 100) * 1000}`}
              y2="30"
              className="track-line-active"
              stroke="url(#trackGradient)"
              strokeWidth="4"
              filter="url(#glow)"
            />

            {/* Animated Packet Moving along the path */}
            <g
              className="packet-node"
              key={`${currentStep.id}-${currentStep.sender}-${currentStep.receiver}`}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`${(startPercent / 100) * 1000} 30`}
                to={`${(endPercent / 100) * 1000} 30`}
                dur="1.2s"
                repeatCount="indefinite"
              />

              {/* Packet Glow and Outer Circle */}
              <circle r="16" fill="rgba(56, 189, 248, 0.25)" />
              <circle r="12" fill="#0b0f19" stroke={receiverActor?.color || '#38bdf8'} strokeWidth="2.5" />
              
              {/* Method or Icon inside packet */}
              <text
                className="packet-label"
                y="1"
                fill="#fff"
                fontSize="8.5px"
                fontWeight="700"
              >
                {currentStep.httpRequest?.method?.substring(0, 4) || 'MSG'}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
