import React from 'react';
import StatusIndicator from '../atoms/StatusIndicator';
import Button from '../atoms/Button';

export function StatusPanel({ 
  syncStatus, 
  activeOrder, 
  user, 
  isOffline, 
  undoSize = 0, 
  redoSize = 0, 
  onUndo, 
  onRedo, 
  onSaveClick, 
  onLoginClick, 
  onLogout 
}) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Інтеграція системи</h4>
        <StatusIndicator status={syncStatus === 'Connected' ? 'Підключено' : 'Офлайн'} />
      </div>

      <hr style={{ borderColor: 'var(--panel-border)' }} />

      {/* Mode and Account status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Режим роботи:</span>
          <strong style={{ color: isOffline ? 'var(--text-secondary)' : 'var(--accent-color)' }}>
            {isOffline ? 'Локальний режим' : 'Хмарний режим'}
          </strong>
        </div>
        
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Акаунт:</span>
              <span>{user.username}</span>
            </div>
            <button 
              onClick={onLogout} 
              style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
            >
              Вийти
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Не авторизовано. Зміни не синхронізуються.</span>
            <Button variant="outline" onClick={onLoginClick} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', alignSelf: 'flex-start' }}>
              Увійти для синхронізації
            </Button>
          </div>
        )}
      </div>

      <hr style={{ borderColor: 'var(--panel-border)' }} />

      {/* Undo/Redo parameters control history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Історія дій</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="outline" 
            onClick={onUndo} 
            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderColor: undoSize > 0 ? 'var(--primary-color)' : 'var(--panel-border)', opacity: undoSize > 0 ? 1 : 0.4 }}
          >
            ↩ Назад ({undoSize})
          </Button>
          <Button 
            variant="outline" 
            onClick={onRedo} 
            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderColor: redoSize > 0 ? 'var(--primary-color)' : 'var(--panel-border)', opacity: redoSize > 0 ? 1 : 0.4 }}
          >
            ↪ Вперед ({redoSize})
          </Button>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--panel-border)' }} />

      {/* Cloud manufacturing progress status */}
      {!isOffline && activeOrder ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>Пов'язане хмарне замовлення:</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>ID замовлення:</span>
            <strong>#{activeOrder.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Статус:</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{activeOrder.stage === 'In Queue' ? 'В черзі' : (activeOrder.stage || 'В черзі')}</span>
          </div>
        </div>
      ) : !isOffline ? (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Немає активних виробничих замовлень.</p>
      ) : null}

      <div style={{ marginTop: '0.5rem' }}>
        <Button variant="accent" onClick={onSaveClick} style={{ width: '100%' }}>
          💾 Зберегти проект
        </Button>
      </div>
    </div>
  );
}

export default StatusPanel;
