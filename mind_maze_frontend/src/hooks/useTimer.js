import { useEffect, useRef, useState } from "react";

/**
 * useTimer - countdown timer hook with pause/resume/reset
 *
 * PUBLIC_INTERFACE
 * @param {number} durationSec - Total seconds to count down from
 * @param {object} options - configuration { autostart?: boolean, onExpire?: () => void, tickMs?: number }
 * @returns {{
 *  timeLeft: number,
 *  percent: number,
 *  running: boolean,
 *  start: () => void,
 *  pause: () => void,
 *  reset: (newDuration?: number) => void
 * }}
 */
export function useTimer(durationSec, options = {}) {
  const { autostart = true, onExpire, tickMs = 100 } = options;
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [running, setRunning] = useState(autostart);
  const startTsRef = useRef(null);
  const accPauseRef = useRef(0);
  const rafRef = useRef(null);
  const durMsRef = useRef(durationSec * 1000);

  // Start loop
  useEffect(() => {
    if (!running) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (startTsRef.current == null) startTsRef.current = performance.now();

    const loop = (now) => {
      const elapsed = now - startTsRef.current - accPauseRef.current;
      const remainingMs = Math.max(0, durMsRef.current - elapsed);
      setTimeLeft(Math.ceil(remainingMs / 1000));
      if (remainingMs <= 0) {
        setRunning(false);
        if (onExpire) onExpire();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, onExpire]);

  // Methods
  const start = () => {
    if (!running) {
      // resume by shifting pause accumulator
      const now = performance.now();
      accPauseRef.current = accPauseRef.current + (now - (startTsRef.current ?? now));
      setRunning(true);
    }
  };

  const pause = () => {
    setRunning(false);
  };

  const reset = (newDuration) => {
    const d = (newDuration ?? durationSec) * 1000;
    durMsRef.current = d;
    startTsRef.current = performance.now();
    accPauseRef.current = 0;
    setTimeLeft(Math.ceil(d / 1000));
    setRunning(autostart);
  };

  const percent = Math.max(0, Math.min(100, ((timeLeft / (durMsRef.current / 1000)) * 100)));

  return { timeLeft, percent, running, start, pause, reset };
}
