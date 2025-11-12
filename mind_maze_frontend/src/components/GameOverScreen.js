import React from 'react';
import GameLayout from './GameLayout';
import '../theme.css';

// PUBLIC_INTERFACE
export default function GameOverScreen({ score, onRestart }) {
  return (
    <GameLayout
      subtitle="Game Over"
      rightControls={<button className="btn btn-primary" onClick={onRestart}>Restart</button>}
    >
      <div className="center">
        <div className="hero">Game Over</div>
        <div className="hero-sub">Final Score: <strong>{score}</strong></div>
        <div className="section">
          <button className="btn btn-secondary" onClick={onRestart} aria-label="Restart game">
            Play Again
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
