import React, { useState, useEffect } from 'react';
import './Products.css';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';

// eslint-disable-next-line react-hooks/exhaustive-deps
function ProductUploader() {
  const { getAccessTokenSilently } = useAuth0();
  const [file, setFile] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);

  const api = createApi({ getAccessTokenSilently });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPopupMessage(null);
  };

  const showPopup = (text, type) => {
    setPopupMessage({ text, type });
    setTimeout(() => setPopupMessage(null), 4000);
  };

  const fetchHistory = async () => {
    try {
      const res = await api.fetchUploadHistory();
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch upload history:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a CSV file first.');
    setUploading(true);

    const fileName = `uploads/${Date.now()}_${file.name}`;

    try {
      const { upload_url, file_url } = (await api.getUploadPresignedUrl(fileName, file.type)).data;
      await api.uploadFileToPresignedUrl(upload_url, file, file.type); 
      const saveRes = await api.saveUploadedFileRecord({
        file_name: fileName,
        file_url: file_url,
        uploaded_by: 'admin',
      });

      showPopup('✅ Upload successful! Products created.', 'success');
      setFile(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
      showPopup('❌ Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="uploader-container">
      {popupMessage && (
        <div className={`popup-message ${popupMessage.type}`}>
          {popupMessage.text}
        </div>
      )}

      <h2 className="uploader-heading">Upload Products via CSV</h2>
      <div className="upload-section">
        <label className="file-input-label">
          <input type="file" accept=".csv" onChange={handleFileChange} />
          Choose CSV File
        </label>
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <h3 className="history-heading">Upload History</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Uploaded By</th>
            <th>Date</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row, index) => (
            <tr key={index}>
              <td>{row.file_name}</td>
              <td>{row.uploaded_by}</td>
              <td>{new Date(row.uploaded_at).toLocaleString()}</td>
              <td>
                <a href={row.file_url} target="_blank" rel="noopener noreferrer">Download</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductUploader;
