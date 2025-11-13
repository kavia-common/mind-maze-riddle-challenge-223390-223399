import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { ProgressProvider } from '../context/ProgressContext.jsx';

describe('Mind Maze basic flow', () => {
  test('renders start and can start game', () => {
    render(
      <ProgressProvider>
        <App />
      </ProgressProvider>
    );
    const startBtn = screen.getAllByText(/start/i)[0];
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);
    expect(screen.getByText(/Riddle 1 of/i)).toBeInTheDocument();
  });
});
