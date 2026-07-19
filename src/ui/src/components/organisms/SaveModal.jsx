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
    background: 'rgba(0, 0, 0, 0.4)',
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
    border: '1px solid var(--panel-border)',
  };

  const optionCardStyle = {
    padding: '1.25rem',
    borderRadius: '8px',
    border: '1px solid var(--panel-border)',
    background: 'var(--bg-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'left',
  };

  const optionCardHoverStyle = (e) => {
    e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)';
    e.currentTarget.style.borderColor = 'var(--primary-color)';
  };

  const optionCardLeaveStyle = (e) => {
    e.currentTarget.style.background = 'var(--bg-color)';
    e.currentTarget.style.borderColor = 'var(--panel-border)';
  };

  return (
    <div style={modalOverlayStyle}>
      <div className="glass-panel" style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Зберегти проект</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Оберіть місце збереження для вашої параметричної моделі:
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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>💾 Зберегти локально (.mbx)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--text-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Локальний файл</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Зберігає геометричні параметри моделі та повну історію редагування (кроки Назад/Вперед) на вашому комп'ютері. Ідеально для автономної роботи.
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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>☁️ Синхронізувати з хмарою MebliX</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Веб-оптимізація</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Компілює геометрію моделі у високооптимізований 3D-меш GLB/GLTF та генерує ескіз у C++ ядрі, після чого завантажує через Casablanca REST SDK. Необхідно для синхронізації з веб-конфігуратором MebliX.
            </p>
            {!isLoggedIn && (
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem', fontWeight: 600 }}>
                ⚠️ Потрібна авторизація облікового запису. Вам буде запропоновано увійти.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button variant="outline" onClick={onClose}>Скасувати</Button>
        </div>
      </div>
    </div>
  );
}

export default SaveModal;
