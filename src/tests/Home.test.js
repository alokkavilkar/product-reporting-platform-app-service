import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from 'src/components/Home';

describe('Home Component', () => {
  test('renders title, subtitle, button, and image', () => {
    render(<Home />);

    // Check heading
    expect(screen.getByText(/Welcome to the Product Inspection System/i)).toBeInTheDocument();

    // Check subtitle
    expect(screen.getByText(/Ensure quality\. Track inspections\. Manage faults efficiently\./i)).toBeInTheDocument();

    // Check button
    const button = screen.getByRole('button', { name: /Get Started/i });
    expect(button).toBeInTheDocument();

    // Check image
    const img = screen.getByAltText(/Inspection/i);
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
  });
});
