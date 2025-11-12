import React from "react";
import { theme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * HomePage - landing with CTA to start the game
 */
export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, rgba(59,130,246,0.10), rgba(249,250,251,1))`,
        display: "grid",
        placeItems: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 840,
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
            padding: "26px 24px",
            borderBottom: `1px solid ${theme.colors.border}`
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              aria-hidden="true"
              style={{
                height: 42,
                width: 42,
                borderRadius: 10,
                background: `radial-gradient(750px circle at 0% 0%, rgba(37,99,235,.15), transparent 40%), radial-gradient(750px circle at 120% 20%, rgba(245,158,11,.2), transparent 40%), ${theme.colors.surface}`,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: theme.shadow.sm
              }}
            />
            <div>
              <div style={{ fontWeight: 900, color: theme.colors.text, fontSize: 20 }}>
                Mind Maze: The Riddle Quest
              </div>
              <div style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: 600 }}>
                Solve riddles, beat the clock, and conquer levels.
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 20px" }}>
          <p style={{ marginTop: 0, color: theme.colors.text }}>
            Each level presents a series of riddles. Answer correctly to earn points. Wrong answers or timeouts cost a life.
            Complete all levels to become the Master of the Maze!
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <a
              href="/play"
              style={{
                background: theme.colors.primary,
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: theme.radii.pill,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: theme.shadow.md
              }}
            >
              Start Game
            </a>
            <a
              href="https://reactjs.org"
              target="_blank"
              rel="noreferrer"
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
              Learn React
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: theme.colors.textMuted
            }}
          >
            Tip: This frontend reads configuration from environment variables prefixed with REACT_APP_ at build time. No secrets are hardcoded.
          </div>
        </div>
      </div>
    </div>
  );
}
