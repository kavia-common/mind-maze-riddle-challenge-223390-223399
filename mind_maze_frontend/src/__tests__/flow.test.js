import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Mind Maze basic flow', () => {
  test('renders start and can start game', () => {
    render(<App />);
    const startBtn = screen.getAllByText(/start/i)[0];
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);
    expect(screen.getByText(/Riddle 1 of/i)).toBeInTheDocument();
  });
});
