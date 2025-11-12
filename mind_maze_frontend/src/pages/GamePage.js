import React, { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import GameCard from "../components/GameCard";
import { LEVELS } from "../data/riddles";
import { theme, getEnv } from "../theme";

/**
 * PUBLIC_INTERFACE
 * GamePage - contains the core game loop across levels and shows final screen.
 */
export default function GamePage() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [livesRemaining, setLivesRemaining] = useState(LEVELS[0].lives);
  const [gameOver, setGameOver] = useState(false);
  const [finished, setFinished] = useState(false);

  const level = LEVELS[levelIndex];
  const maxLives = level.lives;

  const apiBase = useMemo(
    () =>
      getEnv("REACT_APP_BACKEND_URL",
        getEnv("REACT_APP_API_BASE", "")),
    []
  );
  const wsUrl = useMemo(() => getEnv("REACT_APP_WS_URL", ""), []);
  const envMode = useMemo(() => getEnv("REACT_APP_NODE_ENV", "development"), []);

  const onResult = ({ correct, scoreDelta, loseLife, completedLevel }) => {
    if (correct) {
      setScore((s) => s + scoreDelta);
    }
    if (loseLife) {
      setLivesRemaining((l) => Math.max(0, l - 1));
    }
    // Level completion
    if (completedLevel) {
      const isLast = levelIndex >= LEVELS.length - 1;
      if (isLast) {
        setFinished(true);
        return;
      }
      // move to next level
      const nextIndex = Math.min(LEVELS.length - 1, levelIndex + 1);
      setLevelIndex(nextIndex);
      setLivesRemaining(LEVELS[nextIndex].lives);
    }
  };

  // If lives drop to zero -> game over
  React.useEffect(() => {
    if (livesRemaining <= 0 && !finished) {
      setGameOver(true);
    }
  }, [livesRemaining, finished]);

  const resetGame = () => {
    setLevelIndex(0);
    setScore(0);
    setLivesRemaining(LEVELS[0].lives);
    setGameOver(false);
    setFinished(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background
      }}
    >
      <TopBar
        level={level.id}
        levelName={level.name}
        score={score}
        lives={livesRemaining}
        maxLives={maxLives}
      />

      {/* Environment note for developers, not user secrets */}
      {envMode !== "production" && (
        <div style={{ textAlign: "center", color: theme.colors.textMuted, fontSize: 12, marginTop: 8 }}>
          Env: {envMode}{apiBase ? ` • API: ${apiBase}` : ""}{wsUrl ? ` • WS: ${wsUrl}` : ""}
        </div>
      )}

      {!gameOver && !finished && (
        <GameCard level={level} onResult={onResult} />
      )}

      {(gameOver || finished) && (
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
            <div style={{ fontWeight: 800, color: theme.colors.text }}>
              {gameOver ? "Game Over" : "Congratulations!"}
            </div>
            <div style={{ fontSize: 14, color: theme.colors.textMuted }}>
              {gameOver ? "You ran out of lives." : "You mastered the Mind Maze."}
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: theme.colors.text }}>
              Final Score: <span style={{ color: theme.colors.secondary }}>{score}</span>
            </div>
            <div style={{ marginTop: 14, color: theme.colors.textMuted }}>
              {finished
                ? "Brilliant! You completed all levels. Try again to beat your score."
                : "Don't give up! Try again and push further into the maze."}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={resetGame}
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
                Play Again
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
                Back to Home
              </a>
            </div>
          </div>
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
