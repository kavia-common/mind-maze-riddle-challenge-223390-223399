# Mind Maze: The Riddle Quest – Frontend

A responsive React game where players solve riddles across levels. Correct answers add points, wrong answers or timeouts cost lives. Built with a modern Ocean Professional theme.

## Features

- Levels with increasing difficulty
- Score, lives, and per-riddle timer
- Streak-based bonus points
- Responsive layout (mobile/desktop)
- Smooth visual feedback and animations
- No hardcoded secrets; uses environment variables

## Quick Start

1. Install dependencies:
   npm install

2. Run in development:
   npm start
   App runs at http://localhost:3000

3. Build for production:
   npm run build

## Environment Variables

This app reads optional configuration at build time. Add them in a .env file in this folder.

- REACT_APP_API_BASE: Base URL for API calls (if backend used in the future)
- REACT_APP_BACKEND_URL: Alternative backend URL override
- REACT_APP_FRONTEND_URL: Public site URL (for links if needed)
- REACT_APP_WS_URL: WebSocket URL if real-time features are added
- REACT_APP_NODE_ENV: Environment label (development, staging, production)
- REACT_APP_NEXT_TELEMETRY_DISABLED: Set to "1" to disable Next telemetry (no effect here but allowed by environment template)
- REACT_APP_ENABLE_SOURCE_MAPS: "true" to keep source maps in production (use with caution)
- REACT_APP_PORT: Optional port binding for hosting environments
- REACT_APP_TRUST_PROXY: Optional hosting proxy trust switch
- REACT_APP_LOG_LEVEL: Log level when you add logging
- REACT_APP_HEALTHCHECK_PATH: Custom health path for future integrations
- REACT_APP_FEATURE_FLAGS: JSON string of feature flags if needed
- REACT_APP_EXPERIMENTS_ENABLED: "true" to toggle experimental UI paths

Example .env:
REACT_APP_NODE_ENV=development
REACT_APP_API_BASE=https://api.example.com
REACT_APP_WS_URL=wss://ws.example.com

Note: Do not commit real secrets. Environment variables are injected at build time.

## Routes

- / Landing page
- /play Game UI

## Project Structure

src/
- components/ UI components (TopBar, TimerRing, GameCard)
- data/ Riddle sets and level configuration
- hooks/ Timer hook
- pages/ HomePage and GamePage
- App.js App router
- theme.js Theme tokens and env helper

## Accessibility

- ARIA roles on timer and status elements
- Clear focus and keyboard support for inputs and buttons
- Color contrast chosen for readability

## Styling

The Ocean Professional theme uses:
- Primary: #2563EB
- Secondary: #F59E0B
- Surface: #ffffff
- Background: #f9fafb
- Text: #111827

## Notes

- No backend calls are made by default. Replace src/data/riddles.js with API-backed data when available.
- Avoid logging sensitive information. Keep secrets out of code and Git history.

## License

MIT (for template and sample code). Check your project’s licensing needs.
