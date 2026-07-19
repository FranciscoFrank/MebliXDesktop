import React, { useState } from 'react';
import ToolbarItem from '../molecules/ToolbarItem';

export function AdvancedToolbar({ onToolSelect }) {
  const [activeTool, setActiveTool] = useState('select');

  const tools = [
    { id: 'select', icon: '⬈', label: 'Виділення / Переміщення', description: 'Взаємодія з елементами' },
    { id: 'drill', icon: '⚙', label: 'Свердління', description: 'Додати отвори під шканти/мініфікси' },
    { id: 'edge', icon: '▤', label: 'Кромкування', description: 'Налаштування кромки ПВХ' },
    { id: 'cut', icon: '✄', label: 'Розкрій', description: 'Розділити або змінити розмір плити' }
  ];

  const handleToolClick = (toolId) => {
    setActiveTool(toolId);
    if (onToolSelect) onToolSelect(toolId);
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Інструменти CAD</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tools.map(tool => (
          <ToolbarItem 
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            description={tool.description}
            active={activeTool === tool.id}
            onClick={() => handleToolClick(tool.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default AdvancedToolbar;
