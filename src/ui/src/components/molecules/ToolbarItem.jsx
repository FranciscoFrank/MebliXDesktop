import React from 'react';

export function ToolbarItem({ icon, label, description, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '0.75rem',
        borderRadius: '8px',
        background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        border: active ? '1px solid var(--primary-color)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ fontSize: '1.2rem', color: active ? 'var(--primary-color)' : 'var(--text-secondary)' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: active ? 'var(--primary-color)' : 'var(--text-secondary)' }}>{label}</span>
        {description && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{description}</span>}
      </div>
    </div>
  );
}

export default ToolbarItem;
