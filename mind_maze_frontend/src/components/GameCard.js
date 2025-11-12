import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { theme } from "../theme";
import TimerRing from "./TimerRing";
import { useTimer } from "../hooks/useTimer";
import FeedbackBanner from "./FeedbackBanner";

/**
 * normalize answers to compare loosely
 */
function normalize(text) {
  return (text || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

/**
 * GameCard - encapsulates riddle presentation and interactions
 *
 * PUBLIC_INTERFACE
 * @param {{
 *  level: { id:number, name:string, timePerRiddle:number, lives:number, points:number, riddles:Array } ,
 *  onResult: (result: { correct: boolean, scoreDelta: number, loseLife: boolean, completedLevel: boolean }) => void,
 *  skipAllowed?: boolean,
 *  onSkip?: () => void
 * }} props
 */
export default function GameCard({ level, onResult, skipAllowed = false, onSkip }) {
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [hintVisible, setHintVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const inputRef = useRef(null);
  const submitRef = useRef(null);

  const riddle = level.riddles[index];
  const points = useMemo(() => level.points + Math.max(0, streak - 1) * 5, [level.points, streak]);

  const { timeLeft, percent, reset } = useTimer(level.timePerRiddle, {
    autostart: true,
    onExpire: () => {
      handleWrong(true);
    }
  });

  // Focus input on riddle change
  useEffect(() => {
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  }, [index]);

  // When level changes externally (timer length), ensure timer resets for current riddle
  useEffect(() => {
    reset(level.timePerRiddle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.timePerRiddle]);

  const animate = (type) => {
    setFeedback(type);
    setTimeout(() => setFeedback(null), 600);
  };

  const nextOrComplete = () => {
    const atEnd = index >= level.riddles.length - 1;
    if (!atEnd) {
      setIndex((i) => i + 1);
      setHintVisible(false);
      setAnswered(false);
      reset(level.timePerRiddle);
      if (inputRef.current) inputRef.current.value = "";
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    } else {
      onResult({ correct: false, scoreDelta: 0, loseLife: false, completedLevel: true });
    }
  };

  const handleWrong = useCallback((fromTimeout = false) => {
    animate("wrong");
    const loseLife = true;
    const scoreDelta = 0;
    const nextLives = Math.max(0, lives - 1);
    setLives(nextLives);
    setStreak(0);
    setAnswered(true);

    onResult({ correct: false, scoreDelta, loseLife, completedLevel: false });

    if (nextLives <= 0) {
      // Parent/context handles game over
      return;
    }
  }, [lives, onResult]);

  const handleCorrect = useCallback(() => {
    animate("correct");
    const delta = points;
    const loseLife = false;
    const atEnd = index >= level.riddles.length - 1;
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setAnswered(true);
    onResult({ correct: true, scoreDelta: delta, loseLife, completedLevel: atEnd });
  }, [index, onResult, points, streak]);

  const submitAnswer = (e) => {
    e.preventDefault();
    if (answered) return;
    const userText = inputRef.current?.value ?? "";
    if (!userText.trim()) return;
    const ok = riddle.answers.some((ans) => normalize(ans) === normalize(userText));
    if (ok) {
      handleCorrect();
    } else {
      handleWrong(false);
    }
  };

  const handleSkip = () => {
    if (!skipAllowed || answered) return;
    if (onSkip) onSkip();
    // Move to next riddle without affecting score/life
    setAnswered(false);
    nextOrComplete();
  };

  const nextEnabled = answered;

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "30px auto",
        padding: 0
      }}
    >
      <div
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.lg,
          boxShadow: theme.shadow.md,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            background: theme.gradient,
            padding: "18px 20px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: "space-between",
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <TimerRing secondsLeft={timeLeft} percent={percent} />
            <div>
              <div style={{ fontSize: 13, color: theme.colors.textMuted, fontWeight: 600 }}>
                Riddle {index + 1} of {level.riddles.length}
              </div>
              <div style={{ fontWeight: 800, color: theme.colors.text }}>
                {level.name}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setHintVisible((v) => !v)}
              className="btn"
              style={{
                background: theme.colors.secondary,
                color: "#0b0b0b",
                border: "none",
                padding: "10px 14px",
                borderRadius: theme.radii.pill,
                fontWeight: 700,
                boxShadow: theme.shadow.sm,
                transition: "transform .1s ease",
                cursor: "pointer"
              }}
              aria-expanded={hintVisible}
              aria-controls="hint"
            >
              {hintVisible ? "Hide Hint" : "Show Hint"}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={!skipAllowed || answered}
              className="btn"
              style={{
                background: "transparent",
                color: (!skipAllowed || answered) ? "#9ca3af" : theme.colors.primary,
                border: `1px solid ${theme.colors.border}`,
                padding: "10px 14px",
                borderRadius: theme.radii.pill,
                fontWeight: 700,
                boxShadow: "none",
                cursor: (!skipAllowed || answered) ? "not-allowed" : "pointer"
              }}
              aria-label="Skip this riddle (once per game)"
            >
              Skip
            </button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md,
              padding: "20px 18px",
              boxShadow: theme.shadow.sm,
              transform: feedback === "correct" ? "scale(1.01)" : feedback === "wrong" ? "scale(0.99)" : "scale(1)",
              transition: "transform .15s ease"
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: theme.colors.text
              }}
            >
              {riddle.question}
            </p>

            {hintVisible && (
              <div
                id="hint"
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: theme.colors.textMuted
                }}
              >
                💡 Hint: {riddle.hint}
              </div>
            )}
          </div>

          <form onSubmit={submitAnswer} style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              ref={inputRef}
              aria-label="Your answer"
              placeholder="Type your answer…"
              autoComplete="off"
              disabled={answered}
              style={{
                flex: "1 1 260px",
                minWidth: 220,
                padding: "12px 14px",
                borderRadius: theme.radii.md,
                border: `1px solid ${feedback === "wrong" ? theme.colors.error : theme.colors.border}`,
                outline: "none",
                boxShadow: feedback === "correct" ? `0 0 0 4px rgba(34,197,94,0.15)` :
                           feedback === "wrong" ? `0 0 0 4px rgba(239,68,68,0.12)` :
                           "none",
                transition: "box-shadow .15s ease, border-color .15s ease",
                fontSize: 16,
                background: answered ? "#f3f4f6" : "#fff"
              }}
              onFocus={(e) => (e.target.style.borderColor = theme.colors.primary)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border)}
            />
            <button
              ref={submitRef}
              type="submit"
              className="btn"
              disabled={answered}
              style={{
                background: theme.colors.primary,
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: theme.radii.pill,
                fontWeight: 800,
                letterSpacing: 0.2,
                boxShadow: theme.shadow.sm,
                cursor: answered ? "not-allowed" : "pointer",
                opacity: answered ? 0.6 : 1
              }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={nextOrComplete}
              disabled={!nextEnabled}
              className="btn"
              style={{
                background: "transparent",
                color: nextEnabled ? theme.colors.text : "#9ca3af",
                border: `1px solid ${theme.colors.border}`,
                padding: "12px 16px",
                borderRadius: theme.radii.pill,
                fontWeight: 700,
                boxShadow: "none",
                cursor: nextEnabled ? "pointer" : "not-allowed"
              }}
              aria-label="Next riddle"
            >
              Next
            </button>
          </form>

          <div style={{ marginTop: 12 }}>
            <FeedbackBanner
              type={feedback === "correct" ? "success" : feedback === "wrong" ? "error" : null}
              message={feedback === "correct" ? "Correct! Great job." : feedback === "wrong" ? "Not quite. Keep going!" : undefined}
            />
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: theme.colors.textMuted }}>
            Points for correct answer: <strong style={{ color: theme.colors.secondary }}>{points}</strong>
            {streak > 1 && (
              <span style={{ marginLeft: 8, color: theme.colors.success }}>
                + Streak x{streak}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderTop: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
            Tip: Spelling matters! You can also try synonyms if obvious.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              role="status"
              aria-live="polite"
              style={{
                padding: "6px 10px",
                borderRadius: theme.radii.pill,
                border: `1px solid ${theme.colors.border}`,
                color:
                  feedback === "correct" ? theme.colors.success :
                  feedback === "wrong" ? theme.colors.error :
                  theme.colors.textMuted,
                background:
                  feedback === "correct" ? "rgba(34,197,94,0.08)" :
                  feedback === "wrong" ? "rgba(239,68,68,0.08)" :
                  "transparent",
                fontWeight: 700
              }}
            >
              {feedback === "correct" ? "Correct!" : feedback === "wrong" ? "Try again" : "Awaiting answer"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile spacing */}
      <div style={{ height: 16 }} />
    </div>
  );
}
