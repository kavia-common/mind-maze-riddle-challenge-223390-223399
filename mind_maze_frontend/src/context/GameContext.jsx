import React from "react";
import { LEVELS } from "../data/riddles";

/**
 * PUBLIC_INTERFACE
 * GameContext - lightweight global state for game loop and settings.
 */
export const GameContext = React.createContext(null);

function useAudio() {
  // Minimal Web Audio API helper with lazy context creation
  const ctxRef = React.useRef(null);

  const ensureCtx = () => {
    if (!ctxRef.current) {
      try {
        // eslint-disable-next-line no-undef
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctxRef.current = null;
      }
    }
    return ctxRef.current;
  };

  const beep = (freq = 880, durationMs = 120, type = "sine", gain = 0.02) => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  };

  return { beep };
}

/**
 * PUBLIC_INTERFACE
 * GameProvider - holds score, level, lives, skips, timer length, sound
 */
export function GameProvider({ children }) {
  const [levelIndex, setLevelIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [lives, setLives] = React.useState(LEVELS[0].lives);
  const [skipLeft, setSkipLeft] = React.useState(1);
  const [timerLen, setTimerLen] = React.useState(30);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [gameOver, setGameOver] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  // high score from storage
  const [highScore, setHighScore] = React.useState(() => {
    try {
      return Number.parseInt(localStorage.getItem("mindmaze_highscore") || "0", 10);
    } catch {
      return 0;
    }
  });

  const audio = useAudio();

  const level = LEVELS[levelIndex];

  const playSound = React.useCallback((kind) => {
    if (!soundEnabled) return;
    // Subtle tones
    if (kind === "correct") audio.beep(880, 120, "sine", 0.03);
    if (kind === "wrong") audio.beep(220, 160, "square", 0.025);
    if (kind === "click") audio.beep(660, 80, "triangle", 0.02);
  }, [soundEnabled, audio]);

  const safeUpdateHighScore = React.useCallback((s) => {
    try {
      if (s > highScore) {
        setHighScore(s);
        localStorage.setItem("mindmaze_highscore", String(s));
      }
    } catch {
      // ignore
    }
  }, [highScore]);

  const resetGame = React.useCallback(() => {
    setLevelIndex(0);
    setScore(0);
    setLives(LEVELS[0].lives);
    setSkipLeft(1);
    setGameOver(false);
    setFinished(false);
    playSound("click");
  }, [playSound]);

  const advanceLevel = React.useCallback(() => {
    const isLast = levelIndex >= LEVELS.length - 1;
    if (isLast) {
      setFinished(true);
      safeUpdateHighScore(score);
      return;
    }
    const nextIndex = Math.min(LEVELS.length - 1, levelIndex + 1);
    setLevelIndex(nextIndex);
    setLives(LEVELS[nextIndex].lives);
  }, [levelIndex, score, safeUpdateHighScore]);

  const loseLife = React.useCallback(() => {
    setLives((l) => {
      const next = Math.max(0, l - 1);
      if (next <= 0) {
        setGameOver(true);
        safeUpdateHighScore(score);
      }
      return next;
    });
    playSound("wrong");
  }, [playSound, safeUpdateHighScore, score]);

  const addScore = React.useCallback((delta) => {
    setScore((s) => {
      const next = s + delta;
      return next;
    });
    playSound("correct");
  }, [playSound]);

  const consumeSkip = React.useCallback(() => {
    setSkipLeft((n) => Math.max(0, n - 1));
    playSound("click");
  }, [playSound]);

  const value = {
    levelIndex, setLevelIndex,
    level,
    score, addScore,
    lives, loseLife,
    skipLeft, consumeSkip,
    timerLen, setTimerLen,
    soundEnabled, setSoundEnabled,
    gameOver, finished,
    resetGame,
    advanceLevel,
    highScore
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
