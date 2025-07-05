import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from 'src/components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router';
import React from 'react';

jest.mock('@auth0/auth0-react');

const mockLogin = jest.fn();
const mockLogout = jest.fn();

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navigation links', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLogin,
      logout: mockLogout,
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText(/Home/i)).toBeInTheDocument();

    // Use getAllByText since there are two "Products" links
    const productLinks = screen.getAllByText(/Products/i);
    expect(productLinks.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText(/Faults/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
  });

  test('calls loginWithRedirect when avatar clicked and not authenticated', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLogin,
      logout: mockLogout,
    });

    renderWithRouter(<Navbar />);
    const avatar = screen.getByAltText('avatar');
    fireEvent.click(avatar);
    expect(mockLogin).toHaveBeenCalled();
  });

  test('shows user popup when authenticated and avatar clicked', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { nickname: 'Alok', email: 'alok@example.com' },
      loginWithRedirect: mockLogin,
      logout: mockLogout,
    });

    renderWithRouter(<Navbar />);
    const avatar = screen.getByAltText('avatar');
    fireEvent.click(avatar);

    expect(screen.getByText(/Nick name: Alok/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: alok@example.com/i)).toBeInTheDocument();
  });

  test('calls logout when logout button clicked', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { nickname: 'Alok', email: 'alok@example.com' },
      loginWithRedirect: mockLogin,
      logout: mockLogout,
    });

    renderWithRouter(<Navbar />);
    const avatar = screen.getByAltText('avatar');
    fireEvent.click(avatar);

    const logoutButton = screen.getByText(/Log Out/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});
