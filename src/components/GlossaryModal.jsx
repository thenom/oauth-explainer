import React, { useState } from 'react';
import { X, Search, BookOpen, ExternalLink } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/glossary.js';
import '../styles/modals.css';

export function GlossaryModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen size={22} color="#38bdf8" />
            <h2 className="modal-title">OAuth 2.0 & OIDC Standards Glossary</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="glossary-search-input"
            placeholder="Search terminology, RFC sections, or roles (e.g. PKCE, Bearer, State, Scope)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          <div className="glossary-grid">
            {filtered.map((item, idx) => (
              <div key={idx} className="glossary-item">
                <div className="glossary-item-top">
                  <span className="glossary-term-name">{item.term}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                      {item.category}
                    </span>
                    <span className="glossary-rfc-tag">{item.rfc}</span>
                  </div>
                </div>

                <p className="glossary-def">{item.definition}</p>

                {item.example && (
                  <div className="glossary-example">
                    <strong>Example:</strong> {item.example}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No terms matching "{searchTerm}" found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
