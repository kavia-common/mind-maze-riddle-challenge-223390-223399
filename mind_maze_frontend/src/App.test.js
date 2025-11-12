import { render, screen } from '@testing-library/react';
import App from './App';

test('renders start screen', () => {
  render(<App />);
  const start = screen.getByText(/Mind Maze/i);
  expect(start).toBeInTheDocument();
});
