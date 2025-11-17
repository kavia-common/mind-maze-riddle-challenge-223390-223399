# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **Persistence (Supabase)**: Saves player progress (score, level, lives) for authenticated and anonymous users
- **API Proxy (Express)**: Optional internal API that proxies to Supabase using a server-side service role key.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app (frontend) in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run start:api`

Starts the internal API proxy on port 4000 by default (requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment).

### `npm run dev`

Runs both the frontend and the API proxy concurrently (non-blocking). Requires the server-side env vars set in your shell or process manager.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Supabase Configuration

This app is pre-wired to use Supabase for auth, database, and storage, including gameplay persistence.

1) Create a `.env` (or `.env.local`) file using `.env.example` as a template and set:
```
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_public_anon_key
# Optional: route through proxy:
REACT_APP_API_BASE=http://localhost:4000
```

2) Apply SQL to create the tables and policies:

- Open Supabase SQL Editor and run:
  - mind_maze_frontend/supabase.sql
  - mind_maze_frontend/assets/supabase_tables_extra.sql

Or print both with:
```
npm run setup:sql
```

3) Use the provided client and hooks:

- Client (path inside the app source):
```js
import supabase, { getSupabaseClient } from './src/lib/supabaseClient';
```

- Optional health checks:
```js
import { checkSupabaseConfig, pingSupabase } from './src/lib/health';
```

- Auth hook:
```jsx
import useSupabaseAuth from './src/hooks/useSupabaseAuth';
```

- Progress provider/hook (auto-wired in src/index.js):
```jsx
import { useProgress } from './src/context/ProgressContext.jsx';

function HUD() {
  const { progress, setProgress } = useProgress();
  // Example: award 50 points
  const award = () => setProgress({ score: progress.score + 50 });
  // ...
}
```

Notes:
- The provider loads saved progress on app mount and persists changes (upsert) whenever score, level, or lives change.
- Anonymous sessions use a stable deviceId stored in localStorage.
- For signUp email confirmations, pass options.emailRedirectTo to signUpWithEmail.
  Example:
  signUpWithEmail(email, password, { emailRedirectTo: process.env.REACT_APP_FRONTEND_URL });
- Secrets are never hardcoded in code; the client reads from process.env at build time. The server-only service key must only be configured in the API process environment.

## Customization

### Colors

The main brand colors are defined as CSS variables, see `src/theme.css`.

### Components

This template uses pure HTML/CSS components instead of a UI framework.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
