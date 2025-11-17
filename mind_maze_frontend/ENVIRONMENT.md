# Environment Configuration

The app reads optional React environment variables (prefixed with REACT_APP_). None are required to run locally.

- REACT_APP_FEATURE_FLAGS: comma separated flags, example: "confetti=true"
- REACT_APP_EXPERIMENTS_ENABLED: "true" enables some enhancements by default (confetti)
- REACT_APP_SUPABASE_URL: Supabase project URL (public)
- REACT_APP_SUPABASE_ANON_KEY: Supabase anon key (public). Some environments may provide REACT_APP_SUPABASE_KEY; the client supports this as a fallback but prefer REACT_APP_SUPABASE_ANON_KEY.
- REACT_APP_FRONTEND_URL: Optional. Used by auth flows for emailRedirectTo (if you enable email signups).
- REACT_APP_API_BASE: Optional. When set (e.g., http://localhost:4000), client services call the internal Node API proxy instead of direct Supabase.

Server-side (Node API) environment variables (never expose to client):
- SUPABASE_URL: Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (server-only)
- API_PORT: Optional. Defaults to 4000
- API_TRUST_PROXY: Optional "true" to set trust proxy in Express

How to configure:
1) Copy .env.example to .env or .env.local in mind_maze_frontend/
2) Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY using the values provided by your Supabase project.
3) (Optional) Set REACT_APP_API_BASE=http://localhost:4000 to route through the proxy API.
4) For the API server, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment (not in React .env).
5) Restart the dev server if it was running (CRA reads env at build time).

Health/Connectivity:
- A minimal health utility is available at src/lib/health.js
  - checkSupabaseConfig() -> validates required env presence.
  - pingSupabase() -> initializes the client and calls auth.getSession() as a lightweight connectivity check.
- Data services (Supabase-backed) live under src/lib:
  - quizService.js, questionService.js, answerService.js, scoreService.js, leaderboardService.js
  - All functions validate inputs and degrade gracefully if Supabase env vars are missing.
  - When REACT_APP_API_BASE is set, these services call the proxy API.

Notes:
- Do not place secrets in source code. Only use REACT_APP_* env variables. Supabase anon key is designed for client use.
- Server-only secrets: SUPABASE_SERVICE_ROLE_KEY must only be present in the Node process environment.
- Gameplay persistence uses Supabase; if REACT_APP_SUPABASE_URL/ANON_KEY are unset, the app runs but progress will not be saved.
