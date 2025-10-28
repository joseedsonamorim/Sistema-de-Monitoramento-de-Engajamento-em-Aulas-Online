import React, { useEffect } from 'react';
import './InterventionPopups.css';

function InterventionPopups({ interventions, onDismiss }) {
  useEffect(() => {
    if (interventions.length > 0) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    }
  }, [interventions]);

  const getIcon = (type) => {
    switch (type) {
      case 'attention':
        return '👀';
      case 'fatigue':
        return '😴';
      case 'interaction':
        return '📝';
      case 'quiz':
        return '❓';
      default:
        return '📌';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'attention':
        return '#fbbf24';
      case 'fatigue':
        return '#fb7185';
      case 'interaction':
        return '#818cf8';
      case 'quiz':
        return '#34d399';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="intervention-container">
      {interventions.map((intervention) => (
        <div
          key={intervention.id}
          className="intervention-popup glass-card"
          style={{ borderLeft: `4px solid ${getColor(intervention.tipo)}` }}
        >
          <div className="intervention-header">
            <span className="intervention-icon">{getIcon(intervention.tipo)}</span>
            <button
              className="dismiss-btn"
              onClick={() => onDismiss(intervention.id)}
            >
              ×
            </button>
          </div>
          <div className="intervention-message">{intervention.mensagem}</div>
        </div>
      ))}
    </div>
  );
}

export default InterventionPopups;



