import React, { useState } from 'react';
import { normalizeAnswer } from '../utils';
import '../theme.css';

/**
 * AnswerInput manages the text field and submission for a riddle. It sanitizes on submit.
 */
// PUBLIC_INTERFACE
export default function AnswerInput({ onSubmit, onSkip, disabled = false }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    const safe = normalizeAnswer(value);
    onSubmit?.(safe);
  };

  const handleSkip = () => {
    if (disabled) return;
    onSkip?.();
  };

  return (
    <form onSubmit={handleSubmit} className="section" aria-label="Answer input">
      <div className="input-row">
        <input
          className="input"
          type="text"
          placeholder="Type your answer..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Your answer"
          disabled={disabled}
        />
        <button className="btn btn-primary" type="submit" disabled={disabled}>Submit</button>
      </div>
      <div className="helper-row">
        <button type="button" className="btn btn-ghost" onClick={handleSkip} disabled={disabled} aria-label="Skip this riddle">Skip</button>
        <span className="subtitle">Tip: answers ignore case and punctuation</span>
      </div>
    </form>
  );
}
