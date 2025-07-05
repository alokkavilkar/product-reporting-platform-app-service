import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import InspectProduct from 'src/components/InspectProduct';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import { MemoryRouter } from 'react-router';
import { act } from 'react';

// Mocks
jest.mock('@auth0/auth0-react');
jest.mock('../api');

const mockGetAccessTokenSilently = jest.fn();
const mockInspectProduct = jest.fn();
const mockFetchProducts = jest.fn();

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

describe('InspectProduct Component', () => {
  const renderComponent = (id = '5') =>
    render(
      <MemoryRouter>
        <InspectProduct productId={id} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    createApi.mockReturnValue({
      inspectProduct: mockInspectProduct,
      fetchProducts: mockFetchProducts,
    });

    mockFetchProducts.mockResolvedValue({
      data: [{ id: 5, name: 'Gadget Pro' }],
    });
  });

  it('fetches and displays product name', async () => {
    renderComponent();

    // Better to assert separately
    expect(await screen.findByText('Product:')).toBeInTheDocument();
    expect(await screen.findByText('Gadget Pro')).toBeInTheDocument();
  });

  it('submits inspection with valid data', async () => {
    jest.useFakeTimers();
    mockInspectProduct.mockResolvedValue({});

    renderComponent();

    const textarea = await screen.findByPlaceholderText(/add inspection notes/i);
    fireEvent.change(textarea, { target: { value: 'Looks good' } });

    await act(async () => {
      fireEvent.click(screen.getByText(/submit inspection/i));
    });

    expect(mockInspectProduct).toHaveBeenCalledWith('5', {
      result: 'pass',
      inspection_notes: 'Looks good',
      inspected_by: 1,
    });

    expect(await screen.findByText(/inspection submitted successfully/i)).toBeInTheDocument();

    // Simulate 1.5s delay for redirect
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });

    jest.useRealTimers();
  });

  it('shows error message on API failure', async () => {
    mockInspectProduct.mockRejectedValue(new Error('Network Error'));

    renderComponent();

    const textarea = await screen.findByPlaceholderText(/add inspection notes/i);
    fireEvent.change(textarea, { target: { value: 'Failure test' } });

    await act(async () => {
      fireEvent.click(screen.getByText(/submit inspection/i));
    });

    expect(await screen.findByText(/failed to submit inspection/i)).toBeInTheDocument();
  });
});
