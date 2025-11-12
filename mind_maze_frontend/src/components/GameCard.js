import React, { useCallback, useMemo, useRef, useState } from "react";
import { theme } from "../theme";
import TimerRing from "./TimerRing";
import { useTimer } from "../hooks/useTimer";

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
 *  onResult: (result: { correct: boolean, scoreDelta: number, loseLife: boolean, completedLevel: boolean }) => void
 * }} props
 */
export default function GameCard({ level, onResult }) {
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [hintVisible, setHintVisible] = useState(false);
  const inputRef = useRef(null);

  const riddle = level.riddles[index];
  const points = useMemo(() => level.points + Math.max(0, streak - 1) * 5, [level.points, streak]);

  const { timeLeft, percent, reset } = useTimer(level.timePerRiddle, {
    autostart: true,
    onExpire: () => {
      handleWrong(true);
    }
  });

  const animate = (type) => {
    setFeedback(type);
    setTimeout(() => setFeedback(null), 500);
  };

  const handleWrong = useCallback((fromTimeout = false) => {
    animate("wrong");
    const loseLife = true;
    const scoreDelta = 0;
    const nextLives = Math.max(0, lives - 1);
    setLives(nextLives);
    setStreak(0);

    const atEnd = index >= level.riddles.length - 1;
    const completedLevel = false;

    onResult({ correct: false, scoreDelta, loseLife, completedLevel });

    if (nextLives <= 0) {
      // Out of lives -> end level
      return;
    }

    if (!atEnd) {
      setIndex((i) => i + 1);
      setHintVisible(false);
      reset(level.timePerRiddle);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      // Level finished due to completing all questions with remaining lives (but wrong here was last)
      onResult({ correct: false, scoreDelta: 0, loseLife: false, completedLevel: true });
    }
  }, [index, level.riddles.length, level.timePerRiddle, lives, onResult, reset]);

  const handleCorrect = useCallback(() => {
    animate("correct");
    const delta = points;
    const loseLife = false;
    const atEnd = index >= level.riddles.length - 1;
    const nextStreak = streak + 1;
    setStreak(nextStreak);

    onResult({ correct: true, scoreDelta: delta, loseLife, completedLevel: atEnd });

    if (!atEnd) {
      setIndex((i) => i + 1);
      setHintVisible(false);
      reset(level.timePerRiddle);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [index, level.riddles.length, level.timePerRiddle, onResult, points, reset, streak]);

  const submitAnswer = (e) => {
    e.preventDefault();
    const userText = inputRef.current?.value ?? "";
    if (!userText.trim()) return;
    const ok = riddle.answers.some((ans) => normalize(ans) === normalize(userText));
    if (ok) {
      handleCorrect();
    } else {
      handleWrong(false);
    }
  };

  const endLevel = () => {
    onResult({ correct: false, scoreDelta: 0, loseLife: false, completedLevel: true });
  };

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
                fontSize: 16
              }}
              onFocus={(e) => (e.target.style.borderColor = theme.colors.primary)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border)}
            />
            <button
              type="submit"
              className="btn"
              style={{
                background: theme.colors.primary,
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: theme.radii.pill,
                fontWeight: 800,
                letterSpacing: 0.2,
                boxShadow: theme.shadow.sm,
                cursor: "pointer"
              }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={endLevel}
              style={{
                background: "transparent",
                color: theme.colors.textMuted,
                border: `1px solid ${theme.colors.border}`,
                padding: "12px 16px",
                borderRadius: theme.radii.pill,
                fontWeight: 700,
                boxShadow: "none",
                cursor: "pointer"
              }}
              aria-label="End level early"
            >
              Skip Level
            </button>
          </form>

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
