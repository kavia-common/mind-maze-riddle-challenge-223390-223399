import React from "react";
import { theme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * GameOver - end screen showing current and high score with actions.
 *
 * @param {{ score: number, onRestart: () => void, finished?: boolean }} props
 */
export default function GameOver({ score, onRestart, finished = false }) {
  const high = Number.parseInt(localStorage.getItem("mindmaze_highscore") || "0", 10);
  const newHigh = Math.max(high || 0, score || 0);

  // Persist high score once on mount
  React.useEffect(() => {
    try {
      if (newHigh !== high) {
        localStorage.setItem("mindmaze_highscore", String(newHigh));
      }
    } catch {
      // Ignore storage failures (private mode, quota, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "30px auto",
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radii.lg,
        boxShadow: theme.shadow.lg,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          background: theme.gradient,
          padding: "22px 20px",
          borderBottom: `1px solid ${theme.colors.border}`
        }}
      >
        <div style={{ fontWeight: 900, color: theme.colors.text, fontSize: 22 }}>
          {finished ? "Maze Conquered!" : "Game Over"}
        </div>
        <div style={{ fontSize: 14, color: theme.colors.textMuted }}>
          {finished ? "You completed all levels. Outstanding!" : "You ran out of lives. Try again!"}
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: theme.colors.text }}>
            Final Score: <span style={{ color: theme.colors.secondary }}>{score}</span>
          </div>
          <div
            style={{
              background: "rgba(37,99,235,0.08)",
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.border}`,
              padding: "8px 12px",
              borderRadius: theme.radii.pill,
              fontWeight: 700
            }}
            aria-label={`High score ${newHigh}`}
          >
            High Score: {newHigh}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onRestart}
            style={{
              background: theme.colors.primary,
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: theme.radii.pill,
              fontWeight: 800,
              boxShadow: theme.shadow.sm,
              cursor: "pointer"
            }}
          >
            Restart
          </button>
          <a
            href="/"
            style={{
              background: "transparent",
              color: theme.colors.textMuted,
              border: `1px solid ${theme.colors.border}`,
              padding: "12px 16px",
              borderRadius: theme.radii.pill,
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
