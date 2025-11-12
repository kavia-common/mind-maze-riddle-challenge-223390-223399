import React, { useCallback, useEffect, useState } from 'react';
import './theme.css';
import './App.css';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';

/**
 * App manages top-level routing between Start -> Game -> Game Over.
 * It also demonstrates reading REACT_APP_* variables safely (no secrets).
 */
// PUBLIC_INTERFACE
function App() {
  const [view, setView] = useState('start'); // start | game | over
  const [finalScore, setFinalScore] = useState(0);

  // Optional: environment info (for debugging; no PII)
  useEffect(() => {
    const envInfo = {
      nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV,
      apiBase: process.env.REACT_APP_API_BASE || '',
      frontendUrl: process.env.REACT_APP_FRONTEND_URL || '',
      flags: process.env.REACT_APP_FEATURE_FLAGS || '',
      experiments: process.env.REACT_APP_EXPERIMENTS_ENABLED || ''
    };
    // Do not log PII or secrets; this is generic info.
    // eslint-disable-next-line no-console
    console.log('[MindMaze] env', envInfo);
  }, []);

  const start = useCallback(() => setView('game'), []);
  const restart = useCallback(() => {
    setFinalScore(0);
    setView('start');
  }, []);
  const onGameOver = useCallback((score) => {
    setFinalScore(score || 0);
    setView('over');
  }, []);

  return (
    <div className="app-shell" data-theme="light">
      {view === 'start' && <StartScreen onStart={start} />}
      {view === 'game' && <GameScreen onGameOver={onGameOver} />}
      {view === 'over' && <GameOverScreen score={finalScore} onRestart={restart} />}
    </div>
  );
}

export default App;
