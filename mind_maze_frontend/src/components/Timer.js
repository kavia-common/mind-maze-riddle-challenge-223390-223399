import React, { useEffect, useRef, useState } from 'react';
import '../theme.css';

/**
 * Timer counts down from initialSeconds to 0, invoking onExpire when time runs out.
 * It pauses when paused=true.
 */
// PUBLIC_INTERFACE
export default function Timer({ initialSeconds, paused = false, onExpire }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const savedExpire = useRef(onExpire);
  const savedPaused = useRef(paused);

  useEffect(() => { savedExpire.current = onExpire; }, [onExpire]);
  useEffect(() => { savedPaused.current = paused; }, [paused]);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (savedPaused.current) return;
    const id = setInterval(() => {
      setSeconds(prev => {
        if (savedPaused.current) return prev;
        if (prev <= 1) {
          clearInterval(id);
          if (typeof savedExpire.current === 'function') {
            savedExpire.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [initialSeconds, paused]);

  const low = seconds <= Math.max(5, Math.floor(initialSeconds * 0.25));
  return (
    <div className={`timer ${low ? 'timer-low' : ''}`} aria-live="polite" aria-label="Countdown timer">
      ⏳ {seconds}s
    </div>
  );
}
