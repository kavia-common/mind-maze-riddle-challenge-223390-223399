import React from 'react';
import '../theme.css';

// PUBLIC_INTERFACE
export default function Scoreboard({ level, score, lives }) {
  /** Displays current level, score and remaining lives as hearts. */
  const hearts = new Array(3).fill(0).map((_, idx) => {
    const on = idx < lives;
    return <span key={idx} className={`heart ${on ? '' : 'off'}`} aria-hidden="true" />;
  });

  return (
    <div className="statusbar" role="status" aria-label="Game status">
      <div className="status-chip">
        <span>Level</span>
        <span style={{ marginLeft: 'auto' }}>{level}</span>
      </div>
      <div className="status-chip">
        <span>Score</span>
        <span style={{ marginLeft: 'auto' }}>{score}</span>
      </div>
      <div className="status-chip" aria-live="polite">
        <span>Lives</span>
        <span className="lives" style={{ marginLeft: 'auto' }}>{hearts}</span>
      </div>
    </div>
  );
}
