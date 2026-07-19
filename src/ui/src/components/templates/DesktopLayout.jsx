import React from 'react';

export function DesktopLayout({ header, mainViewport }) {
  return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}>
      {/* Header Slot (Top Menu Bar) */}
      {header && (
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--panel-bg)',
          borderBottom: '1px solid var(--panel-border)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          padding: '0.75rem 1.5rem',
          zIndex: 10
        }}>
          {header}
        </header>
      )}

      {/* Main Viewport Container */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: 1, 
        minHeight: 0,
        padding: '1.25rem' 
      }}>
        {/* CAD viewport Slot */}
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {mainViewport}
        </main>
      </div>
    </div>
  );
}

export default DesktopLayout;
