import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProductList from 'src/components/ProductList';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from 'src/api';
import { MemoryRouter } from 'react-router';

// Mocks
jest.mock('@auth0/auth0-react');
jest.mock('src/api');

describe('ProductList', () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockFetchProducts = jest.fn();

  beforeAll(() => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: jest.fn() },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    createApi.mockReturnValue({
      fetchProducts: mockFetchProducts,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

  it('shows loader while fetching', () => {
    mockFetchProducts.mockReturnValue(new Promise(() => {})); // never resolves
    renderComponent();
    expect(screen.getByLabelText(/loading products/i)).toBeInTheDocument();
  });

  it('displays error on fetch failure and reloads on click', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchProducts.mockRejectedValueOnce(new Error('Server error'));

    renderComponent();

    expect(await screen.findByText(/500 - internal server error/i)).toBeInTheDocument();
    expect(screen.getByText(/unable to load products/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/try again/i));
    expect(window.location.reload).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('renders "no products found" when API returns empty list', async () => {
    mockFetchProducts.mockResolvedValueOnce({ data: [] });

    renderComponent();

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  it('renders product cards correctly with status badges', async () => {
    mockFetchProducts.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Fan Motor', type: 'Electrical', status: 'pending' },
        { id: 2, name: 'Control Panel', type: 'Electronics', status: 'inspected' },
      ],
    });

    renderComponent();

    expect(await screen.findByText(/fan motor/i)).toBeInTheDocument();
    expect(screen.getByText(/control panel/i)).toBeInTheDocument();

    expect(screen.getAllByText(/pending|inspected/i).length).toBe(2);

    const statusClasses = screen.getAllByText(/pending|inspected/i).map((node) =>
      node.className.includes('status-')
    );
    expect(statusClasses).toEqual([true, true]);
  });
});
