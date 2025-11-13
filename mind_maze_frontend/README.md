# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **Persistence (Supabase)**: Saves player progress (score, level, lives) for authenticated and anonymous users

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Supabase

This app is pre-wired to use Supabase for auth, database, and storage, including gameplay persistence.

1) Create a `.env` file using `.env.example` as a template and set:
```
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_public_anon_key
```

2) Apply SQL to create the scores table and policies:

- Open Supabase SQL Editor and run the file:
  mind_maze_frontend/supabase.sql

This creates public.scores with unique constraints and RLS policies supporting both authenticated users (user_id) and anonymous sessions (anon_id via deviceId).

3) Use the provided client and hooks:

- Client:
```js
import supabase, { getSupabaseClient } from './src/lib/supabaseClient';
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
- For signUp email confirmations, you can pass options.emailRedirectTo to signUpWithEmail.
  Example:
  signUpWithEmail(email, password, { emailRedirectTo: process.env.REACT_APP_FRONTEND_URL });

## Customization

### Colors

The main brand colors are defined as CSS variables, see `src/theme.css`.

### Components

This template uses pure HTML/CSS components instead of a UI framework.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
