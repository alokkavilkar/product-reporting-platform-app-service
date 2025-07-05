import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FaultReportPage from 'src/components/FaultReportPage';
import { useParams, useNavigate } from 'react-router';
import FaultReportForm from 'src/components/FormReportForm';

// Mock react-router
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock form
jest.mock('src/components/FormReportForm', () => jest.fn(() => <div>Mock FaultReportForm</div>));

describe('FaultReportPage', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ productId: '42' });
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders correctly with productId', () => {
    render(<FaultReportPage />);

    expect(screen.getByText(/← Back to Faults/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock FaultReportForm/i)).toBeInTheDocument();

    // Check prop forwarding
    expect(FaultReportForm).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '42',
        onSuccess: expect.any(Function),
      }),
      {}
    );
  });

  it('navigates back when back button is clicked', () => {
    render(<FaultReportPage />);
    fireEvent.click(screen.getByText(/← Back to Faults/i));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls navigate(-1) on successful form submission', () => {
    let onSuccessCallback;
    FaultReportForm.mockImplementation(({ onSuccess }) => {
      onSuccessCallback = onSuccess;
      return <div>Mocked Form</div>;
    });

    render(<FaultReportPage />);
    onSuccessCallback();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
