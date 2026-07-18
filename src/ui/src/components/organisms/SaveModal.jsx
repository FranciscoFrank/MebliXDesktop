import React from 'react';
import Button from '../atoms/Button';

export function SaveModal({ isOpen, onClose, onSaveLocal, onSaveCloud, isLoggedIn }) {
  if (!isOpen) return null;

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(5, 7, 12, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const modalContentStyle = {
    width: '500px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const optionCardStyle = {
    padding: '1.25rem',
    borderRadius: '8px',
    border: '1px solid var(--panel-border)',
    background: 'rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'left',
  };

  const optionCardHoverStyle = (e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
    e.currentTarget.style.borderColor = 'var(--primary-color)';
  };

  const optionCardLeaveStyle = (e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
    e.currentTarget.style.borderColor = 'var(--panel-border)';
  };

  return (
    <div style={modalOverlayStyle}>
      <div className="glass-panel" style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Save Project</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Select the storage destination for your parametric model:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Local Save Option */}
          <div 
            style={optionCardStyle}
            onMouseEnter={optionCardHoverStyle}
            onMouseLeave={optionCardLeaveStyle}
            onClick={() => {
              onSaveLocal();
              onClose();
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>💾 Save Locally (.mbx)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--text-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Offline First</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Saves the binary model parameters and complete design history (Undo/Redo action steps) to your computer. Excellent for offline work.
            </p>
          </div>

          {/* Cloud Sync Option */}
          <div 
            style={optionCardStyle}
            onMouseEnter={optionCardHoverStyle}
            onMouseLeave={optionCardLeaveStyle}
            onClick={() => {
              onSaveCloud();
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>☁️ Sync with MebliX Cloud</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Web Optimized</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Compiles model geometry to highly optimized GLB/GLTF mesh and generates thumbnail preview directly in C++ Core, then uploads via Casablanca REST SDK. Necessary for synchronization with MebliX Web Configurator.
            </p>
            {!isLoggedIn && (
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem', fontWeight: 600 }}>
                ⚠️ Requires account authentication. You will be prompted to log in.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default SaveModal;
