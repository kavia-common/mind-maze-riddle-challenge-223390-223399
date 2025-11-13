# Environment Configuration

The app reads optional React environment variables (prefixed with REACT_APP_). None are required to run locally.

- REACT_APP_FEATURE_FLAGS: comma separated flags, example: "confetti=true"
- REACT_APP_EXPERIMENTS_ENABLED: "true" enables some enhancements by default (confetti)
- REACT_APP_SUPABASE_URL: Supabase project URL (public)
- REACT_APP_SUPABASE_ANON_KEY: Supabase anon key (public)
- REACT_APP_FRONTEND_URL: Optional. Used by auth flows for emailRedirectTo (if you enable email signups).

Notes:
- Do not place secrets in these variables. Supabase anon key is safe for client use.
- Gameplay persistence uses Supabase; if REACT_APP_SUPABASE_URL/ANON_KEY are unset, the app runs but progress will not be saved.
