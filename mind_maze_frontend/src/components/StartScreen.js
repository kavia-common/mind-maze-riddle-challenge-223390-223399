import React from 'react';
import GameLayout from './GameLayout';
import '../theme.css';

// PUBLIC_INTERFACE
export default function StartScreen({ onStart }) {
  return (
    <GameLayout
      subtitle="Blue & amber journey into riddles"
      rightControls={<button className="btn btn-secondary" onClick={onStart}>Start</button>}
    >
      <div className="center">
        <div className="hero">Welcome to Mind Maze</div>
        <div className="hero-sub">Solve riddles, race the timer, and climb the levels.</div>
        <div className="section">
          <button className="btn btn-primary" onClick={onStart} aria-label="Start the game">
            Start the Quest
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
