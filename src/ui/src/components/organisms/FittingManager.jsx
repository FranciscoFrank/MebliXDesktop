import React, { useState } from 'react';
import Button from '../atoms/Button';

export function FittingManager() {
  const [fittings, setFittings] = useState([
    { id: 1, type: 'Завіса 90°', qty: 4 },
    { id: 2, type: 'Направляюча 450мм', qty: 2 }
  ]);

  const addFitting = (type) => {
    setFittings(prev => {
      const match = prev.find(f => f.type === type);
      if (match) {
        return prev.map(f => f.type === type ? { ...f, qty: f.qty + 1 } : f);
      }
      return [...prev, { id: Date.now(), type, qty: 1 }];
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Менеджер фурнітури</h3>
      
      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {fittings.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
            <span>{item.type}</span>
            <strong>x{item.qty}</strong>
          </div>
        ))}
      </div>

      {/* Speed dial */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Button variant="outline" onClick={() => addFitting('Завіса 90°')} style={{ fontSize: '0.75rem', padding: '0.4rem' }}>+ Завіса</Button>
        <Button variant="outline" onClick={() => addFitting('З\'єднання Minifix')} style={{ fontSize: '0.75rem', padding: '0.4rem' }}>+ Мініфікс</Button>
      </div>
    </div>
  );
}

export default FittingManager;
