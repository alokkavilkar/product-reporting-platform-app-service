import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProtectedRoute from 'src/components/ProtectedRoute';
import { useAuth0 } from '@auth0/auth0-react';

// Mock Auth0
jest.mock('@auth0/auth0-react');

describe('ProtectedRoute', () => {
  const mockLoginWithRedirect = jest.fn();

  const setupAuth0Mock = ({ isLoading, isAuthenticated }) => {
    useAuth0.mockReturnValue({
      isLoading,
      isAuthenticated,
      loginWithRedirect: mockLoginWithRedirect,
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when loading', () => {
    setupAuth0Mock({ isLoading: true, isAuthenticated: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByLabelText(/loading products/i)).toBeInTheDocument();
  });

  it('shows login popup when not authenticated', async () => {
    setupAuth0Mock({ isLoading: false, isAuthenticated: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/login required/i)).toBeInTheDocument();
    expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls loginWithRedirect when login button is clicked', () => {
    setupAuth0Mock({ isLoading: false, isAuthenticated: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    const button = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(button);

    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  it('renders children when authenticated', () => {
    setupAuth0Mock({ isLoading: false, isAuthenticated: true });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});
