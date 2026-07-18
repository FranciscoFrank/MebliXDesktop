import React from 'react';

export function StatusIndicator({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'Connected': return 'var(--accent-color)';
      case 'Warning': return '#f59e0b';
      case 'Error': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          boxShadow: `0 0 8px ${getStatusColor()}`
        }}
      ></span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{status}</span>
    </div>
  );
}

export default StatusIndicator;
