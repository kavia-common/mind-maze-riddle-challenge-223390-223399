import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home heading', () => {
  render(<App />);
  const el = screen.getByText(/Mind Maze: The Riddle Quest/i);
  expect(el).toBeInTheDocument();
});
