import React from "react";
import { theme } from "../theme";

/**
 * TopBar - sticky header with score, level, and lives
 *
 * PUBLIC_INTERFACE
 * @param {{level: number, levelName: string, score: number, lives: number, maxLives: number}} props
 */
export default function TopBar({ level, levelName, score, lives, maxLives }) {
  const hearts = [];
  for (let i = 0; i < maxLives; i++) {
    const filled = i < lives;
    hearts.push(
      <span
        key={i}
        aria-hidden="true"
        style={{
          color: filled ? theme.colors.secondary : "rgba(0,0,0,0.15)",
          marginRight: 4,
          filter: filled ? "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" : "none"
        }}
      >
        {filled ? "❤️" : "🤍"}
      </span>
    );
  }

  return (
    <div
      role="region"
      aria-label="Game status bar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: "12px 16px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        boxShadow: theme.shadow.sm
      }}
    >
      <div style={{ textAlign: "left", fontWeight: 600, color: theme.colors.text }}>
        Level {level} • <span style={{ color: theme.colors.textMuted, fontWeight: 500 }}>{levelName}</span>
      </div>
      <div
        style={{
          background: theme.gradient,
          padding: "6px 14px",
          borderRadius: theme.radii.pill,
          fontWeight: 700,
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.border}`
        }}
      >
        Score: <span style={{ color: theme.colors.text }}>{score}</span>
      </div>
      <div style={{ textAlign: "right" }} aria-label={`Lives ${lives} of ${maxLives}`}>
        {hearts}
      </div>
    </div>
  );
}
