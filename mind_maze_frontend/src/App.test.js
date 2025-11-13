import { render, screen } from '@testing-library/react';
import App from './App';
import { ProgressProvider } from './context/ProgressContext.jsx';

test('renders start screen', () => {
  render(
    <ProgressProvider>
      <App />
    </ProgressProvider>
  );
  const start = screen.getByText(/Mind Maze/i);
  expect(start).toBeInTheDocument();
});
