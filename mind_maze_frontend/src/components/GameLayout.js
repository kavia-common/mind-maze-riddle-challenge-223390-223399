import React from 'react';
import '../theme.css';

/**
 * GameLayout is the shell for all screens, applying the Ocean Professional card, header, and subtle gradients.
 * It accepts title, subtitle, left and right controls, and renders children as body.
 */
// PUBLIC_INTERFACE
export default function GameLayout({ title, subtitle, leftControls, rightControls, children }) {
  return (
    <div className="app-shell">
      <div className="container-center">
        <div className="game-card animate-pop">
          <div className="card-gradient" />
          <div className="card-inner">
            <div className="header">
              <div className="brand">
                <div className="brand-badge">MM</div>
                <div>
                  <div className="title">{title || 'Mind Maze: The Riddle Quest'}</div>
                  {subtitle ? <div className="subtitle">{subtitle}</div> : null}
                </div>
              </div>
              <div className="controls">
                {leftControls}
                {rightControls}
              </div>
            </div>
            <div className="screen">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
