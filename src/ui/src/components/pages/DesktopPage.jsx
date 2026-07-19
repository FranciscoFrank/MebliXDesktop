import React, { useState, useEffect } from 'react';
import DesktopLayout from '../templates/DesktopLayout';

import CadViewport from '../organisms/CadViewport';
import AuthModal from '../organisms/AuthModal';
import SaveModal from '../organisms/SaveModal';

export function DesktopPage() {
  const [width, setWidth] = useState(1400);
  const [height, setHeight] = useState(750);
  const [depth, setDepth] = useState(600);

  // Undo/Redo state tracking
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Auth & Mode states
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('meblix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOffline, setIsOffline] = useState(() => {
    const saved = localStorage.getItem('meblix_is_offline');
    return saved === null ? true : saved === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Sync state
  const [syncStatus, setSyncStatus] = useState('Offline');
  const [activeOrder, setActiveOrder] = useState(null);
  const [socket, setSocket] = useState(null);

  // Load previous local project parameters & history on startup (if in native webview container)
  useEffect(() => {
    if (window.loadLocalProject) {
      window.loadLocalProject('config.mbx').then((dataJson) => {
        try {
          const data = JSON.parse(dataJson);
          if (data.dimensions) {
            setWidth(data.dimensions.width);
            setHeight(data.dimensions.height);
            setDepth(data.dimensions.depth);
          }
          if (data.undoStack) setUndoStack(data.undoStack);
          if (data.redoStack) setRedoStack(data.redoStack);
          console.log('[IPC C++ Core] Відновлено параметри та історію з config.mbx');
        } catch (err) {
          console.log('[IPC C++ Core] Не знайдено збереженої історії config.mbx:', err.message);
        }
      });
    }
  }, []);

  // Show authentication screen if not logged in and not offline
  useEffect(() => {
    if (!user && !isOffline) {
      setIsAuthModalOpen(true);
    } else {
      setIsAuthModalOpen(false);
    }
  }, [user, isOffline]);

  // Connect to Sync WebSocket backend only if logged in & online
  useEffect(() => {
    if (isOffline || !user) {
      setSyncStatus('Offline');
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      setSyncStatus('Connected');
      ws.send(JSON.stringify({ type: 'SUBSCRIBE', userId: 'user_retail_123' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ORDER_STAGE_UPDATE') {
          setActiveOrder({ id: msg.orderId, stage: msg.stage });
        }
      } catch (err) {
        console.error('Error parsing sync message:', err);
      }
    };

    ws.onclose = () => {
      setSyncStatus('Offline');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user, isOffline]);

  const pushStateToUndo = (prevWidth, prevHeight, prevDepth) => {
    setUndoStack(prev => [...prev, { width: prevWidth, height: prevHeight, depth: prevDepth }]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleWidthChange = (val) => {
    pushStateToUndo(width, height, depth);
    setWidth(val);
  };

  const handleHeightChange = (val) => {
    pushStateToUndo(width, height, depth);
    setHeight(val);
  };

  const handleDepthChange = (val) => {
    pushStateToUndo(width, height, depth);
    setDepth(val);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, { width, height, depth }]);
    
    setWidth(previousState.width);
    setHeight(previousState.height);
    setDepth(previousState.depth);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, { width, height, depth }]);

    setWidth(nextState.width);
    setHeight(nextState.height);
    setDepth(nextState.depth);
  };

  const handleLoginSuccess = (loginData) => {
    setUser(loginData);
    setIsOffline(false);
    localStorage.setItem('meblix_user', JSON.stringify(loginData));
    localStorage.setItem('meblix_is_offline', 'false');
    setIsAuthModalOpen(false);
  };

  const handleWorkOffline = () => {
    setUser(null);
    setIsOffline(true);
    localStorage.setItem('meblix_user', '');
    localStorage.setItem('meblix_is_offline', 'true');
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsOffline(true);
    localStorage.removeItem('meblix_user');
    localStorage.setItem('meblix_is_offline', 'true');
    setActiveOrder(null);
  };

  const executeSaveLocal = () => {
    const dimensionsStr = JSON.stringify({ width, height, depth });
    const undoStr = JSON.stringify(undoStack);
    const redoStr = JSON.stringify(redoStack);

    if (window.saveLocalProject) {
      window.saveLocalProject('config.mbx', dimensionsStr, undoStr, redoStr).then((res) => {
        if (res === 'true') {
          alert('Проект та історію дій успішно збережено локально у config.mbx!');
        } else {
          alert('Помилка C++ ядра при збереженні проекту.');
        }
      });
    } else {
      alert('Збережено локально як config.mbx (симуляція поза нативним контейнером).');
    }
  };

  const executeCloudSync = () => {
    if (!user) {
      // If not logged in, prompt Auth Modal
      setIsSaveModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    const dimensionsStr = JSON.stringify({ width, height, depth });

    if (window.triggerCloudSync) {
      window.triggerCloudSync('PRJ-9821-X', user.token, dimensionsStr).then((responseStr) => {
        try {
          const response = JSON.parse(responseStr);
          if (response.status === 'success') {
            alert(`Синхронізація з хмарою успішна!\n- URL GLB-моделі: ${response.cloudUrl}\n- URL ескізу: ${response.thumbnailUrl}`);
            setIsSaveModalOpen(false);
          } else {
            alert(`Синхронізація завершилася помилкою: ${response.message}`);
          }
        } catch (e) {
          alert(`Помилка парсингу відповіді: ${e.message}`);
        }
      });
    } else {
      alert('Синхронізація параметрів із хмарою (симуляція поза нативним контейнером).');
      setIsSaveModalOpen(false);
    }
  };

  return (
    <>
      <DesktopLayout
        header={
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>M</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>MebliX</span>
              </div>
              
              <nav style={{ display: 'flex', gap: '0.25rem' }}>
                {['Файл', 'Інструменти', 'Налаштування', 'Вікно', 'Довідка'].map((item) => (
                  <button
                    key={item}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                      e.target.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>
            
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--panel-border)',
                cursor: 'pointer'
              }}
            >
              <span>🌐</span>
              <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Мова: Українська</strong>
            </div>
          </>
        }
        mainViewport={
          <CadViewport />
        }
      />

      {isAuthModalOpen && (
        <AuthModal 
          onLoginSuccess={handleLoginSuccess}
          onWorkOffline={handleWorkOffline}
        />
      )}

      <SaveModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveLocal={executeSaveLocal}
        onSaveCloud={executeCloudSync}
        isLoggedIn={!!user}
      />
    </>
  );
}

export default DesktopPage;
