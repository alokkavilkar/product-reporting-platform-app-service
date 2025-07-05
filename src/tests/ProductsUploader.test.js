import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductUploader from 'src/components/Products';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from 'src/api';
import { MemoryRouter } from 'react-router';

jest.mock('@auth0/auth0-react');
jest.mock('src/api');

const createFile = (name = 'products.csv', type = 'text/csv') =>
  new File(['id,name'], name, { type });

describe('ProductUploader', () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockGetUploadPresignedUrl = jest.fn();
  const mockUploadFileToPresignedUrl = jest.fn();
  const mockSaveUploadedFileRecord = jest.fn();
  const mockFetchUploadHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    createApi.mockReturnValue({
      getUploadPresignedUrl: mockGetUploadPresignedUrl,
      uploadFileToPresignedUrl: mockUploadFileToPresignedUrl,
      saveUploadedFileRecord: mockSaveUploadedFileRecord,
      fetchUploadHistory: mockFetchUploadHistory,
    });
  });

  const renderComponent = async () => {
    await waitFor(() =>
      render(
        <MemoryRouter>
          <ProductUploader />
        </MemoryRouter>
      )
    );
  };

  it('loads upload history on mount', async () => {
    mockFetchUploadHistory.mockResolvedValueOnce({ data: [] });
    await renderComponent();
    await waitFor(() => expect(mockFetchUploadHistory).toHaveBeenCalled());
  });

  it('handles file selection', async () => {
    mockFetchUploadHistory.mockResolvedValueOnce({ data: [] });
    await renderComponent();
    const file = createFile();
    const input = screen.getByLabelText(/choose csv file/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.files[0]).toEqual(file);
  });

  it('uploads file and shows success message', async () => {
    const file = createFile();
    mockFetchUploadHistory.mockResolvedValueOnce({ data: [] });
    mockGetUploadPresignedUrl.mockResolvedValueOnce({
      data: {
        upload_url: 'https://s3.fake/upload',
        file_url: 'https://s3.fake/products.csv',
      },
    });
    mockUploadFileToPresignedUrl.mockResolvedValueOnce({});
    mockSaveUploadedFileRecord.mockResolvedValueOnce({ data: { upload_id: 1 } });

    await renderComponent();

    const input = screen.getByLabelText(/choose csv file/i);
    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    expect(await screen.findByText(/upload successful/i)).toBeInTheDocument();
    expect(mockGetUploadPresignedUrl).toHaveBeenCalled();
    expect(mockUploadFileToPresignedUrl).toHaveBeenCalled();
    expect(mockSaveUploadedFileRecord).toHaveBeenCalled();
  });

  it('shows error popup on upload failure', async () => {
    const file = createFile();
    mockFetchUploadHistory.mockResolvedValueOnce({ data: [] });
    mockGetUploadPresignedUrl.mockRejectedValueOnce(new Error('S3 Error'));

    await renderComponent();

    const input = screen.getByLabelText(/choose csv file/i);
    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    expect(await screen.findByText(/upload failed/i)).toBeInTheDocument();
  });

  it('renders upload history in table', async () => {
    mockFetchUploadHistory.mockResolvedValueOnce({
      data: [
        {
          file_name: 'products.csv',
          uploaded_by: 'admin',
          uploaded_at: '2024-07-01T10:00:00Z',
          file_url: 'https://s3.fake/products.csv',
        },
      ],
    });

    await renderComponent();

    expect(await screen.findByText(/products.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/download/i)).toHaveAttribute('href', expect.stringContaining('products.csv'));
  });
});
