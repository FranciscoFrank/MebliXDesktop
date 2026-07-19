import React from 'react';

export function Button({ children, onClick, variant = 'primary', style = {} }) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return 'var(--primary-color)';
      case 'accent': return 'var(--accent-color)';
      case 'danger': return '#ef4444';
      case 'outline': return 'transparent';
      default: return 'var(--panel-bg)';
    }
  };

  const getBorder = () => {
    if (variant === 'outline') return '1px solid var(--primary-color)';
    return '1px solid var(--panel-border)';
  };

  const getTextColor = () => {
    if (variant === 'outline') return 'var(--primary-color)';
    if (variant === 'default') return 'var(--text-primary)';
    return 'white';
  };

  const buttonStyle = {
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    backgroundColor: getBackgroundColor(),
    border: getBorder(),
    color: getTextColor(),
    fontWeight: 600,
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    ...style
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
