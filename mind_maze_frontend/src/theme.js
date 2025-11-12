//
// Ocean Professional theme and utility helpers
//

// PUBLIC_INTERFACE
export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB",     // blue-600
    secondary: "#F59E0B",   // amber-500
    success: "#22C55E",     // green-500
    error: "#EF4444",       // red-500
    background: "#f9fafb",  // gray-50
    surface: "#ffffff",
    text: "#111827",        // gray-900
    textMuted: "#6b7280",   // gray-500
    border: "rgba(0,0,0,0.08)"
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    pill: "999px",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 6px 20px rgba(2, 6, 23, 0.08)",
    lg: "0 12px 40px rgba(2, 6, 23, 0.12)"
  },
  gradient: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(249,250,251,1))"
};

// PUBLIC_INTERFACE
export function getEnv(key, fallback = "") {
  /**
   * Safely read a React env variable and return fallback if not present.
   * Never hardcode secrets in code.
   */
  const value = process.env[key];
  return (value === undefined || value === null) ? fallback : value;
}
