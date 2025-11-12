import React from "react";
import { theme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * SettingsPanel - inline drawer to change timer and sound preference.
 *
 * @param {{ open: boolean, onClose: () => void, time: number, onTimeChange: (n:number)=>void, soundEnabled: boolean, onToggleSound: ()=>void }} props
 */
export default function SettingsPanel({ open, onClose, time, onTimeChange, soundEnabled, onToggleSound }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Game settings"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        transform: open ? "translateY(0)" : "translateY(12px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity .2s ease, transform .2s ease",
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radii.lg,
        boxShadow: theme.shadow.lg,
        padding: 16,
        width: 280,
        maxWidth: "calc(100vw - 32px)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 800, color: theme.colors.text }}>Settings</div>
        <button
          type="button"
          aria-label="Close settings"
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.pill,
            padding: "6px 10px",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <label htmlFor="timer-select" style={{ fontWeight: 700, fontSize: 13, color: theme.colors.text }}>
          Riddle timer
        </label>
        <select
          id="timer-select"
          value={String(time)}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          style={{
            width: "100%",
            marginTop: 6,
            padding: "10px 12px",
            borderRadius: theme.radii.md,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background
          }}
        >
          <option value="20">20 seconds</option>
          <option value="30">30 seconds</option>
          <option value="45">45 seconds</option>
        </select>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: theme.colors.text }}>Sound effects</div>
          <div style={{ fontSize: 12, color: theme.colors.textMuted }}>Subtle click/correct/wrong sounds</div>
        </div>
        <button
          type="button"
          aria-pressed={soundEnabled}
          onClick={onToggleSound}
          style={{
            background: soundEnabled ? theme.colors.primary : "transparent",
            color: soundEnabled ? "#fff" : theme.colors.textMuted,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.pill,
            padding: "8px 12px",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          {soundEnabled ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}
