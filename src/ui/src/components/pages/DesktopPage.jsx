import React, { useState, useEffect } from 'react';
import DesktopLayout from '../templates/DesktopLayout';
import ParameterSlider from '../molecules/ParameterSlider';
import AdvancedToolbar from '../organisms/AdvancedToolbar';
import FittingManager from '../organisms/FittingManager';
import StatusPanel from '../organisms/StatusPanel';
import AuthModal from '../organisms/AuthModal';
import SaveModal from '../organisms/SaveModal';

export function DesktopPage() {
  const [width, setWidth] = useState(140);
  const [height, setHeight] = useState(75);
  const [depth, setDepth] = useState(60);

  // Undo/Redo state tracking
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Auth & Mode states
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('meblix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOffline, setIsOffline] = useState(() => {
    return localStorage.getItem('meblix_is_offline') === 'true';
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
          console.log('[IPC C++ Core] Restored parameters and history from config.mbx');
        } catch (err) {
          console.log('[IPC C++ Core] No valid config.mbx history restored:', err.message);
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
          alert('Project + Undo/Redo history successfully saved locally to config.mbx!');
        } else {
          alert('C++ Core Error saving project.');
        }
      });
    } else {
      alert('Saved locally as config.mbx (Simulated outside native container).');
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
            alert(`Cloud Sync Successful!\n- GLB model URL: ${response.cloudUrl}\n- Preview image URL: ${response.thumbnailUrl}`);
            setIsSaveModalOpen(false);
          } else {
            alert(`Sync Failed: ${response.message}`);
          }
        } catch (e) {
          alert(`Failed parsing response: ${e.message}`);
        }
      });
    } else {
      alert('Sync parameters with cloud (Simulated outside native container).');
      setIsSaveModalOpen(false);
    }
  };

  return (
    <>
      <DesktopLayout
        header={
          <>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MebliX Desktop
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Advanced Parametric Solid Modeler</p>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Project ID: PRJ-9821-X</div>
          </>
        }
        leftSidebar={
          <>
            <AdvancedToolbar onToolSelect={(tool) => console.log('Selected tool:', tool)} />
            <FittingManager />
          </>
        }
        rightSidebar={
          <>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Dimensions</h3>
              <ParameterSlider label="Cabinet Width" value={width} min={60} max={300} onChange={handleWidthChange} />
              <ParameterSlider label="Cabinet Height" value={height} min={40} max={250} onChange={handleHeightChange} />
              <ParameterSlider label="Cabinet Depth" value={depth} min={40} max={120} onChange={handleDepthChange} />
            </div>
            <StatusPanel 
              syncStatus={syncStatus} 
              activeOrder={activeOrder} 
              user={user}
              isOffline={isOffline}
              undoSize={undoStack.length}
              redoSize={redoStack.length}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSaveClick={() => setIsSaveModalOpen(true)} 
              onLoginClick={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            />
          </>
        }
        mainViewport={
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)' }}></div>
            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙</div>
              <h4 style={{ fontWeight: 600 }}>Active C++ Geometry Model</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Scale: {width} x {height} x {depth} mm
              </p>
            </div>
          </div>
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
