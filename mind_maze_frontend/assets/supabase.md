# Supabase Integration Notes (Mind Maze)

This app uses Supabase for:
- Auth (optional, via anon/public client)
- Persisting progress in `public.scores` (already defined in supabase.sql)
- Quizzes, Questions, Answers, Leaderboard (additional tables below)

Environment (no secrets hardcoded):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- Optional: REACT_APP_FRONTEND_URL for auth email redirects
- Optional: REACT_APP_API_BASE to target the internal Node proxy (recommended in development/production)

Server-only (Node API):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Client creation:
- See src/lib/supabaseClient.js (gracefully degrades if env vars are missing)
- When REACT_APP_API_BASE is set, data services use the proxy API; otherwise they call Supabase directly.

Health utilities:
- src/lib/health.js

Progress/Score:
- src/lib/progressService.js
- src/context/ProgressContext.jsx
- src/lib/scoreService.js

New services:
- src/lib/quizService.js
- src/lib/questionService.js
- src/lib/answerService.js
- src/lib/leaderboardService.js

## API Proxy

A lightweight Node/Express API lives in `server/index.js`. It uses the Supabase service role key on the server to:
- Validate inputs and proxy requests to Supabase
- Expose REST endpoints:
  - GET /api/quizzes
  - GET /api/quizzes/:id
  - POST /api/quizzes
  - PATCH /api/quizzes/:id
  - GET /api/quizzes/:quiz_id/questions
  - POST /api/quizzes/:quiz_id/questions
  - PATCH /api/questions/:id
  - POST /api/answers
  - GET /api/answers?quiz_id=&user_id|anon_id
  - GET /api/score?user_id|anon_id
  - POST /api/score
  - GET /api/leaderboard?limit=&offset=
  - GET /health

Start it with:
- npm run start:api
Or run both app and API:
- npm run dev

Configure your client to use it:
- Set REACT_APP_API_BASE=http://localhost:4000

Server env (never expose to client):
- SUPABASE_URL=...
- SUPABASE_SERVICE_ROLE_KEY=...

## SQL for Tables

Run these in Supabase SQL editor:

- scores and policies: mind_maze_frontend/supabase.sql
- quizzes, questions, answers: mind_maze_frontend/assets/supabase_tables_extra.sql

You can also print both via:
- npm run setup:sql

Notes:
- Leaderboard reads from `public.scores`. Ensure `scores` policies from supabase.sql are applied.
- Anonymous flows rely on an unguessable `anon_id` stored on-device (`getOrCreateDeviceId`).
- Adjust policies to your security model as needed.
