import React from "react";
import { theme } from "../theme";

/**
 * PUBLIC_INTERFACE
 * FeedbackBanner - announces correctness with subtle animation and ARIA live updates.
 *
 * @param {{ type: 'success'|'error'|'info'|null, message?: string }} props
 */
export default function FeedbackBanner({ type, message }) {
  if (!type) return null;

  const styles = {
    base: {
      borderRadius: theme.radii.md,
      padding: "10px 12px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      transition: "transform .15s ease, opacity .2s ease",
      transform: "translateY(0)",
      opacity: 1
    },
    success: {
      background: "rgba(34,197,94,0.10)",
      color: theme.colors.success,
      border: `1px solid rgba(34,197,94,0.25)`
    },
    error: {
      background: "rgba(239,68,68,0.10)",
      color: theme.colors.error,
      border: `1px solid rgba(239,68,68,0.25)`
    },
    info: {
      background: "rgba(37,99,235,0.10)",
      color: theme.colors.primary,
      border: `1px solid rgba(37,99,235,0.20)`
    }
  };

  const variant = type === "success" ? styles.success : type === "error" ? styles.error : styles.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ ...styles.base, ...variant }}
    >
      <span aria-hidden="true">
        {type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️"}
      </span>
      <span>{message ?? (type === "success" ? "Correct!" : type === "error" ? "Try again" : "Ready")}</span>
    </div>
  );
}
