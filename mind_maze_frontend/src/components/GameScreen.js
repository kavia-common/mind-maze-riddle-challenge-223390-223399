import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RIDDLES } from '../riddles';
import { getFeatureFlags, isCorrectAnswer } from '../utils';
import GameLayout from './GameLayout';
import Scoreboard from './Scoreboard';
import Timer from './Timer';
import RiddleCard from './RiddleCard';
import AnswerInput from './AnswerInput';
import '../theme.css';
import { useProgress } from '../context/ProgressContext.jsx';

// Simple confetti fallback using emojis when flag enabled (no external deps)
function Confetti({ trigger }) {
  if (!trigger) return null;
  const pieces = new Array(18).fill(0).map((_, i) => i);
  return (
    <div aria-hidden="true" style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const duration = 1200 + Math.random() * 800;
        const delay = Math.random() * 300;
        const rotate = Math.random() * 360;
        const color = i % 2 ? '#F59E0B' : '#2563EB';
        const size = 8 + Math.random() * 8;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: -10,
            left: `${left}%`,
            width: size,
            height: size,
            background: color,
            opacity: 0.85,
            transform: `rotate(${rotate}deg)`,
            borderRadius: 2,
            animation: `drop-${i} ${duration}ms ease-in ${delay}ms forwards`
          }}/>
        );
      })}
      <style>{new Array(18).fill(0).map((_, i) => `
        @keyframes drop-${i} {
          0% { transform: translateY(-10px) rotate(0deg) }
          100% { transform: translateY(100vh) rotate(360deg) }
        }
      `).join('\n')}</style>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function GameScreen({ onGameOver }) {
  /** Manages the full game loop across riddles and lives. */
  const flags = useMemo(() => getFeatureFlags(), []);
  const { progress, setProgress, loading: progressLoading } = useProgress();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [state, setState] = useState('idle'); // idle | correct | incorrect
  const [confettiOn, setConfettiOn] = useState(false);
  const lockedRef = useRef(false); // prevent double processing until transition completes

  // Initialize local state from persisted progress once available
  useEffect(() => {
    if (!progressLoading && progress) {
      setScore(progress.score ?? 0);
      setLives(progress.lives ?? 3);
      // Level maps 1..N to index 0..N-1
      const nextIndex = Math.min(Math.max(0, (progress.level ?? 1) - 1), RIDDLES.length - 1);
      setIndex(nextIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressLoading]);

  const current = RIDDLES[index];
  const level = current?.level ?? (index + 1);

  const handleNext = useCallback(() => {
    if (index + 1 >= RIDDLES.length) {
      onGameOver?.(score);
      return;
    }
    setIndex((i) => i + 1);
    setState('idle');
    // Persist level advancement
    setProgress((prev) => ({ ...prev, level: level + 1, score, lives }));
  }, [index, onGameOver, score, lives, level, setProgress]);

  const handleExpireOrWrong = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setState('incorrect');
    setLives((lv) => {
      const next = lv - 1;
      // Persist lives decrement
      setProgress((prev) => ({ ...prev, lives: next, score, level }));
      setTimeout(() => {
        lockedRef.current = false;
        if (next <= 0) {
          onGameOver?.(score);
        } else {
          handleNext();
        }
      }, 550);
      return next;
    });
  }, [handleNext, onGameOver, score, level, setProgress]);

  const handleSubmit = useCallback((safeInput) => {
    if (!current || lockedRef.current) return;
    if (isCorrectAnswer(safeInput, current.answers)) {
      lockedRef.current = true;
      setState('correct');
      setScore((s) => {
        const ns = s + 100;
        // Persist score increment
        setProgress((prev) => ({ ...prev, score: ns, level, lives }));
        return ns;
      });
      if (flags.confetti) {
        setConfettiOn(true);
        setTimeout(() => setConfettiOn(false), 1200);
      }
      setTimeout(() => {
        lockedRef.current = false;
        handleNext();
      }, 500);
    } else {
      handleExpireOrWrong();
    }
  }, [current, flags.confetti, handleNext, handleExpireOrWrong, setProgress, level, lives]);

  const handleSkip = useCallback(() => {
    // Skipping costs a life
    handleExpireOrWrong();
  }, [handleExpireOrWrong]);

  if (!current) {
    // Safety: if riddles exhausted
    onGameOver?.(score);
    return null;
  }

  return (
    <>
      {flags.confetti && <Confetti trigger={confettiOn} />}
      <GameLayout
        subtitle="Solve the riddle before time runs out"
        rightControls={<button className="btn btn-ghost" onClick={() => onGameOver?.(score)}>End</button>}
      >
        <Scoreboard level={level} score={score} lives={lives} />
        <div className="helper-row">
          <span className="subtitle">Riddle {index + 1} of {RIDDLES.length}</span>
          <Timer
            key={index}
            initialSeconds={current.seconds}
            paused={state === 'correct' || state === 'incorrect'}
            onExpire={handleExpireOrWrong}
          />
        </div>
        <RiddleCard text={current.text} state={state} />
        <AnswerInput onSubmit={handleSubmit} onSkip={handleSkip} disabled={state !== 'idle'} />
        {state === 'correct' && <div className="feedback ok">Correct! +100 points</div>}
        {state === 'incorrect' && <div className="feedback err">Oops! Lost a life.</div>}
      </GameLayout>
    </>
  );
}
