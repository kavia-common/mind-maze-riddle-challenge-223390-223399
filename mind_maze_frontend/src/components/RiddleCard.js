import React from 'react';
import '../theme.css';

/**
 * RiddleCard shows the riddle text and optional feedback.
 */
// PUBLIC_INTERFACE
export default function RiddleCard({ text, state }) {
  // state: 'idle' | 'correct' | 'incorrect'
  const cls =
    state === 'correct'
      ? 'riddle-card animate-pop'
      : state === 'incorrect'
      ? 'riddle-card animate-shake'
      : 'riddle-card';

  return (
    <div className={cls} role="group" aria-label="Riddle">
      <div className="riddle-text">{text}</div>
    </div>
  );
}
