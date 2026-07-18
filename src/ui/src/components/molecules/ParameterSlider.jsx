import React from 'react';

export function ParameterSlider({ label, value, min, max, unit = 'cm', onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <strong style={{ color: 'var(--primary-color)' }}>{value} {unit}</strong>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))} 
        style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          background: 'var(--panel-border)',
          outline: 'none',
          accentColor: 'var(--primary-color)',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default ParameterSlider;
