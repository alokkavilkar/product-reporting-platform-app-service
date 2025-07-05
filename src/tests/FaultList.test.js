import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FaultList from 'src/components/FaultList';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import { MemoryRouter } from 'react-router';

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

// Mock API
jest.mock('../api', () => ({
  createApi: jest.fn(),
}));

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockedNavigate,
}));

describe('FaultList', () => {
  const mockFetchProducts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Auth0 mock
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn(),
    });

    // Setup API mock
    createApi.mockReturnValue({
      fetchProducts: mockFetchProducts,
    });
  });

  it('shows loader initially', () => {
    mockFetchProducts.mockReturnValue(new Promise(() => {})); // never resolves
    render(<FaultList />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText(/loading faults/i)).toBeInTheDocument();
  });

  it('displays error on fetch failure', async () => {
    mockFetchProducts.mockRejectedValue(new Error('API Error'));

    render(<FaultList />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText(/500 - Internal Server Error/i)).toBeInTheDocument();
    });
  });

  it('displays message when no faulty products are found', async () => {
    mockFetchProducts.mockResolvedValue({
      data: [
        { id: 1, name: 'Product 1', status: 'pass', type: 'type-a' },
        { id: 2, name: 'Product 2', status: 'PASS', type: 'type-b' },
      ],
    });

    render(<FaultList />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText(/no faults found/i)).toBeInTheDocument();
    });
  });

  it('renders faulty products', async () => {
    mockFetchProducts.mockResolvedValue({
      data: [
        { id: 1, name: 'Product 1', status: 'Faulty', type: 'Widget' },
        { id: 2, name: 'Product 2', status: 'Pass', type: 'Gadget' },
      ],
    });

    render(<FaultList />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText(/product 1/i)).toBeInTheDocument();
      expect(screen.getByText(/widget/i)).toBeInTheDocument();
      expect(screen.getByText(/faulty/i)).toBeInTheDocument();
    });
  });

  it('navigates on clicking a product card', async () => {
    mockFetchProducts.mockResolvedValue({
      data: [
        { id: 5, name: 'Bad Product', status: 'Faulty', type: 'Machine' },
      ],
    });

    render(<FaultList />, { wrapper: MemoryRouter });

    const card = await screen.findByText(/bad product/i);
    fireEvent.click(card);

    expect(mockedNavigate).toHaveBeenCalledWith('/report-fault/5');
  });
});
