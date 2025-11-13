import { render, screen } from '@testing-library/react';
import App from './App';
import { ProgressProvider } from './context/ProgressContext.jsx';

test('renders start screen', () => {
  render(
    <ProgressProvider>
      <App />
    </ProgressProvider>
  );
  // Use an accessible, unique selector: the Start screen hero heading
  const heading = screen.getByRole('heading', { name: /welcome to mind maze/i });
  expect(heading).toBeInTheDocument();
});
