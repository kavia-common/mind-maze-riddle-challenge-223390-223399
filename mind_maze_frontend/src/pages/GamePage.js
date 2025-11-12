import React, { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import GameCard from "../components/GameCard";
import GameOver from "../components/GameOver";
import SettingsPanel from "../components/SettingsPanel";
import { LEVELS } from "../data/riddles";
import { theme, getEnv } from "../theme";
import { GameProvider, GameContext } from "../context/GameContext";

/**
 * PUBLIC_INTERFACE
 * GamePage - contains the core game loop across levels and shows final screen.
 */
function GamePageInner() {
  const {
    levelIndex, level,
    score, addScore,
    lives, loseLife,
    skipLeft, consumeSkip,
    timerLen, setTimerLen,
    soundEnabled, setSoundEnabled,
    gameOver, finished,
    resetGame, advanceLevel,
    highScore
  } = React.useContext(GameContext);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const apiBase = useMemo(
    () => getEnv("REACT_APP_BACKEND_URL", getEnv("REACT_APP_API_BASE", "")),
    []
  );
  const wsUrl = useMemo(() => getEnv("REACT_APP_WS_URL", ""), []);
  const envMode = useMemo(() => getEnv("REACT_APP_NODE_ENV", "development"), []);

  const onResult = ({ correct, scoreDelta, loseLife: lose, completedLevel }) => {
    if (correct) addScore(scoreDelta);
    if (lose) loseLife();
    if (completedLevel) advanceLevel();
  };

  const onSkipRiddle = () => {
    if (skipLeft <= 0) return;
    consumeSkip();
    // Signal GameCard to proceed handled there via prop callback (by calling 'onSkipNext')
  };

  const onRestart = () => {
    resetGame();
  };

  const headerActions = (
    <button
      type="button"
      onClick={() => setSettingsOpen((v) => !v)}
      aria-expanded={settingsOpen}
      aria-label="Open settings"
      className="btn"
      style={{
        background: "transparent",
        color: theme.colors.textMuted,
        border: `1px solid ${theme.colors.border}`,
        padding: "8px 12px",
        borderRadius: theme.radii.pill,
        fontWeight: 700,
        boxShadow: "none",
        cursor: "pointer"
      }}
    >
      ⚙️ Settings
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, rgba(59,130,246,0.10), rgba(249,250,251,1))`,
      }}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 20 }}>
        <TopBar
          level={level.id}
          levelName={level.name}
          score={score}
          lives={lives}
          maxLives={level.lives}
        />
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          {headerActions}
          <div style={{ width: 10 }} />
          <div
            style={{
              background: "transparent",
              color: theme.colors.textMuted,
              fontSize: 12,
              paddingTop: 8
            }}
          >
            High Score: <strong style={{ color: theme.colors.primary }}>{highScore}</strong> • Skip Left: {skipLeft}
          </div>
        </div>
      </div>

      {envMode !== "production" && (
        <div style={{ textAlign: "center", color: theme.colors.textMuted, fontSize: 12 }}>
          Env: {envMode}{apiBase ? ` • API: ${apiBase}` : ""}{wsUrl ? ` • WS: ${wsUrl}` : ""}
        </div>
      )}

      {!gameOver && !finished && (
        <GameCard
          level={{ ...level, timePerRiddle: timerLen }}
          onResult={onResult}
          skipAllowed={skipLeft > 0}
          onSkip={onSkipRiddle}
        />
      )}

      {(gameOver || finished) && (
        <GameOver score={score} onRestart={onRestart} finished={finished} />
      )}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        time={timerLen}
        onTimeChange={setTimerLen}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
      />

      <div style={{ height: 40 }} />
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * GamePage - provider wrapper
 */
export default function GamePage() {
  return (
    <GameProvider>
      <GamePageInner />
    </GameProvider>
  );
}
