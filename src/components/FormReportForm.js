import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import './FaultReportForm.css';
import PropTypes from 'prop-types';

// eslint-disable-next-line react-hooks/exhaustive-deps
function FaultReportForm({ productId, onSuccess }) {
  const { getAccessTokenSilently } = useAuth0();
  const api = createApi({ getAccessTokenSilently });
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  async function uploadFile(file) {
  try {
    const fileName = `faults/${productId}_${Date.now()}_${file.name}`;
    const contentType = file.type || 'application/octet-stream';

    const { upload_url, file_url } = await api.getPresignedUrl(fileName, contentType);

    const res = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('S3 Upload Failed:', res.status, errorText);
      throw new Error('S3 Upload Failed');
    }

    return file_url;
  } catch (err) {
    console.error('Upload Error:', err);
    throw new Error('Failed to upload image');
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!imageFile) {
      setError('Please upload an image of the fault');
      return;
    }

    setUploading(true);
    let imageUrl;

    try {
      imageUrl = await uploadFile(imageFile);
    } catch (uploadErr) {
      setUploading(false);
      setError(uploadErr.message);
      return;
    }

    setUploading(false);
    setSubmitting(true);

    try {
      await api.reportFault(productId, {
        description,
        image_url: imageUrl,
        created_by: 1,
      });
      setSuccessMsg('Fault reported successfully!');
      setDescription('');
      setImageFile(null);
      if (onSuccess) onSuccess();
    } catch (submitErr) {
      setError('Failed to submit fault report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fault-form-container">
      <h3 className="form-title">Report Fault</h3>
      <form onSubmit={handleSubmit} className="fault-form">
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the fault"
            disabled={uploading || submitting}
          />
        </div>

        <div className="form-group file-upload-wrapper">
          <label>Upload Image</label>
          <div className="custom-file-button">
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={uploading || submitting}
            />
          </div>
          {imageFile && <p className="selected-file-name">{imageFile.name}</p>}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={uploading || submitting}
        >
          {uploading
            ? 'Uploading Image...'
            : submitting
            ? 'Submitting...'
            : 'Submit Fault'}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
      {successMsg && <p className="form-success">{successMsg}</p>}
    </div>
  );
}

FaultReportForm.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSuccess: PropTypes.func,
};

export default FaultReportForm;
