import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reports from 'src/components/Reports';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';


// Mock Auth0
jest.mock('@auth0/auth0-react');
jest.mock('../api');

const mockGetAccessTokenSilently = jest.fn();
const mockResolveFault = jest.fn();
const mockFetchFaultReports = jest.fn();

const mockReports = [
  {
    id: 1,
    product: 'Drill Machine',
    status: 'faulty',
    description: 'Power issue',
    image_url: 'https://example.com/image1.jpg'
  }
];

describe('Reports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently
    });

    createApi.mockReturnValue({
      fetchFaultReports: mockFetchFaultReports,
      resolveFault: mockResolveFault
    });

    mockFetchFaultReports.mockResolvedValue({ data: mockReports });
  });

  test('renders loading spinner initially', async () => {
    render(<Reports />);
    expect(screen.getByLabelText(/Loading Reports/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading Reports/i)).not.toBeInTheDocument();
    });
  });

  test('renders fetched fault reports', async () => {
    render(<Reports />);

    expect(await screen.findByText(/Drill Machine/i)).toBeInTheDocument();
    expect(screen.getByText(/Power issue/i)).toBeInTheDocument();
  });

  test('opens and closes modal when report clicked', async () => {
    render(<Reports />);
    const card = await screen.findByText(/Drill Machine/i);

    fireEvent.click(card);
    expect(screen.getByPlaceholderText(/Enter remarks for resolution/i)).toBeInTheDocument();

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Enter remarks for resolution/i)).not.toBeInTheDocument();
    });
  });

  test('shows alert if remarks are empty when resolving', async () => {
    global.alert = jest.fn();

    render(<Reports />);
    fireEvent.click(await screen.findByText(/Drill Machine/i));

    const resolveBtn = screen.getByText(/Resolve/i);
    fireEvent.click(resolveBtn);

    expect(global.alert).toHaveBeenCalledWith('Remarks are required.');
  });

  test('calls resolveFault and reloads reports', async () => {
    mockResolveFault.mockResolvedValue({});
    render(<Reports />);
    fireEvent.click(await screen.findByText(/Drill Machine/i));

    const textarea = screen.getByPlaceholderText(/Enter remarks for resolution/i);
    fireEvent.change(textarea, { target: { value: 'Fixed the wire' } });

    const resolveBtn = screen.getByText(/Resolve/i);
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(mockResolveFault).toHaveBeenCalledWith(1, {
        remarks: 'Fixed the wire',
        resolved_by: 'engineer'
      });
    });

    expect(mockFetchFaultReports).toHaveBeenCalledTimes(2); // initial + after resolve
  });
});
