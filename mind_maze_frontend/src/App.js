import React from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

/**
 * PUBLIC_INTERFACE
 * App - Registers simple routing and renders pages
 *
 * Routes:
 * - "/" -> HomePage
 * - "/play" -> GamePage
 */
function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Simple hashless routing without extra dependency
  const Page = path === '/play' ? GamePage : HomePage;

  // Theme attribute for potential future dark mode support
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <div className="App">
      <Page />
    </div>
  );
}

export default App;
