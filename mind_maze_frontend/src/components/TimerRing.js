import React from "react";
import { theme } from "../theme";

/**
 * TimerRing - circular countdown progress
 *
 * PUBLIC_INTERFACE
 * @param {{secondsLeft: number, percent: number}} props
 */
export default function TimerRing({ secondsLeft, percent }) {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  const color =
    percent > 60 ? theme.colors.primary : percent > 30 ? theme.colors.secondary : theme.colors.error;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Time left ${secondsLeft} seconds`}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 0.2s linear, stroke 0.2s linear" }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: theme.colors.text,
          transform: "translateY(1px)"
        }}
      >
        {secondsLeft}
      </span>
    </div>
  );
}
